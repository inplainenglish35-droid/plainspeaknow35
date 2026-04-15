import admin from "firebase-admin";
import fs from "fs";
import path from "path";

console.log("🔥 ENV CHECK:", !!process.env.FIREBASE_SERVICE_ACCOUNT);
console.log("🔥 NODE ENV:", process.env.NODE_ENV || "development");
console.log("🔥 FIREBASE ADMIN INITIALIZING");

/* =========================
   LOAD SERVICE ACCOUNT
========================= */

function loadServiceAccount(): admin.ServiceAccount {
  // 🔥 Detect Cloud Run explicitly
  const isCloudRun = !!process.env.K_SERVICE;

  // =========================
  // ☁️ CLOUD RUN (ENV ONLY)
  // =========================
  if (isCloudRun) {
    console.log("🔥 Running in Cloud Run — using ENV");

    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!raw) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT is not set in Cloud Run");
    }

    try {
      let parsed: any;

      // 🔥 Handle both normal and double-escaped JSON
      if (raw.trim().startsWith("{")) {
        parsed = JSON.parse(raw);
      } else {
        parsed = JSON.parse(JSON.parse(raw));
      }

      if (!parsed.project_id) {
        throw new Error("Missing project_id in service account JSON");
      }

      return parsed as admin.ServiceAccount;

    } catch (err) {
      console.error("🔥 ENV PARSE ERROR:", err);
      throw new Error(
        "Invalid FIREBASE_SERVICE_ACCOUNT JSON in environment variable."
      );
    }
  }

  // =========================
  // 🧪 LOCAL DEVELOPMENT
  // =========================
  console.log("🔥 Local environment — using file");

  const serviceAccountPath = path.resolve(
    process.cwd(),
    "secrets/firebase-service-account.json"
  );

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      `Firebase service account not found at: ${serviceAccountPath}`
    );
  }

  const file = fs.readFileSync(serviceAccountPath, "utf8");
  const parsed = JSON.parse(file);

  if (!parsed.project_id) {
    throw new Error("Missing project_id in local service account file");
  }

  return parsed as admin.ServiceAccount;
}

/* =========================
   INIT FIREBASE
========================= */

const serviceAccount = loadServiceAccount();

// 🔥 Correct property name (critical)
const projectId = (serviceAccount as any).project_id;

if (!projectId) {
  throw new Error("Firebase service account missing project_id.");
}

// 🔥 Prevent duplicate initialization
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId,
  });
}

console.log("🔥 ADMIN PROJECT:", projectId);

/* =========================
   EXPORTS
========================= */

export const auth = admin.auth();
export const db = admin.firestore();

