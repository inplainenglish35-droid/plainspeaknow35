import vision from "@google-cloud/vision";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { exec } from "child_process";
import { promisify } from "util";


import pdfParse from "pdf-parse";

const execAsync = promisify(exec);


/* ---------------- GOOGLE VISION ---------------- */

const client = new vision.ImageAnnotatorClient({
  keyFilename: "secrets/firebase-service-account.json",
});

/* ---------------- IMAGE OCR ---------------- */

export async function extractTextFromImage(buffer: Buffer) {
  const [result] = await client.textDetection({
    image: { content: buffer },
  });

  const detections = result.textAnnotations;
  return detections?.[0]?.description ?? "";
}

/* ---------------- PDF OCR ---------------- */

export async function extractTextFromPDF(buffer: Buffer) {
  // 1️⃣ Try direct text extraction first
  const parsed = await pdfParse(buffer);


  if (parsed.text && parsed.text.trim().length > 20) {
    return parsed.text;
  }

  // 2️⃣ If scanned PDF, convert to images
  const tempDir = path.join(process.cwd(), "temp");

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const fileId = uuidv4();
  const pdfPath = path.join(tempDir, `${fileId}.pdf`);
  fs.writeFileSync(pdfPath, buffer);

  const outputPrefix = path.join(tempDir, fileId);

  await execAsync(`pdftoppm -png "${pdfPath}" "${outputPrefix}"`);

  const files = fs
    .readdirSync(tempDir)
    .filter((f) => f.startsWith(fileId) && f.endsWith(".png"));

  let fullText = "";

  for (const file of files) {
    const imageBuffer = fs.readFileSync(path.join(tempDir, file));
    const pageText = await extractTextFromImage(imageBuffer);
    fullText += pageText + "\n\n";
  }

  // Cleanup
  fs.unlinkSync(pdfPath);
  files.forEach((file) =>
    fs.unlinkSync(path.join(tempDir, file))
  );

  return fullText.trim();
}





