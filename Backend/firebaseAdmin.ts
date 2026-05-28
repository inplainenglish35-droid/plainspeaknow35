import "dotenv/config";
import admin from "firebase-admin";

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

console.log("RAW EXISTS:", !!raw);
console.log("RAW LENGTH:", raw?.length);

if (!raw) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT is missing");
}

let parsed;

try {
  parsed = JSON.parse(raw);

  console.log("PARSE SUCCESS");

  console.log("KEYS:", Object.keys(parsed));

  console.log(
    "CLIENT EMAIL:",
    parsed.client_email
  );

} catch (err) {
  console.error("JSON PARSE FAILED");
  console.error(err);
  throw err;
}

if (parsed.private_key) {
  parsed.private_key =
    parsed.private_key.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(parsed),
  });
}

export const auth = admin.auth();
export const db = admin.firestore();

console.log("🔥 Firebase Admin initialized");

