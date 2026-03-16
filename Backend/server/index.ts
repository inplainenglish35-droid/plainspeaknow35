import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import OpenAI from "openai";
import multer from "multer";

import { requireAuth, AuthenticatedRequest } from "./requireAuth";
import { saveHistory } from "./saveHistory";
import { db } from "./firebaseAdmin";
import { extractTextFromImage, extractTextFromPDF } from "./utils/ocr";

import { errorHandler } from "./middleware/errorHandler";
import { ApiError } from "./middleware/ApiError";
import { enforceRateLimits } from "./rateLimiter";

/* =========================
   CLIENTS
========================= */
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is missing");
}

console.log("OPENAI key loaded");

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

app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

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

      const { text, mode } = req.body;

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

      if (text.length > 20000) {
        throw new ApiError("TEXT_TOO_LARGE", "Document too large");
      }

      /* VALIDATE MODE */
      const allowedModes = ["understand", "organize", "respond"];

      if (mode && !allowedModes.includes(mode)) {
        throw new ApiError("INVALID_MODE", "Invalid mode");
      }

      /* OPENAI CALL */
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content:
              "Rewrite complex documents into clear, calm plain language that the average person can understand.",
          },
          {
            role: "user",
            content: text,
          },
        ],
      });

      const output =
        completion.choices?.[0]?.message?.content?.trim() || "";

      await saveHistory({
        userId,
        inputText: text,
        outputText: output,
        mode,
      });

      res.json({ output });

    } catch (err) {
      next(err);
    }
  }
);

/* =========================
   ERROR HANDLER (LAST)
========================= */

app.use(errorHandler);

/* =========================
   START SERVER
========================= */

const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});