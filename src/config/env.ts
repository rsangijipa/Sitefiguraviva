import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

const envSchema = z.object({
  // Core
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_API_BASE_URL: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().url().optional(),
  ),

  // Firebase Client - Required in Production, Optional in Dev
  NEXT_PUBLIC_FIREBASE_API_KEY: isProd
    ? z.string().min(1)
    : z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: isProd
    ? z.string().min(1)
    : z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: isProd
    ? z.string().min(1)
    : z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: isProd
    ? z.string().min(1)
    : z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: isProd
    ? z.string().min(1)
    : z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: isProd
    ? z.string().min(1)
    : z.string().optional(),

  // Firebase Admin (Server side only)
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Feature Flags / Misc
  ADMIN_BOOTSTRAP_EMAILS: z.string().optional(),
});

function validateEnv() {
  // In Next.js client, process.env is not a real object you can spread.
  // We must pass an object with explicit keys for Zod to validate them correctly on the client.
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    ADMIN_BOOTSTRAP_EMAILS: process.env.ADMIN_BOOTSTRAP_EMAILS,
  };

  const parsed = envSchema.safeParse(envVars);

  if (!parsed.success) {
    if (isProd) {
      console.error(
        "❌ Invalid environment variables:",
        JSON.stringify(parsed.error.format(), null, 2),
      );
      throw new Error("Invalid environment variables");
    } else {
      console.warn(
        "⚠️ Warning: Some non-critical environment variables are missing (OK for development):",
        JSON.stringify(parsed.error.format(), null, 2),
      );
      return envVars as any;
    }
  }

  return parsed.data;
}

export const env = validateEnv();
