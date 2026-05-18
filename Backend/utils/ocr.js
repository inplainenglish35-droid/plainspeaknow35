"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromImage = extractTextFromImage;
exports.extractTextFromPDF = extractTextFromPDF;
const vision_1 = __importDefault(require("@google-cloud/vision"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const { v4: uuidv4 } = require("uuid");
const child_process_1 = require("child_process");
const util_1 = require("util");
const pdfParse = require("pdf-parse");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/* ---------------- GOOGLE VISION ---------------- */
const client = new vision_1.default.ImageAnnotatorClient();
/* ---------------- IMAGE OCR ---------------- */
async function extractTextFromImage(buffer) {
    const [result] = await client.textDetection({
        image: { content: buffer },
    });
    const detections = result.textAnnotations;
    return detections?.[0]?.description ?? "";
}
/* ---------------- PDF OCR ---------------- */
async function extractTextFromPDF(buffer) {
    const parsed = await pdfParse(buffer);
    if (parsed.text && parsed.text.trim().length > 20) {
        return parsed.text;
    }
    const tempDir = path_1.default.join(process.cwd(), "temp");
    fs_1.default.mkdirSync(tempDir, { recursive: true });
    const fileId = uuidv4();
    const pdfPath = path_1.default.join(tempDir, `${fileId}.pdf`);
    fs_1.default.writeFileSync(pdfPath, buffer);
    const outputPrefix = path_1.default.join(tempDir, fileId);
    await execAsync(`pdftoppm -png "${pdfPath}" "${outputPrefix}"`);
    const files = fs_1.default
        .readdirSync(tempDir)
        .filter((f) => f.startsWith(fileId) && f.endsWith(".png"));
    let fullText = "";
    for (const file of files) {
        const imageBuffer = fs_1.default.readFileSync(path_1.default.join(tempDir, file));
        const pageText = await extractTextFromImage(imageBuffer);
        fullText += pageText + "\n\n";
    }
    fs_1.default.unlinkSync(pdfPath);
    files.forEach((file) => fs_1.default.unlinkSync(path_1.default.join(tempDir, file)));
    return fullText.trim();
}
