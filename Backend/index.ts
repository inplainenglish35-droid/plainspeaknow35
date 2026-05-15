import "dotenv/config";

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import OpenAI from "openai";
import Stripe from "stripe";
import admin from "firebase-admin";
import path from "path";
import multer from "multer";

import { requireAuth, AuthenticatedRequest } from "./requireAuth";
import { db } from "./firebaseAdmin";
import { errorHandler } from "./middleware/errorHandler";
import { ApiError } from "./middleware/ApiError";
import { enforceRateLimits } from "./rateLimiter";

const mammoth = require("mammoth");
const XLSX = require("xlsx");
const { parse } = require("csv-parse/sync");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:8080",
      "https://plainspeaknow.net",
      "https://www.plainspeaknow.net",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

app.options("*", cors());

app.use((req, res, next) => {
  if (req.originalUrl === "/webhook") return next();
  express.json({ limit: "15mb" })(req, res, next);
});

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string)
    ),
  });
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

const CHARS_PER_PAGE = 4000;
const ONE_KEY_LIMIT = 35 * CHARS_PER_PAGE;
const TWO_KEY_LIMIT = 70 * CHARS_PER_PAGE;

function calculateKeyCost(text: string) {
  const length = text.length;
  if (length <= ONE_KEY_LIMIT) return { keys: 1, requiresSplit: false };
  if (length <= TWO_KEY_LIMIT) return { keys: 2, requiresSplit: false };
  return { keys: 2, requiresSplit: true };
}

function isPdfFile(file: Express.Multer.File) {
  return (
    file.mimetype === "application/pdf" ||
    file.originalname.toLowerCase().endsWith(".pdf")
  );
}

/* =========================
   TEXT EXTRACTION
========================= */

app.post(
  "/api/extract-text",
  requireAuth,
  upload.single("file"),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new ApiError("NO_FILE", "No file uploaded", 400);
      }

      const file = req.file;
      let text = "";

      console.log("📄 File received:", {
        name: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      });

      const name = file.originalname.toLowerCase();

      // ❌ BLOCK IMAGES
      if (file.mimetype.startsWith("image/")) {
        throw new ApiError(
          "UNSUPPORTED_IMAGE",
          "Photos and screenshots are not supported. Please upload a text-based document.",
          400
        );
      }

      // ✅ TXT
      if (name.endsWith(".txt")) {
        text = file.buffer.toString("utf8");
      }

     // ✅ PDF (text only)
else if (name.endsWith(".pdf")) {
  const runtimePdfParse: any = require("pdf-parse");

  console.log("runtimePdfParse:", runtimePdfParse);
  console.log("typeof runtimePdfParse:", typeof runtimePdfParse);
  console.log("pdfParse keys:", Object.keys(runtimePdfParse));

  const parser =
    runtimePdfParse.default?.default ||
    runtimePdfParse.default ||
    runtimePdfParse.pdfParse ||
    runtimePdfParse.PDFParse ||
    runtimePdfParse;

  console.log("typeof parser:", typeof parser);

  const parsed = await parser(file.buffer);

  text = parsed?.text || "";

  console.log("📄 PDF parsed characters:", text.length);
}

      // ✅ DOCX
      else if (name.endsWith(".docx")) {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        text = result.value || "";
      }

      // ✅ CSV
      else if (name.endsWith(".csv")) {
        const records = parse(file.buffer.toString("utf8"));
        text = records.map((row: any[]) => row.join(" ")).join("\n");
      }

      // ✅ XLSX
      else if (name.endsWith(".xlsx")) {
        const workbook = XLSX.read(file.buffer, { type: "buffer" });
        const sheets = workbook.SheetNames;

        text = sheets
          .map((sheetName: string) => {
            const sheet = workbook.Sheets[sheetName];
            return XLSX.utils.sheet_to_csv(sheet);
          })
          .join("\n");
      }

      // ❌ EVERYTHING ELSE
      else {
        throw new ApiError(
          "UNSUPPORTED_FILE",
          "Unsupported file type. Use PDF, TXT, DOCX, CSV, or XLSX.",
          400
        );
      }

      const cleanText = text.trim();

      if (!cleanText) {
        throw new ApiError(
          "NO_TEXT_FOUND",
          "No readable text found. Scanned PDFs and images are not supported.",
          400
        );
      }

      res.json({ text: cleanText });
    } catch (err) {
      next(err);
    }
  }
);

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
      const { text, language = "en" } = req.body;

      if (!userId) throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);

      if (!text || typeof text !== "string") {
        throw new ApiError("INVALID_PAYLOAD", "Text required", 400);
      }

      const rate = enforceRateLimits(userId, ip);
      if (!rate.ok) {
        throw new ApiError(rate.code, "Too many requests", 429);
      }

      const { keys, requiresSplit } = calculateKeyCost(text);

      if (requiresSplit) {
        throw new ApiError(
          "DOCUMENT_TOO_LARGE",
          "This document is too long. Please split it into smaller parts.",
          400
        );
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 1200,
        messages: [
  {
    role: "system",
    content: `
You are Plainspeak Now™, a plain-language document helper.

Your job:
1. Simplify the document in clear, everyday language.
2. Translate the simplified explanation only if the selected language is not English.
3. Identify important items and categorize them.

Do not provide legal, medical, financial, or professional advice.
Do not draft a professional response.
Do not tell the user what decision to make.

Output format:

## Simplified Explanation
Explain the document in plain language.

## Translation
If translation is needed, provide the translated simplified explanation.
If no translation is needed, write: No translation needed.

## Important Items

### 🔺 Critical
Items that could cause serious consequences, loss of rights, loss of benefits, missed deadlines, financial harm, denial, termination, eviction, or urgent required action.

### 🟧 Urgent
Items that need action soon, including deadlines, responses, documents, calls, appointments, signatures, payments, or follow-up.

### 🟨 Important
Useful details the user should understand, remember, save, or review.

If any section has no items, write: None found.
`.trim(),
  },
  {
    role: "user",
    content: `Selected language: ${language}

Text:
${text}`,
  },
],
      });

      const output = completion.choices?.[0]?.message?.content?.trim() || "";

      if (!output) {
        throw new ApiError("AI_FAILURE", "No response from AI", 502);
      }

      let remainingKeys = 0;

      await db.runTransaction(async (tx) => {
        const ref = db.collection("users").doc(userId);
        const doc = await tx.get(ref);

        if (!doc.exists) {
          throw new ApiError("USER_NOT_FOUND", "User missing", 404);
        }

        const current = doc.data()?.keyBalance || 0;

        if (current < keys) {
          throw new ApiError("INSUFFICIENT_KEYS", "Not enough keys", 402);
        }

        remainingKeys = current - keys;
        tx.update(ref, { keyBalance: remainingKeys });
      });

      res.json({
        output,
        keysUsed: keys,
        remainingKeys,
      });
    } catch (err) {
      next(err);
    }
  }
);

/* =========================
   AUDIO
========================= */

app.post(
  "/api/generate-audio",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string") {
        throw new ApiError("INVALID_PAYLOAD", "Text required", 400);
      }

      const audio = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: "alloy",
        input: text.slice(0, 12000),
        response_format: "mp3",
      });

      const buffer = Buffer.from(await audio.arrayBuffer());

      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", buffer.length.toString());
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  }
);

/* =========================
   STRIPE CHECKOUT
========================= */

app.post(
  "/api/create-checkout-session",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!stripe) {
        throw new ApiError("STRIPE_DISABLED", "Payments unavailable", 503);
      }

      const userId = req.uid;
      const { packSize } = req.body;

if (packSize !== "2") {
  throw new ApiError("INVALID_PACK", "Invalid pack", 400);
}

const selected = {
  keys: 2,
  price: 600,
};

      if (!selected) {
        throw new ApiError("INVALID_PACK", "Invalid pack", 400);
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "2 Plainspeak Now™ Keys",
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
   STRIPE WEBHOOK
========================= */

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    if (!stripe) return res.status(200).end();

    const sig = req.headers["stripe-signature"] as string;

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err: any) {
      return res.status(400).send(err.message);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const keys = Number(session.metadata?.keys || 0);

      if (!userId || !keys) return res.status(400).end();

      await db.collection("users").doc(userId).update({
        keyBalance: admin.firestore.FieldValue.increment(keys),
      });
    }

    res.json({ received: true });
  }
);

/* =========================
   API 404
========================= */

app.use("/api", (_req, res) => {
  res.status(404).json({
    error: "API route not found",
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use(errorHandler);

/* =========================
   STATIC FRONTEND
========================= */

const frontendPath = path.join(__dirname, "../../frontend/client-dist");

app.use(express.static(frontendPath));

app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/* =========================
   START
========================= */

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});