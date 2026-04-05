import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";

import cors from "cors";
import OpenAI from "openai";
import multer from "multer";

import { requireAuth, AuthenticatedRequest } from "./requireAuth";
import { saveHistory } from "./saveHistory";
import { db } from "./firebaseAdmin";

import { errorHandler } from "./middleware/errorHandler";
import { ApiError } from "./middleware/ApiError";
import { enforceRateLimits } from "./rateLimiter";

/* =========================
   CLIENTS
========================= */

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is missing");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY missing");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

/* =========================
   FILE UPLOAD
========================= */

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

/* =========================
   EXPRESS SETUP
========================= */

const app = express();

/* 🔥 DEFINE CORS OPTIONS FIRST */
const corsOptions = {
  origin: [
    "https://plainspeak-now.vercel.app",
    "https://plainspeaknow.net",
    "https://www.plainspeaknow.net",
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

/* 🔥 CORS FIRST — BEFORE EVERYTHING */
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* 🔥 HARD FAILSAFE (ensures headers ALWAYS present) */
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://plainspeak-now.vercel.app"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* THEN everything else */
app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

/* =========================
   KEY LOGIC
========================= */

const CHARS_PER_PAGE = 4000;
const ONE_KEY_LIMIT = 35 * CHARS_PER_PAGE;
const TWO_KEY_LIMIT = 70 * CHARS_PER_PAGE;

function calculateKeyCost(text: string) {
  const length = text.length;

  if (length <= ONE_KEY_LIMIT) {
    return { keys: 1, requiresSplit: false };
  }

  if (length <= TWO_KEY_LIMIT) {
    return { keys: 2, requiresSplit: false };
  }

  return { keys: 2, requiresSplit: true };
}

async function getUserKeyBalance(userId: string): Promise<number> {
  const doc = await db.collection("users").doc(userId).get();

  if (!doc.exists) {
    throw new ApiError("USER_NOT_FOUND", "User not found");
  }

  return doc.data()?.keyBalance || 0;
}

async function deductKeys(userId: string, keys: number) {
  const userRef = db.collection("users").doc(userId);

  await db.runTransaction(async (tx) => {
    const doc = await tx.get(userRef);

    if (!doc.exists) {
      throw new ApiError("USER_NOT_FOUND", "User not found");
    }

    const current = doc.data()?.keyBalance || 0;

    if (current < keys) {
      throw new ApiError("INSUFFICIENT_KEYS", "Not enough keys");
    }

    tx.update(userRef, {
      keyBalance: current - keys,
    });

    tx.set(db.collection("keyTransactions").doc(), {
      userId,
      change: -keys,
      type: "usage",
      createdAt: new Date(),
    });
  });
}

/* =========================
   SIMPLIFY (NEW BRAIN 🧠)
========================= */

app.post(
  "/api/simplify",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.uid;
      const ip = req.ip;

      const { text, language = "en" } = req.body;

      if (!userId) {
        throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
      }

      /* RATE LIMIT */
      const rate = enforceRateLimits(userId, ip);
      if (!rate.ok) {
        throw new ApiError(rate.code, "Too many requests", 429);
      }

      /* VALIDATE INPUT */
      if (!text || typeof text !== "string") {
        throw new ApiError("INVALID_PAYLOAD", "Text required");
      }

      /* LANGUAGE VALIDATION */
      const allowedLanguages = ["en", "es", "vi", "tl"];
      if (!allowedLanguages.includes(language)) {
        throw new ApiError("INVALID_LANGUAGE", "Invalid language");
      }

      /* LANGUAGE MAP */
      const languageMap: Record<string, string> = {
        en: "English",
        es: "Spanish",
        vi: "Vietnamese",
        tl: "Tagalog",
      };

      const targetLanguage = languageMap[language] || "English";

      /* KEY CALCULATION */
      const { keys, requiresSplit } = calculateKeyCost(text);

      if (requiresSplit) {
        throw new ApiError(
          "DOCUMENT_TOO_LARGE",
          "This document is too long. Please split it."
        );
      }

      const balance = await getUserKeyBalance(userId);

      if (balance < keys) {
        throw new ApiError(
          "INSUFFICIENT_KEYS",
          `This document requires ${keys} key(s), but you only have ${balance}.`
        );
      }

      /* =========================
         🧠 SYSTEM PROMPT
      ========================= */

      const systemPrompt = `
You are Plainspeak Now.

Your job is to help a regular person understand a complex document.

-----------------------------------
PROCESS
-----------------------------------

1. Identify the document type:
   - IEP / Education
   - Legal
   - Medical
   - Financial
   - General

2. Rewrite clearly in simple, calm language.

3. Translate FULL result into ${targetLanguage} if needed.

-----------------------------------
OUTPUT FORMAT (STRICT)
-----------------------------------

DOCUMENT TYPE: <type>

DOCUMENT SUMMARY:
<short summary>

KEY POINTS:
- <bullet>
- <bullet>

WHAT MATTERS MOST:
<simple explanation>

-----------------------------------
RULES
-----------------------------------

- Use simple, clear language
- Keep sentences short
- Do NOT give legal or medical advice
- Do NOT include original text
- Do NOT explain what you did

-----------------------------------
LANGUAGE RULES
-----------------------------------

- Final output must be 100% ${targetLanguage}
- Do NOT mix languages

-----------------------------------
OUTPUT ONLY FINAL RESULT
-----------------------------------
`;

/* OPENAI CALL */
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  temperature: 0.2,
  max_tokens: 1200,
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: text },
  ],
});

const output =
  completion.choices?.[0]?.message?.content?.trim() || "";

/* 🧪 VALIDATION GATE (CRITICAL — BEFORE KEY DEDUCTION) */
if (
  !output ||
  !/DOCUMENT TYPE:/i.test(output) ||
  !/DOCUMENT SUMMARY:/i.test(output) ||
  !/KEY POINTS:/i.test(output) ||
  !/WHAT MATTERS MOST:/i.test(output)
) {
  throw new ApiError(
    "INVALID_OUTPUT",
    "AI response did not match required format."
  );
}

/* OPTIONAL: Language sanity check (lightweight) */
if (targetLanguage !== "en") {
  const hasEnglish = /[a-zA-Z]/.test(output);
  if (targetLanguage !== "en" && hasEnglish) {
    throw new ApiError(
      "LANGUAGE_MISMATCH",
      "Output contains mixed or incorrect language."
    );
  }
}

/* EXTRACT DOCUMENT TYPE */
const typeMatch = output.match(/DOCUMENT TYPE:\s*(.*)/i);
const docType = typeMatch ? typeMatch[1].trim() : null;

/* ✅ DEDUCT KEYS (ONLY AFTER VALID SUCCESS) */
await deductKeys(userId, keys);

/* 🔄 FETCH UPDATED USER STATE (POST-DEDUCTION) */
const userRef = db.collection("users").doc(userId);
const userDoc = await userRef.get();
const userData = userDoc.data();

/* 🔥 FEEDBACK TRIGGER (POST-DEDUCTION ONLY) */
const shouldOfferFeedback =
  userData &&
  userData.keyBalance === 0 &&
  !userData.feedbackAccepted &&
  (userData.feedbackDeclines || 0) < 3;

/* SAVE HISTORY */
await saveHistory({
  userId,
  inputText: text,
  outputText: output,
  docType,
  language,
});

/* RESPONSE */
res.json({
  output,
  keysUsed: keys,
  remainingKeys: userData?.keyBalance ?? 0,
  shouldOfferFeedback,
});
    } catch (err) {
      next(err);
    }  }
);