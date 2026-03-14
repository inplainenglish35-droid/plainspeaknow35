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

/* =========================
   CLIENTS
========================= */
console.log("OPENAI KEY LOADED:", process.env.OPENAI_API_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
      const { text, mode } = req.body;

      if (!userId) {
        throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
      }

      if (!text || typeof text !== "string") {
        throw new ApiError("INVALID_PAYLOAD", "Text required");
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
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