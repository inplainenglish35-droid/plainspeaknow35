import { Request, Response, NextFunction } from "express";
import { auth, db } from "./firebaseAdmin";

export interface AuthenticatedRequest extends Request {
  uid?: string;
  file?: Express.Multer.File;
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

    const token = authHeader.split("Bearer ")[1];

    const decoded = await auth.verifyIdToken(token);

    req.uid = decoded.uid;

    /* 🔥 AUTO-CREATE USER IF NOT EXISTS */
    const userRef = db.collection("users").doc(decoded.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        keyBalance: 1,                // ✅ 1 FREE KEY
        feedbackDeclines: 0,
        feedbackAccepted: false,
        createdAt: new Date(),
      });
    }

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

