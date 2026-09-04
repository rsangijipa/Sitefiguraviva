import admin from "firebase-admin";
import { getSupabaseSessionClaims } from "@/lib/auth/supabase-session";

/**
 * Validates that this code is running in a server environment.
 */
function assertServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error(
      "FIREBASE_ADMIN_ERROR: Admin SDK cannot be initialized on the client side.",
    );
  }
}

/**
 * Initializes the Firebase Admin App idempotently with explicit fail-fast mechanisms.
 */
export function getAdminApp(): admin.app.App {
  assertServerEnv();

  if (admin.apps.length > 0) {
    return admin.apps[0] as admin.app.App;
  }

  let credential;
  let authStrategy = "None";

  // 1. Priority: Base64 Env (Recommended for CI/CD and Vercel)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const buffer = Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        "base64",
      );
      const json = JSON.parse(buffer.toString("utf8"));
      credential = admin.credential.cert(json);
      authStrategy = `Base64 Env (${json.project_id})`;
      console.log(
        `[FIREBASE ADMIN INIT] Successfully used strategy: ${authStrategy}`,
      );
    } catch (e: any) {
      console.error(
        "[FIREBASE ADMIN INIT ERROR] Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64 as JSON.",
        e.message,
      );
      throw new Error(
        `FIREBASE_ADMIN_ERROR: Invalid FIREBASE_SERVICE_ACCOUNT_BASE64 configuration. Details: ${e.message}`,
      );
    }
  }
  // 2. Priority: Standard Target Env Vars
  else if (
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PROJECT_ID
  ) {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID.replace(
        /^["']|["']$/g,
        "",
      );
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL.replace(
        /^["']|["']$/g,
        "",
      );
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;

      // Fix Vercel's \n escaping issue robustly and handle missing newlines
      privateKey = privateKey
        .replace(/^["']|["']$/g, "")
        .replace(/\\n/g, "\n")
        .replace(/\r/g, "")
        .trim();

      // If the key is a single string but contains the BEGIN/END headers, ensure proper newlines
      if (
        privateKey.includes("-----BEGIN PRIVATE KEY-----") &&
        !privateKey.includes("\n")
      ) {
        const match = privateKey.match(
          /-----BEGIN PRIVATE KEY-----\s*(.*?)\s*-----END PRIVATE KEY-----/,
        );
        if (match) {
          const keyBodyChunks = match[1].replace(/\s+/g, "").match(/.{1,64}/g);
          if (keyBodyChunks) {
            privateKey = `-----BEGIN PRIVATE KEY-----\n${keyBodyChunks.join("\n")}\n-----END PRIVATE KEY-----`;
          }
        }
      }

      credential = admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      });
      authStrategy = `Standard Env Vars (${projectId})`;
      console.log(
        `[FIREBASE ADMIN INIT] Successfully used strategy: ${authStrategy}`,
      );
    } catch (e: any) {
      console.error(
        "[FIREBASE ADMIN INIT ERROR] Failed to initialize via standard env vars. Check your FIREBASE_PRIVATE_KEY formatting.",
        e.message,
      );
      throw new Error(
        `FIREBASE_ADMIN_ERROR: Invalid standard Firebase Standard env configuration. Details: ${e.message}`,
      );
    }
  }
  // 3. Priority: Local File Path (Local Development)
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    let serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH.replace(
      /^["']|["']$/g,
      "",
    );
    const fs = require("fs");
    if (fs.existsSync(serviceAccountPath)) {
      try {
        const fileContent = fs.readFileSync(serviceAccountPath, "utf8");
        const serviceAccount = JSON.parse(fileContent);
        credential = admin.credential.cert(serviceAccount);
        authStrategy = `Local File Path (${serviceAccount.project_id})`;
        console.log(
          `[FIREBASE ADMIN INIT] Successfully used strategy: ${authStrategy}`,
        );
      } catch (e: any) {
        console.error(
          "[FIREBASE ADMIN INIT ERROR] Failed to load local service account file.",
          e.message,
        );
        throw new Error(
          `FIREBASE_ADMIN_ERROR: Invalid FIREBASE_SERVICE_ACCOUNT_PATH configuration. Details: ${e.message}`,
        );
      }
    } else {
      console.error(
        `[FIREBASE ADMIN INIT ERROR] Service account file not found at ${serviceAccountPath}`,
      );
      throw new Error(
        `FIREBASE_ADMIN_ERROR: Local service account file missing at ${serviceAccountPath}`,
      );
    }
  }
  // 4. Priority: Application Default Credentials (GCP)
  else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      credential = admin.credential.applicationDefault();
      authStrategy = "Application Default";
      console.log(
        `[FIREBASE ADMIN INIT] Successfully used strategy: ${authStrategy}`,
      );
    } catch (e: any) {
      console.error(
        "[FIREBASE ADMIN INIT ERROR] Failed to load application default credentials.",
        e.message,
      );
      throw new Error(
        `FIREBASE_ADMIN_ERROR: Invalid Application Default Credentials. Details: ${e.message}`,
      );
    }
  } else {
    // We throw. We no longer swallow errors or mock.
    console.error(
      "[FIREBASE ADMIN INIT ERROR] No Firebase Auth environment variables found.",
    );
    throw new Error(
      "FIREBASE_ADMIN_ERROR: Missing Firebase Admin configuration. Please set FIREBASE_SERVICE_ACCOUNT_BASE64 or standard Firebase env vars.",
    );
  }

  const storageBucket = (
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    ""
  ).replace(/^["']|["']$/g, "");
  const finalProjectId =
    (credential as any)?.projectId ||
    (credential as any)?.project_id ||
    process.env.FIREBASE_PROJECT_ID;

  return admin.initializeApp({
    credential,
    projectId: finalProjectId,
    ...(storageBucket ? { storageBucket } : {}),
  });
}

export function getAdminAuth(): admin.auth.Auth {
  return admin.auth(getAdminApp());
}

export function getAdminFirestore(): FirebaseFirestore.Firestore {
  return admin.firestore(getAdminApp());
}

export function getAdminStorage(): admin.storage.Storage {
  return admin.storage(getAdminApp());
}

/**
 * The browser authenticates through Supabase, while some legacy services still
 * store data in Firebase. Keep those services working by validating the
 * Supabase cookie and exposing equivalent, server-derived claims. Firebase
 * session cookies remain supported for existing back-office sessions.
 */
async function verifyPlatformSessionCookie(
  sessionCookie: string,
  checkRevoked?: boolean,
): Promise<admin.auth.DecodedIdToken> {
  const claims = await getSupabaseSessionClaims(sessionCookie);

  if (claims) {
    if (!claims.isActive) {
      throw new Error("auth/user-disabled");
    }

    return {
      uid: claims.uid,
      sub: claims.uid,
      email: claims.email,
      role: claims.role,
      admin: claims.admin,
      tutor: claims.tutor,
      isActive: claims.isActive,
      firebase: {
        identities: {},
        sign_in_provider: "supabase",
      },
    } as unknown as admin.auth.DecodedIdToken;
  }

  return getAdminAuth().verifySessionCookie(sessionCookie, checkRevoked);
}

// Proxies for Lazy Initialization to prevent build-time crashes if envs are missing in some CI contexts,
// BUT they do NOT catch or swallow errors. They simply delay execution until property access.
export const db = new Proxy({} as FirebaseFirestore.Firestore, {
  get: (_, prop) => {
    const firestore = getAdminFirestore();
    const value = (firestore as any)[prop];
    return typeof value === "function" ? value.bind(firestore) : value;
  },
});

export const auth = new Proxy({} as admin.auth.Auth, {
  get: (_, prop) => {
    if (prop === "verifySessionCookie") {
      return verifyPlatformSessionCookie;
    }

    const adminAuth = getAdminAuth();
    const value = (adminAuth as any)[prop];
    return typeof value === "function" ? value.bind(adminAuth) : value;
  },
});

export const storage = new Proxy({} as admin.storage.Storage, {
  get: (_, prop) => {
    const adminStorage = getAdminStorage();
    const value = (adminStorage as any)[prop];
    return typeof value === "function" ? value.bind(adminStorage) : value;
  },
});

export const adminDb = db;
export const adminAuth = auth;
