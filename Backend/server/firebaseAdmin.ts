import admin from "firebase-admin";
import fs from "fs";
import path from "path";

console.log("🔥 NODE ENV:", process.env.NODE_ENV || "development");
console.log("🔥 FIREBASE ADMIN INITIALIZING");

function loadServiceAccount(): admin.ServiceAccount {

  // 1️⃣ Production (Cloud Run) — load from ENV
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log("🔥 Loading service account from ENV");

    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch {
      throw new Error(
        "Invalid FIREBASE_SERVICE_ACCOUNT JSON in environment variable."
      );
    }
  }

  // 2️⃣ Local development — load from file
  const serviceAccountPath = path.resolve(
    process.cwd(),
    "secrets/firebase-service-account.json"
  );

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      `Firebase service account not found at: ${serviceAccountPath}`
    );
  }

  console.log("🔥 Loading service account from file");

  const file = fs.readFileSync(serviceAccountPath, "utf8");
  return JSON.parse(file);
}

const serviceAccount = loadServiceAccount();

const projectId =
  (serviceAccount as any).project_id ||
  (serviceAccount as any).projectId;

if (!projectId) {
  throw new Error("Firebase service account missing project_id.");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId,
  });
}

console.log("🔥 ADMIN PROJECT:", projectId);

export const auth = admin.auth();
export const db = admin.firestore();

