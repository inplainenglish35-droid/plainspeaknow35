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
  const isCloudRun = !!process.env.K_SERVICE;

  // =========================
  // ☁️ CLOUD RUN (ENV)
  // =========================
  if (isCloudRun) {
    console.log("🔥 Running in Cloud Run — using ENV");

    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!raw) {
      console.error("🔥 FIREBASE ENV MISSING");
      process.exit(1);
    }

    try {
      let parsed: any = JSON.parse(raw);

      // 🔥 Fix newline issues in private key (VERY IMPORTANT)
      if (parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      }

      if (!parsed.project_id) {
        throw new Error("Missing project_id in service account JSON");
      }

      console.log("🔥 Firebase ENV parsed OK");

      return parsed;

    } catch (err) {
      console.error("🔥 FIREBASE ENV PARSE ERROR:", err);
      process.exit(1);
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
    console.error("🔥 Firebase file not found:", serviceAccountPath);
    process.exit(1);
  }

  try {
    const file = fs.readFileSync(serviceAccountPath, "utf8");
    const parsed = JSON.parse(file);

    if (!parsed.project_id) {
      throw new Error("Missing project_id in local service account file");
    }

    console.log("🔥 Firebase file loaded OK");

    return parsed;

  } catch (err) {
    console.error("🔥 LOCAL FIREBASE PARSE ERROR:", err);
    process.exit(1);
  }
}

/* =========================
   INIT FIREBASE
========================= */

let serviceAccount: admin.ServiceAccount;

try {
  serviceAccount = loadServiceAccount();
} catch (err) {
  console.error("🔥 FIREBASE LOAD FAILED:", err);
  process.exit(1);
}

const projectId = (serviceAccount as any).project_id;

if (!projectId) {
  console.error("🔥 Firebase missing project_id");
  process.exit(1);
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId,
    });

    console.log("🔥 Firebase initialized successfully");

  } catch (err) {
    console.error("🔥 FIREBASE INIT ERROR:", err);
    process.exit(1);
  }
}

console.log("🔥 ADMIN PROJECT:", projectId);

/* =========================
   EXPORTS
========================= */

export const auth = admin.auth();
export const db = admin.firestore();

