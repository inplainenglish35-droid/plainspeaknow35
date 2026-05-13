import "dotenv/config";
import admin from "firebase-admin";

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!raw) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT is missing");
}

const serviceAccount = JSON.parse(raw);

if (serviceAccount.private_key) {
  serviceAccount.private_key =
    serviceAccount.private_key.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("🔥 Firebase initialized successfully");
}

export const auth = admin.auth();
export const db = admin.firestore();

