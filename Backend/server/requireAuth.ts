import { Request, Response, NextFunction } from "express";
import { auth, db } from "./firebaseAdmin";
import admin from "firebase-admin";

/* ✅ CLEAN — NO MULTER HERE */
export interface AuthenticatedRequest extends Request {
  uid?: string;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");

    const decoded = await auth.verifyIdToken(token);

    req.uid = decoded.uid;

    /* 🔥 AUTO-CREATE USER IF NOT EXISTS */
    const userRef = db.collection("users").doc(decoded.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        keyBalance: 1, // ✅ Your updated model
        feedbackDeclines: 0,
        feedbackAccepted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

