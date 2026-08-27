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
  sendKeysAddedEmail,
  sendSupportEmail
} from "./services/email";
import { requireAuth, AuthenticatedRequest } from "./requireAuth";
import { db } from "./firebaseAdmin";
import { errorHandler } from "./middleware/errorHandler";
import { ApiError } from "./middleware/ApiError";
import { enforceRateLimits } from "./rateLimiter";

const mammoth = require("mammoth");
const XLSX = require("xlsx");
const { parse } = require("csv-parse/sync");
const { extractTextFromImage } = require("./utils/ocr");

const app = express();

app.use(
  cors({
    origin: [
  "http://localhost:5173",
  "http://localhost:5174",
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
function splitDocumentIntoChunks(
  text: string,
  maxChars = 4000
): string[] {
  const normalizedText = text.trim();

  if (!normalizedText) {
    return [];
  }

  if (normalizedText.length <= maxChars) {
    return [normalizedText];
  }

  const paragraphs = normalizedText.split(/\n\s*\n/);
  const chunks: string[] = [];

  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const cleanParagraph = paragraph.trim();

    if (!cleanParagraph) {
      continue;
    }

    /*
     * If one unusually large paragraph is itself bigger
     * than maxChars, split it into smaller pieces.
     */
    if (cleanParagraph.length > maxChars) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }

      for (
        let start = 0;
        start < cleanParagraph.length;
        start += maxChars
      ) {
        chunks.push(
          cleanParagraph.slice(start, start + maxChars)
        );
      }

      continue;
    }

    const candidate = currentChunk
      ? `${currentChunk}\n\n${cleanParagraph}`
      : cleanParagraph;

    if (candidate.length > maxChars) {
      chunks.push(currentChunk.trim());
      currentChunk = cleanParagraph;
    } else {
      currentChunk = candidate;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
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

      // ✅ IMAGE OCR
if (file.mimetype.startsWith("image/")) {
  text = await extractTextFromImage(file.buffer);

  console.log("📷 Image OCR characters:", text.length);
}

      // ✅ TXT
      else if (name.endsWith(".txt")) {
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
          `Unsupported file type. Please upload PDF, TXT, DOCX, CSV, XLSX, or an image.`,
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
  zh: "Simplified Chinese",
  ko: "Korean",
  ar: "Arabic",
  pt: "Portuguese",
  ru: "Russian",
  ht: "Haitian Creole",
  hi: "Hindi",
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
      const documentChunks = splitDocumentIntoChunks(text);

    console.log("DOCUMENT LENGTH:", text.length);
    console.log("DOCUMENT CHUNKS:", documentChunks.length);

    documentChunks.forEach((chunk, index) => {
      console.log(
        `CHUNK ${index + 1}/${documentChunks.length} LENGTH:`,
        chunk.length
      );
    });

      const rewrittenChunks: string[] = [];
      let remainingKeys = 0;

      for (let i = 0; i < documentChunks.length; i++) {
        const chunk = documentChunks[i];

        console.log(
          `REWRITING CHUNK ${i + 1}/${documentChunks.length}`
        );

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `
You are Plainspeak Now™, a professional plain-language editor.

Rewrite the provided portion of the document in clear, everyday ${selectedLanguage}.

READING LEVEL:

• Aim for approximately a 6th-grade reading level.
• Prefer short, direct sentences and common everyday words.
• Break complicated sentences into shorter sentences when this does not change the meaning.
• Accuracy is more important than reading level.
• Never remove, weaken, or change important information just to make the text easier to read.
• Keep necessary legal, medical, financial, or technical terms, but explain them immediately in plain language.

IMPORTANT:

• Rewrite EVERY sentence.
• Preserve the original meaning, intent, and legal effect.
• Preserve every paragraph.
• Preserve headings.
• Preserve lists.
• Keep everything in the same order.
• Do NOT summarize.
• Do NOT shorten.
• Do NOT omit information.
• Do NOT combine paragraphs.
• Do NOT add commentary.
• Do NOT add a summary.
• Do NOT create a professional response.
• Do NOT create Critical, Urgent, or Important sections.

Replace difficult words with everyday language whenever possible.

If a legal, medical, or technical term must remain,
immediately explain it in simpler words.

Always preserve:

• Names
• Dates
• Dollar amounts
• Percentages
• Deadlines
• Definitions
• Conditions
• Exceptions
• Obligations
• Warnings
• Instructions

Return ONLY the rewritten portion of the document.
`.trim(),
            },
            {
              role: "user",
              content: chunk,
            },
          ],
          temperature: 0.2,
          max_tokens: 4000,
        });

        const choice = completion.choices?.[0];
        const output = choice?.message?.content?.trim() || "";
        const finishReason = choice?.finish_reason;

        console.log("OPENAI FINISH REASON:", finishReason);
        console.log("OPENAI OUTPUT LENGTH:", output.length);

        if (!output) {
          throw new ApiError("AI_FAILURE", "No response from AI", 502);
        }

        if (finishReason === "length") {
          console.error(
            "AI OUTPUT TRUNCATED: Model reached the maximum output token limit."
          );

          throw new ApiError(
            "AI_OUTPUT_TRUNCATED",
            "The document explanation was too long to complete. No Keys were used. Please try again.",
            502
          );
        }

        rewrittenChunks.push(output);
      }

    const plainLanguageRewrite = rewrittenChunks.join("\n\n");
    const analysisSourceChunks = splitDocumentIntoChunks(text);
    const analysisNotes: string[] = [];

    for (let i = 0; i < analysisSourceChunks.length; i++) {
      const chunk = analysisSourceChunks[i];

      console.log(
        `ANALYZING SOURCE CHUNK ${i + 1}/${analysisSourceChunks.length}`
      );

    const notesCompletion =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content: `
You are reviewing one portion of a larger document for Plainspeak Now™.

Extract ONLY information needed for later document analysis.

Identify:

• Whether this portion suggests the document reasonably calls for a response.
• Facts that would be useful in drafting that response.
• Critical items involving serious consequences, loss of rights, loss of benefits, financial harm, eviction, termination, legal consequences, denial of services, or mandatory deadlines.
• Urgent items such as deadlines, required responses, signatures, payments, submissions, appointments, phone calls, or follow-up actions.
• Important information such as definitions, instructions, contact information, reference dates, explanations, or useful background.

IMPORTANT:

• Do NOT rewrite the document.
• Do NOT summarize unrelated content.
• Do NOT draft the Professional Response yet.
• Do NOT invent facts.
• Preserve names, dates, amounts, deadlines, account or reference numbers, and other specific details exactly.
• If nothing relevant appears in this portion, return exactly: None found.

Return concise analysis notes only.
`.trim(),
        },
        {
          role: "user",
          content: chunk,
        },
      ],
    });

  const notesChoice = notesCompletion.choices?.[0];

  const notes =
    notesChoice?.message?.content?.trim() || "";

  console.log(
    `ANALYSIS SOURCE CHUNK ${i + 1} FINISH REASON:`,
    notesChoice?.finish_reason
  );

  if (!notes) {
    throw new ApiError(
      "AI_FAILURE",
      "Document analysis could not be completed. No Keys were used.",
      502
    );
  }

  if (notesChoice?.finish_reason === "length") {
    throw new ApiError(
      "AI_OUTPUT_TRUNCATED",
      "Document analysis could not be completed. No Keys were used.",
      502
    );
  }

  analysisNotes.push(notes);
}

const combinedAnalysisNotes =
  analysisNotes.join("\n\n---\n\n");
      const analysisCompletion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  temperature: 0.2,
  max_tokens: 2000,
  messages: [
    {
      role: "system",
      content: `
You are Plainspeak Now™, a professional document assistant.

Analyze the provided document.

Do NOT rewrite the document.
Do NOT summarize the document.
Do NOT repeat the document.

Your job is ONLY to produce:

1. A Professional Response, when appropriate.
2. Critical items.
3. Urgent items.
4. Important items.

Do not provide legal, medical, financial, or other professional advice.
Never tell the user what decision to make.

## Professional Response

Determine whether the document reasonably calls for a response.

A response may be appropriate for documents such as:

• Letters
• Emails
• Bills
• Collection notices
• Government correspondence
• School or IEP documents
• Insurance documents
• Healthcare correspondence
• Landlord or tenant notices
• Employment documents
• Customer service issues
• Business communications

If a response is appropriate, create a concise draft that:

• Is professional and respectful.
• Uses clear, everyday language.
• Matches the tone and purpose of the document.
• Is ready for the user to copy, edit, and send.
• Uses ONLY information contained in the document.
• Never invents facts.
• Never assumes missing information.
• Never admits fault, liability, or guilt.
• Never promises actions or outcomes.
• Never provides professional advice.
• Never tells the user what decision to make.

If information is needed from the user, use placeholders such as:

[Name]
[Date]
[Claim Number]
[Account Number]

If no response is appropriate, write:

No response appears necessary for this document.

## 🟥 Critical

List ONLY items that could result in:

• Loss of rights
• Loss of benefits
• Financial harm
• Eviction
• Termination
• Legal consequences
• Missed mandatory deadlines
• Denial of services
• Immediate required action with serious consequences

If none exist, write:

None found.

## 🟧 Urgent

List ONLY items requiring action soon, including:

• Deadlines
• Required responses
• Signatures
• Payments
• Documents to submit
• Appointments
• Phone calls
• Follow-up actions

If none exist, write:

None found.

## 🟨 Important

List useful information the user should understand or remember, including:

• Definitions
• Instructions
• Contact information
• Reference dates
• Explanations
• Helpful reminders
• Background information

If none exist, write:

None found.

Return ONLY these four sections, in this exact order:

## Professional Response

[response or "No response appears necessary for this document."]

## 🟥 Critical

[items or "None found."]

## 🟧 Urgent

[items or "None found."]

## 🟨 Important

[items or "None found."]
`.trim(),
    },
    {
      role: "user",
      content: combinedAnalysisNotes,
    },
  ],
});

const analysisChoice = analysisCompletion.choices?.[0];

const documentAnalysis =
  analysisChoice?.message?.content?.trim() || "";

const analysisFinishReason =
  analysisChoice?.finish_reason;

console.log(
  "ANALYSIS FINISH REASON:",
  analysisFinishReason
);

console.log(
  "ANALYSIS OUTPUT LENGTH:",
  documentAnalysis.length
);

if (!documentAnalysis) {
  throw new ApiError(
    "AI_FAILURE",
    "No document analysis was returned. No Keys were used.",
    502
  );
}

if (analysisFinishReason === "length") {
  throw new ApiError(
    "AI_OUTPUT_TRUNCATED",
    "The document analysis was too long to complete. No Keys were used. Please try again.",
    502
  );
}
let output = `## Plain Language Rewrite

${plainLanguageRewrite}

${documentAnalysis}`;

if (language !== "en") {
  console.log(
    `TRANSLATING FINAL OUTPUT TO: ${selectedLanguage}`
  );

  const translationChunks = splitDocumentIntoChunks(output);
  const translatedChunks: string[] = [];

  console.log(
    "TRANSLATION CHUNKS:",
    translationChunks.length
  );

  for (let i = 0; i < translationChunks.length; i++) {
    const chunk = translationChunks[i];

    console.log(
      `TRANSLATING CHUNK ${i + 1}/${translationChunks.length}`
    );

    const translationCompletion =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 4000,
        messages: [
          {
            role: "system",
            content: `
You are a professional translator for Plainspeak Now™.

Translate the provided text completely into ${selectedLanguage}.

IMPORTANT:

• Translate EVERYTHING.
• Do NOT summarize.
• Do NOT shorten.
• Do NOT omit information.
• Do NOT add information.
• Preserve the original meaning.
• Preserve names.
• Preserve dates.
• Preserve dollar amounts.
• Preserve percentages.
• Preserve deadlines.
• Preserve numbers.
• Preserve lists.
• Preserve paragraph structure.
• Preserve placeholders such as [Name], [Date], [Claim Number], and [Account Number].
• Preserve emojis such as 🟥, 🟧, and 🟨.
• Translate headings into ${selectedLanguage}.
• Use clear, natural, everyday ${selectedLanguage}.
• Aim for approximately a 6th-grade reading level when reasonably possible.
• Accuracy and completeness are more important than reading level.

Return ONLY the translated text.
`.trim(),
          },
          {
            role: "user",
            content: chunk,
          },
        ],
      });

    const translationChoice =
      translationCompletion.choices?.[0];

    const translatedChunk =
      translationChoice?.message?.content?.trim() || "";

    const translationFinishReason =
      translationChoice?.finish_reason;

    console.log(
      `TRANSLATION CHUNK ${i + 1} FINISH REASON:`,
      translationFinishReason
    );

    console.log(
      `TRANSLATION CHUNK ${i + 1} OUTPUT LENGTH:`,
      translatedChunk.length
    );

    if (!translatedChunk) {
      throw new ApiError(
        "AI_FAILURE",
        "Translation could not be completed. No Keys were used.",
        502
      );
    }

    if (translationFinishReason === "length") {
      throw new ApiError(
        "AI_OUTPUT_TRUNCATED",
        "The translation was too long to complete. No Keys were used. Please try again.",
        502
      );
    }

    translatedChunks.push(translatedChunk);
  }

  output = translatedChunks.join("\n\n");
}

      await db.runTransaction(async (tx) => {
        const ref = db.collection("users").doc(userId);
        const doc = await tx.get(ref);

        if (!doc.exists) {
          throw new ApiError("USER_NOT_FOUND", "User missing", 404);
        }

        const current = doc.data()?.keyBalance ?? 0;
        console.log("CURRENT BALANCE:", current);
        console.log("KEYS REQUIRED:", keys);
        

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
const splitTextForAudio = (
  text: string,
  maxChars = 5000
): string[] => {
  const normalized = text.trim();

  if (!normalized) return [];

  if (normalized.length <= maxChars) {
    return [normalized];
  }

  const chunks: string[] = [];
  let remaining = normalized;

  while (remaining.length > maxChars) {
    let splitAt = remaining.lastIndexOf("\n\n", maxChars);

    if (splitAt < maxChars * 0.5) {
      splitAt = remaining.lastIndexOf(". ", maxChars);
    }

    if (splitAt < maxChars * 0.5) {
      splitAt = remaining.lastIndexOf(" ", maxChars);
    }

    if (splitAt <= 0) {
      splitAt = maxChars;
    }

    const chunk = remaining.slice(0, splitAt).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) {
    chunks.push(remaining);
  }

  return chunks;
};
app.post(
  "/api/generate-audio",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { text, language } = req.body;

      if (!text || typeof text !== "string") {
        throw new ApiError("INVALID_PAYLOAD", "Text required", 400);
      }
const languageNames: Record<string, string> = {
  en: "English",
  es: "Spanish",
  vi: "Vietnamese",
  tl: "Tagalog",
  fr: "French",
  zh: "Simplified Chinese",
  ko: "Korean",
  ar: "Arabic",
  pt: "Portuguese",
  ru: "Russian",
  ht: "Haitian Creole",
  hi: "Hindi",
};

const audioLanguage = languageNames[language] || "English";
      const audioChunks = splitTextForAudio(text);

console.log("AUDIO CHUNKS:", audioChunks.length);

const buffers: Buffer[] = [];
const BATCH_SIZE = 3;

for (let i = 0; i < audioChunks.length; i += BATCH_SIZE) {
  const batch = audioChunks.slice(i, i + BATCH_SIZE);

  console.log(
    `GENERATING AUDIO BATCH ${Math.floor(i / BATCH_SIZE) + 1}`,
    `CHUNKS ${i + 1}-${Math.min(i + BATCH_SIZE, audioChunks.length)}/${audioChunks.length}`
  );

  const batchBuffers = await Promise.all(
    batch.map(async (chunk, batchIndex) => {
      const chunkNumber = i + batchIndex + 1;

      console.log(
        `GENERATING AUDIO CHUNK ${chunkNumber}/${audioChunks.length}`,
        "LENGTH:",
        chunk.length
      );

      const audio = await openai.audio.speech.create({
  model: "gpt-4o-mini-tts",
  voice: "alloy",
  input: chunk,
  instructions: `Speak naturally and clearly in ${audioLanguage}. Use accurate pronunciation and a calm, helpful tone appropriate for explaining an important document.`,
  response_format: "mp3",
});

      return Buffer.from(await audio.arrayBuffer());
    })
  );

  buffers.push(...batchBuffers);
}

const combinedBuffer = Buffer.concat(buffers);

      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Length": combinedBuffer.length,
      });
      return res.send(combinedBuffer);
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
app.post(
  "/api/support",
  async (req: Request, res: Response) => {
    console.log("SUPPORT REQUEST RECEIVED");

    try {
      const {
        type,
        name,
        organization,
        email,
        subject,
        message,
      } = req.body;

      console.log("CALLING sendSupportEmail()");

      await sendSupportEmail({
        type,
        name,
        organization,
        email,
        subject,
        message,
      });

      return res.json({
        success: true,
      });

    } catch (error) {
      console.error("Support request failed:", error);

      return res.status(500).json({
        error: "Failed to send support request",
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