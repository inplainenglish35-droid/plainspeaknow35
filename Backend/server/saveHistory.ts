import { db } from "./firebaseAdmin";
import admin from "firebase-admin";

export interface SaveHistoryParams {
  userId: string;
  inputText: string;
  outputText: string;
  mode: "understand" | "organize" | "respond";
}

export async function saveHistory({
  userId,
  inputText,
  outputText,
  mode,
}: SaveHistoryParams): Promise<void> {

  const userHistoryRef = db
    .collection("users")
    .doc(userId)
    .collection("history");

  await userHistoryRef.add({
    inputText,
    outputText,
    mode,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
  

