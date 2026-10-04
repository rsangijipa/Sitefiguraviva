import http from "node:http";
import { generateKeyPairSync } from "node:crypto";

/** Build/test data only: no real provider credentials and no writable HTTP endpoint. */
export async function createCiFixture(source = process.env) {
  const env = { ...source };
  for (const name of Object.keys(env)) {
    if (
      /NEXT_TEST_WASM|NEXT_PUBLIC_|SUPABASE|FIREBASE|UPSTASH|SENTRY|STRIPE|GOOGLE_APPLICATION|PIX_MERCHANT|RATE_LIMIT|E2E_|^(ADMIN|STUDENT)_/.test(
        name,
      )
    )
      delete env[name];
  }
  const server = http.createServer((request, response) => {
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405);
      response.end();
      return;
    }
    response.writeHead(200, {
      "Content-Type": "application/json",
      "Content-Range": "*/0",
    });
    response.end("[]");
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: { format: "pem", type: "pkcs8" },
    publicKeyEncoding: { format: "pem", type: "spki" },
  });
  Object.assign(env, {
    CI: "true",
    NEXT_TELEMETRY_DISABLED: "1",
    BASE_URL: "http://127.0.0.1:3100",
    PORT: "3100",
    E2E_REMOTE: "0",
    NEXT_PUBLIC_BASE_URL: "https://ci.invalid",
    NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${server.address().port}`,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "ci_fixture_anon_not_a_real_credential",
    SUPABASE_SERVICE_ROLE_KEY: "ci_fixture_service_not_a_real_credential",
    FIREBASE_SERVICE_ACCOUNT_BASE64: Buffer.from(
      JSON.stringify({
        type: "service_account",
        project_id: "demo-sitefiguraviva",
        client_email: "ci@demo-sitefiguraviva.iam.gserviceaccount.com",
        private_key: privateKey,
      }),
    ).toString("base64"),
    NEXT_PUBLIC_FIREBASE_API_KEY: "ci_fixture",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-sitefiguraviva",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "ci.invalid",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "ci.invalid",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1234567890",
    NEXT_PUBLIC_FIREBASE_APP_ID: "ci_fixture",
    FIRESTORE_EMULATOR_HOST: "127.0.0.1:1",
    FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:1",
    STRIPE_SECRET_KEY: "sk_test_ci_fixture",
  });
  return { env, close: () => new Promise((resolve) => server.close(resolve)) };
}
