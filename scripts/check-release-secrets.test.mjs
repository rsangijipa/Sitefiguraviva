import { test } from "node:test";
import assert from "node:assert/strict";
import { secretCategories } from "./check-release-secrets.mjs";
test("detects privileged credentials without returning their values", () => {
  const key = "sk_" + "live_" + "x".repeat(32);
  assert.deepEqual(secretCategories(key), ["stripe-live-key"]);
  const jwt =
    Buffer.from("{}").toString("base64url") +
    "." +
    Buffer.from(JSON.stringify({ role: "service_role" })).toString(
      "base64url",
    ) +
    ".signature";
  // Real JWT headers start with eyJ, unlike the empty fixture header above.
  const header = Buffer.from(JSON.stringify({ alg: "HS256" })).toString(
    "base64url",
  );
  assert.deepEqual(secretCategories(header + jwt.slice(jwt.indexOf("."))), [
    "service-role-jwt",
  ]);
});
test("allows publishable JWTs and environment variable references", () => {
  const jwt =
    [JSON.stringify({ alg: "HS256" }), JSON.stringify({ role: "anon" })]
      .map((value) => Buffer.from(value).toString("base64url"))
      .join(".") + ".signature";
  assert.deepEqual(
    secretCategories(jwt + " process.env.SUPABASE_SECRET_KEY"),
    [],
  );
});
