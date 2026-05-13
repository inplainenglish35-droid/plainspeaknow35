import { db } from "./firebaseAdmin";
import admin from "firebase-admin";
type Language = string; // local fallback type

export interface SaveHistoryParams {
  userId: string;
  inputText: string;
  outputText: string;
  docType?: string | null;
  language?: Language;
}

export async function saveHistory({
  userId,
  inputText,
  outputText,
  docType = null,
  language = "en",
}: SaveHistoryParams): Promise<void> {

  if (!userId || !inputText || !outputText) {
    throw new Error("Invalid history payload");
  }

  const userHistoryRef = db
    .collection("users")
    .doc(userId)
    .collection("history");

  await userHistoryRef.add({
    inputText,
    outputText,
    docType,
    language,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
  

