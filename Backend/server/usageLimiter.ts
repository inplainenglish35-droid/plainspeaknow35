import * as admin from "firebase-admin";
import { db } from "./firebaseAdmin.js";

/* ============================================================
   TYPES
============================================================ */

export type KeyCheckResult =
  | { ok: true; remaining: number }
  | { ok: false; code: "USER_NOT_FOUND" | "INSUFFICIENT_KEYS" };

/* ============================================================
   CHECK ONLY (No Deduction)
   Use BEFORE calling OpenAI
============================================================ */

export async function checkKeyBalance(
  uid: string,
  requiredKeys: number
): Promise<KeyCheckResult> {
  const userRef = db.collection("users").doc(uid);
  const snap = await userRef.get();

  if (!snap.exists) {
    return { ok: false, code: "USER_NOT_FOUND" };
  }

  const data = snap.data()!;
  const currentBalance = data.keyBalance ?? 0;

  if (currentBalance < requiredKeys) {
    return { ok: false, code: "INSUFFICIENT_KEYS" };
  }

  return {
    ok: true,
    remaining: currentBalance - requiredKeys,
  };
}

/* ============================================================
   CONSUME KEYS (Atomic + Logged)
   Use ONLY after successful OpenAI response
============================================================ */

export async function consumeKeys(
  uid: string,
  requiredKeys: number,
  metadata?: {
    mode?: number;
    pageCount?: number;
    inputLanguage?: string;
    outputLanguage?: string;
  }
): Promise<KeyCheckResult> {
  const userRef = db.collection("users").doc(uid);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);

    if (!snap.exists) {
      return { ok: false, code: "USER_NOT_FOUND" };
    }

    const data = snap.data()!;
    const currentBalance = data.keyBalance ?? 0;

    if (currentBalance < requiredKeys) {
      return { ok: false, code: "INSUFFICIENT_KEYS" };
    }

    const newBalance = currentBalance - requiredKeys;

    tx.update(userRef, {
      keyBalance: newBalance,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const transactionRef = db.collection("keyTransactions").doc();

    tx.set(transactionRef, {
      uid,
      type: "debit",
      amount: requiredKeys,
      remainingBalance: newBalance,
      ...metadata,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      ok: true,
      remaining: newBalance,
    };
  });
}








