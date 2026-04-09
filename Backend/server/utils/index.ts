import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import OpenAI from "openai";

import { requireAuth, AuthenticatedRequest } from "../requireAuth";
import { db } from "../firebaseAdmin";
import Stripe from "stripe";
import { errorHandler } from "../middleware/errorHandler";
import { ApiError } from "../middleware/ApiError";
import { enforceRateLimits } from "../rateLimiter";

/* =========================
   APP INIT
========================= */

const app = express();

/* =========================
   CORS (SINGLE SOURCE OF TRUTH)
========================= */

const allowedOrigins = [
  "https://plainspeak-now.vercel.app",
  "https://plainspeaknow.net",
  "https://www.plainspeaknow.net",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server or curl (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// 🔥 Ensure preflight is always handled
app.options("*", cors());

/* =========================
   MIDDLEWARE
========================= */

app.use(express.json());

/* =========================
   ENV CHECKS
========================= */

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is missing");
}

/* =========================
   CLIENTS
========================= */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

/* =========================
   EXTRACT TEXT (TEMP MOCK)
========================= */

app.post(
  "/api/extract-text",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // TEMP: return mock response so frontend works
      return res.json({
        text: "File received successfully (mock). OCR coming soon.",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Failed to extract text",
      });
    }
  }
);

/* =========================
   KEY LOGIC
========================= */

const CHARS_PER_PAGE = 4000;
const ONE_KEY_LIMIT = 35 * CHARS_PER_PAGE;
const TWO_KEY_LIMIT = 70 * CHARS_PER_PAGE;

function calculateKeyCost(text: string) {
  const length = text.length;

  if (length <= ONE_KEY_LIMIT) return { keys: 1, requiresSplit: false };
  if (length <= TWO_KEY_LIMIT) return { keys: 2, requiresSplit: false };

  return { keys: 2, requiresSplit: true };
}

/* =========================
   SIMPLIFY
========================= */

app.post(
  "/api/simplify",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.uid;
      const ip = req.ip;

      const {
        text,
        language = "en",
      }: {
        text: string;
        language: "en" | "es" | "vi" | "tl";
      } = req.body;

      if (!userId) {
        throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
      }

      /* RATE LIMIT */
      const rate = enforceRateLimits(userId, ip);
      if (!rate.ok) {
        throw new ApiError(rate.code, "Too many requests", 429);
      }

      if (!text || typeof text !== "string") {
        throw new ApiError("INVALID_PAYLOAD", "Text required");
      }

      const allowedLanguages = ["en", "es", "vi", "tl"] as const;
      if (!allowedLanguages.includes(language)) {
        throw new ApiError("INVALID_LANGUAGE", "Invalid language");
      }

      const languageMap: Record<string, string> = {
        en: "English",
        es: "Spanish",
        vi: "Vietnamese",
        tl: "Tagalog",
      };

      const targetLanguage = languageMap[language];

      /* KEY CALCULATION */
      const { keys, requiresSplit } = calculateKeyCost(text);

      if (requiresSplit) {
        throw new ApiError("DOCUMENT_TOO_LARGE", "Please split document.");
      }

      /* PROMPT */
      const systemPrompt = `You are Plainspeak Now...
(keep your existing prompt exactly here)
Ensure the final output is fully written in ${targetLanguage}.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 1200,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
      });

      const rawOutput = completion.choices?.[0]?.message?.content;

      if (!rawOutput || typeof rawOutput !== "string") {
        throw new ApiError("AI_FAILURE", "No response from AI.");
      }

      const output = rawOutput.trim();

      /* STRUCTURE VALIDATION */
      if (
        !/DOCUMENT TYPE:/i.test(output) ||
        !/DOCUMENT SUMMARY:/i.test(output) ||
        !/KEY POINTS:/i.test(output) ||
        !/WHAT MATTERS MOST:/i.test(output)
      ) {
        throw new ApiError("INVALID_OUTPUT", "Bad AI response format.");
      }

/* =========================
   LANGUAGE VALIDATION
========================= */

function basicLanguageCheck(text: string, lang: string) {
  if (lang === "es") return /[áéíóúñ¿¡]/i.test(text);
  if (lang === "vi") return /[ăâđêôơư]/i.test(text);
  return true;
}

if (!basicLanguageCheck(output, language)) {
  throw new ApiError(
    "LANGUAGE_MISMATCH",
    "Output not in expected language."
  );
}

const typeMatch = output.match(/DOCUMENT TYPE:\s*(.*)/i);
const docType = typeMatch ? typeMatch[1].trim() : null;

/* =========================
   ATOMIC TRANSACTION (SIMPLIFY)
========================= */

let remainingKeys = 0;
let shouldOfferFeedback = false;

await db.runTransaction(async (transaction) => {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await transaction.get(userRef);

  if (!userDoc.exists) {
    throw new ApiError("USER_NOT_FOUND", "User does not exist.");
  }

  const userData = userDoc.data()!;
  const currentKeys = userData.keyBalance || 0;

  if (currentKeys < keys) {
    throw new ApiError("INSUFFICIENT_KEYS", "Not enough keys.");
  }

  remainingKeys = currentKeys - keys;

  transaction.update(userRef, {
    keyBalance: remainingKeys,
  });

  const historyRef = userRef.collection("history").doc();
  transaction.set(historyRef, {
    inputText: text,
    outputText: output,
    docType,
    language,
    keysUsed: keys,
    createdAt: new Date(),
  });

  shouldOfferFeedback =
    remainingKeys === 0 &&
    !userData.feedbackAccepted &&
    (userData.feedbackDeclines || 0) < 3;
});

res.json({
  output,
  keysUsed: keys,
  remainingKeys,
  shouldOfferFeedback,
});
    } catch (err) {
      next(err);
    }
  }
);

/* =========================
   FEEDBACK
========================= */

app.post(
  "/api/feedback",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.uid;
      const ip = req.ip;

      if (!userId) {
        throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
      }

      /* RATE LIMIT */
      const rate = enforceRateLimits(userId, ip);
      if (!rate.ok) {
        throw new ApiError(rate.code, "Too many requests", 429);
      }

      const userRef = db.collection("users").doc(userId);
      let newBalance = 0;

      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists) {
          throw new ApiError("USER_NOT_FOUND", "User does not exist.");
        }

        const userData = userDoc.data()!;

        if (userData.feedbackAccepted) {
          throw new ApiError(
            "FEEDBACK_ALREADY_USED",
            "Feedback reward already claimed."
          );
        }

        newBalance = (userData.keyBalance || 0) + 1;

        transaction.update(userRef, {
          keyBalance: newBalance,
          feedbackAccepted: true,
        });

        transaction.set(db.collection("keyTransactions").doc(), {
          userId,
          change: +1,
          type: "feedback_reward",
          createdAt: new Date(),
        });
      });

      res.json({
        success: true,
        newKeyBalance: newBalance,
      });
    } catch (err) {
      next(err);
    }
  }
);

/* =========================
   STRIPE SETUP
========================= */

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY missing");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
});

/* =========================
   CHECKOUT
========================= */

app.post(
  "/api/create-checkout-session",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.uid;

      if (!userId) {
        throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
      }

      const { pack } = req.body;

      const packs = {
        small: { keys: 6, price: 1800 },
        medium: { keys: 15, price: 4200 },
        large: { keys: 30, price: 7800 },
      };

      const selected = packs[pack as keyof typeof packs];

      if (!selected) {
        throw new ApiError("INVALID_PACK", "Invalid key pack");
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${selected.keys} Plainspeak Keys`,
              },
              unit_amount: selected.price,
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId,
          keys: selected.keys.toString(),
        },
        success_url: "https://plainspeaknow.net/success",
        cancel_url: "https://plainspeaknow.net/pricing",
      });

      res.json({ url: session.url });
    } catch (err) {
      next(err);
    }
  }
);

/* =========================
   WEBHOOK (CRITICAL)
========================= */

app.post("/webhook", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const keys = Number(session.metadata?.keys || 0);

    if (!userId || !keys) return res.status(400).end();

    const eventRef = db.collection("stripeEvents").doc(event.id);

    await db.runTransaction(async (tx) => {
      const existing = await tx.get(eventRef);
      if (existing.exists) return;

      const userRef = db.collection("users").doc(userId);
      const userDoc = await tx.get(userRef);

      if (!userDoc.exists) throw new Error("User not found");

      const current = userDoc.data()?.keyBalance || 0;

      tx.update(userRef, {
        keyBalance: current + keys,
      });

      tx.set(eventRef, { createdAt: new Date() });

      tx.set(db.collection("keyTransactions").doc(), {
        userId,
        change: keys,
        type: "purchase",
        createdAt: new Date(),
      });
    });
  }

  res.json({ received: true });
});

/* =========================
   AUDIO
========================= */

app.post(
  "/api/generate-audio",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.uid;
      const ip = req.ip;
      const { text } = req.body;

      if (!userId) {
        throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
      }

      const rate = enforceRateLimits(userId, ip);
      if (!rate.ok) {
        throw new ApiError(rate.code, "Too many requests", 429);
      }

      if (!text || typeof text !== "string") {
        throw new ApiError("INVALID_PAYLOAD", "Text required");
      }

      const response = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: "alloy",
        input: text,
      });

      const buffer = Buffer.from(await response.arrayBuffer());

      res.setHeader("Content-Type", "audio/mpeg");
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  }
);

/* =========================
   ERROR HANDLER
========================= */

app.use(errorHandler);

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Plainspeak API running on port ${PORT}`);
});