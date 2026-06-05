import "dotenv/config";

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import OpenAI from "openai";
import Stripe from "stripe";
import admin from "firebase-admin";
import path from "path";
import multer from "multer";

import {
  sendWelcomeEmail,
  sendKeysAddedEmail
} from "./services/email";
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

  if (length <= ONE_KEY_LIMIT) {
    return { keys: 1, requiresSplit: false };
  }

  if (length <= TWO_KEY_LIMIT) {
    return { keys: 2, requiresSplit: false };
  }

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
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
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

      // ✅ PDF
      else if (name.endsWith(".pdf")) {
        const { PDFParse }: any = require("pdf-parse");

        const parser = new PDFParse({
          data: file.buffer,
        });

        const parsed = await parser.getText();

        text = parsed?.text || "";

        console.log("📄 PDF parsed characters:", text.length);
      }

      // ✅ DOCX
      else if (name.endsWith(".docx")) {
        const result = await mammoth.extractRawText({
          buffer: file.buffer,
        });

        text = result.value || "";
      }

      // ✅ CSV
      else if (name.endsWith(".csv")) {
        const csvText = file.buffer.toString("utf8");

        const records = parse(csvText, {
          skip_empty_lines: true,
        });

        text = records
          .map((row: string[]) => row.join(" "))
          .join("\n");
      }

      // ✅ XLSX
      else if (
        name.endsWith(".xlsx") ||
        name.endsWith(".xls")
      ) {
        const workbook = XLSX.read(file.buffer, {
          type: "buffer",
        });

        text = workbook.SheetNames.map((sheetName: string) => {
          const sheet = workbook.Sheets[sheetName];

          return XLSX.utils.sheet_to_csv(sheet);
        }).join("\n");
      }

      // ❌ Unsupported file
      else {
        throw new ApiError(
          "UNSUPPORTED_FILE",
          "Unsupported file type. Please upload PDF, TXT, DOCX, CSV, or XLSX.",
          400
        );
      }

      text = text.trim();

      if (!text) {
        throw new ApiError(
          "EMPTY_DOCUMENT",
          "No readable text found in document.",
          400
        );
      }

      return res.json({
        success: true,
        text,
      });
    } catch (error) {
      next(error);
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
console.log("LANGUAGE RECEIVED:", language);

      const languageNames = {
        en: "English",
        es: "Spanish",
        vi: "Vietnamese",
        tl: "Tagalog",
        fr: "French",
    };

const selectedLanguage =
  languageNames[language as keyof typeof languageNames] ||
  "English";

      console.log("LANGUAGE RECEIVED:", language);

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
2. Identify important items and categorize them.
3. Build the complete final response.
4. If the selected language is not English, translate the COMPLETE final response into the selected language.

Translation must occur LAST.

Everything visible to the user must be translated, including:
- Section titles
- Category titles
- Bullet items
- Important Items
- Explanations

No mixed-language output is allowed.

Do not provide legal, medical, financial, or professional advice.
Do not draft a professional response.
Do not tell the user what decision to make.

Output format:

## Simplified Explanation
Explain the document in plain language.

## Translation

Build a complete response in the selected language.

If English:
- Output in English.

If not English:
- Output entirely in the selected language.
- Do not include any English text.
- Do not include a separate Translation section.

- Translate the ENTIRE simplified explanation into the selected language.
- Translate ALL section headers.
- Translate ALL Important Items categories.
- Output EVERYTHING after simplification in the selected language.

If the selected language IS English, write:
No translation needed.

## Important Items

### 🟥 Critical
Items that could cause serious consequences, loss of rights, loss of benefits, missed deadlines, financial harm, denial, termination, eviction, or urgent required action.

### 🟧 Urgent
Items that need action soon, including deadlines, responses, documents, calls, appointments, signatures, payments, or follow-up.

### 🟨 Important
Useful details the user should understand, remember, save, or review.

Formatting rules:
- Use the colored square in each section header.
- Do not use triangles.
- Do not use warning icons.
- Do not substitute different emojis.
- Use 🟥 only for Critical.
- Use 🟧 only for Urgent.
- Use 🟨 only for Important.
- Keep the square icons visually consistent.

If any section has no items, write: None found.
`.trim(),
},
  {
    role: "user",
    content: `Selected language: ${selectedLanguage}

You MUST respond fully in the selected language when it is not English.

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

        const current = doc.data()?.keyBalance ?? 0;
        console.log("CURRENT BALANCE:", current);
        console.log("KEYS REQUIRED:", keys);
        console.log("USER DATA:", doc.data()); 

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
    if (!stripe) {
      return res.status(200).end();
    }

    const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);

      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.userId;
        const keys = Number(session.metadata?.keys || 0);
        const customerEmail = session.customer_details?.email || "";

        if (!userId || !keys) {
          console.error("Missing userId or keys in Stripe metadata");

          return res.status(400).json({
            error: "Missing metadata",
          });
        }

        // Add Keys to Firestore
        await db.collection("users").doc(userId).update({
          keyBalance: admin.firestore.FieldValue.increment(keys),
        });

        console.log(`Added ${keys} Keys to user ${userId}`);

        // Send confirmation email
        if (customerEmail) {
          await sendKeysAddedEmail(customerEmail);

          console.log(`Confirmation email sent to ${customerEmail}`);
        }
      }

      return res.json({ received: true });

    } catch (error) {
      console.error("Webhook processing failed:", error);

      return res.status(500).json({
        error: "Webhook processing failed",
      });
    }
  }
);
app.post(
  "/api/send-welcome-email",
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: "Email required",
        });
      }

      await sendWelcomeEmail(email);

      console.log(`Welcome email sent to ${email}`);

      return res.json({
        success: true,
      });

    } catch (error) {
      console.error("Welcome email failed:", error);

      return res.status(500).json({
        error: "Failed to send welcome email",
      });
    }
  }
);

app.get(
  "/api/key-balance",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.uid;

      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      console.log("KEY BALANCE UID:", userId);

      const doc = await db.collection("users").doc(userId).get();

      console.log("FIRESTORE DATA:", doc.data());

      if (!doc.exists) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const userData = doc.data() || {};

      const keyBalance = userData.keyBalance ?? 0;
      const feedbackAccepted = userData.feedbackAccepted ?? false;
      const feedbackDeclines = userData.feedbackDeclines ?? 0;

        return res.json({
          keyBalance,
          feedbackAccepted,
          feedbackDeclines,
      });

    } catch (error) {
      console.error("Failed to fetch key balance:", error);

      return res.status(500).json({
        error: "Failed to fetch key balance",
      });
    }
  }
);
app.post(
  "/api/feedback-submit",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.uid;

      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const { feedback } = req.body;

      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const userData = userDoc.data() || {};

      if (userData.feedbackAccepted === true) {
        return res.status(400).json({
          error: "Bonus Key already claimed",
        });
      }

      await db.collection("feedback").add({
        userId,
        feedback: feedback || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await userRef.update({
        feedbackAccepted: true,
        keyBalance: admin.firestore.FieldValue.increment(1),
      });

      const updatedUser = await userRef.get();

      return res.json({
        success: true,
        keyBalance: updatedUser.data()?.keyBalance ?? 1,
      });
    } catch (error) {
      console.error("Feedback submit failed:", error);

      return res.status(500).json({
        error: "Failed to submit feedback",
      });
    }
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