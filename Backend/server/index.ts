import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import OpenAI from "openai";
import Stripe from "stripe";
import admin from "firebase-admin";
import { requireAuth, AuthenticatedRequest } from "./requireAuth";
import { db } from "./firebaseAdmin";
import { errorHandler } from "./middleware/errorHandler";
import { ApiError } from "./middleware/ApiError";
import { enforceRateLimits } from "./rateLimiter";

/* =========================
   APP INIT
========================= */

const app = express();

/* =========================
   CORS
========================= */

const allowedOrigins = [
  "https://plainspeak-now.vercel.app",
  "https://plainspeaknow.net",
  "https://www.plainspeaknow.net",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());

/* =========================
   MIDDLEWARE
========================= */

// ⚠️ IMPORTANT: webhook needs raw BEFORE json
app.use((req, res, next) => {
  if (req.originalUrl === "/webhook") return next();
  express.json()(req, res, next);
});

/* =========================
   ENV CHECKS
========================= */

if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY missing — AI disabled");
  process.exit(1);
}

/* =========================
   CLIENTS
========================= */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================
   STRIPE
========================= */

let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });
}

/* =========================
   HEALTH
========================= */

app.get("/api/health", (_req, res) => {
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
      const { text, language = "en" } = req.body;

      if (!userId) throw new ApiError("UNAUTHORIZED", "Unauthorized", 401);
      if (!text || typeof text !== "string")
        throw new ApiError("INVALID_PAYLOAD", "Text required");

      const rate = enforceRateLimits(userId, ip);
      if (!rate.ok)
        throw new ApiError(rate.code, "Too many requests", 429);

      const { keys, requiresSplit } = calculateKeyCost(text);
      if (requiresSplit)
        throw new ApiError("DOCUMENT_TOO_LARGE", "Split document.");

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 1200,
        messages: [
          { role: "system", content: "Simplify clearly." },
          { role: "user", content: text },
        ],
      });

      const output =
        completion.choices?.[0]?.message?.content?.trim() || "";

      if (!output)
        throw new ApiError("AI_FAILURE", "No response from AI");

      let remainingKeys = 0;

      await db.runTransaction(async (tx) => {
        const ref = db.collection("users").doc(userId);
        const doc = await tx.get(ref);

        if (!doc.exists)
          throw new ApiError("USER_NOT_FOUND", "User missing");

        const current = doc.data()?.keyBalance || 0;
        if (current < keys)
          throw new ApiError("INSUFFICIENT_KEYS", "Not enough keys");

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
   STRIPE CHECKOUT
========================= */

app.post(
  "/api/create-checkout-session",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!stripe)
        throw new ApiError("STRIPE_DISABLED", "Payments unavailable", 503);

      const userId = req.uid;
      const { pack } = req.body;

      const packs = {
        small: { keys: 6, price: 1800 },
        medium: { keys: 15, price: 4200 },
        large: { keys: 30, price: 7800 },
      };

      const selected = packs[pack as keyof typeof packs];
      if (!selected)
        throw new ApiError("INVALID_PACK", "Invalid pack");

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${selected.keys} Keys`,
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
   WEBHOOK (FIXED ORDER)
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
        process.env.STRIPE_WEBHOOK_SECRET!
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
   ERROR HANDLER
========================= */

app.use(errorHandler);

/* =========================
   START
========================= */

const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API running on ${PORT}`);
});