import { Request, Response, NextFunction } from "express";
import { auth, db } from "./firebaseAdmin";
import admin from "firebase-admin";

/* =========================
   TYPES
========================= */
export interface AuthenticatedRequest extends Request {
  uid?: string;
}

/* =========================
   MIDDLEWARE
========================= */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    /* 🔐 Ensure Firebase is available */
    if (!auth || !db) {
      console.error("🔥 Firebase not initialized");
      return res.status(500).json({ error: "Auth system unavailable" });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    /* 🔍 Verify token */
    const decoded = await auth.verifyIdToken(token);

    if (!decoded?.uid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.uid = decoded.uid;

    /* =========================
       👤 AUTO-CREATE USER
    ========================= */
    const userRef = db.collection("users").doc(decoded.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        keyBalance: 1, // ✅ your current model
        feedbackDeclines: 0,
        feedbackAccepted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("🆕 Created new user:", decoded.uid);
    }

    return next();
  } catch (err: any) {
    console.error("🔥 Auth error:", err?.message || err);

    return res.status(401).json({
      error: "Unauthorized",
    });
  }
}

