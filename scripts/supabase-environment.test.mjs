import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import {
  assertSupabaseBuildEnvironment,
  validateSupabaseKey,
  validateSupabaseUrl,
} from "../src/infrastructure/supabase/environment.js";

const url = "https://jdxorryvmcvtqsddkpdm.supabase.co";
const staging = "https://abcdefghijklmnopqrst.supabase.co";
const token = (claims) =>
  `e30.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.fake_signature`;
const env = (key) => ({
  NEXT_PUBLIC_SUPABASE_URL: url,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: key,
});

test("accepts legacy anon and service-role configuration for the same project", () => {
  assert.doesNotThrow(() =>
    assertSupabaseBuildEnvironment({
      ...env(token({ ref: "jdxorryvmcvtqsddkpdm", role: "anon" })),
      SUPABASE_SERVICE_ROLE_KEY: token({
        ref: "jdxorryvmcvtqsddkpdm",
        role: "service_role",
      }),
    }),
  );
});
test("accepts new publishable and server-only secret keys", () => {
  assert.doesNotThrow(() =>
    assertSupabaseBuildEnvironment({
      NEXT_PUBLIC_SUPABASE_URL: staging,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fake",
      SUPABASE_SECRET_KEY: "sb_secret_fake",
    }),
  );
});
test("supports a separate staging project, HTTPS custom domains and local fixtures", () => {
  for (const origin of [
    staging,
    "https://supabase.staging.example",
    "http://localhost:54321",
    "http://127.0.0.1:54321",
    "http://[::1]:54321",
  ])
    assert.doesNotThrow(() =>
      validateSupabaseKey(origin, "fixture_opaque", "public"),
    );
});
test("rejects both retired project URLs", () => {
  for (const ref of ["ponhrxfdfbzaronotelp", "svffadtbyuyodajbwpsa"])
    assert.throws(
      () => validateSupabaseUrl(`https://${ref}.supabase.co`),
      /retired/,
    );
});
test("rejects a retired token even when the current URL is configured", () => {
  for (const kind of ["public", "service"])
    assert.throws(
      () =>
        validateSupabaseKey(
          url,
          token({
            ref: "ponhrxfdfbzaronotelp",
            role: kind === "public" ? "anon" : "service_role",
          }),
          kind,
        ),
      /retired/,
    );
});
test("rejects legacy URL/key project mismatches", () => {
  assert.throws(
    () =>
      validateSupabaseKey(
        staging,
        token({ ref: "jdxorryvmcvtqsddkpdm", role: "anon" }),
        "public",
      ),
    /different projects/,
  );
});
test("rejects new and legacy privileged keys in the browser client", () => {
  for (const key of [
    "sb_secret_fake",
    token({ role: "service_role" }),
    token({ role: "authenticated" }),
  ])
    assert.throws(() => validateSupabaseKey(url, key, "public"), /Privileged/);
});
test("rejects public credentials in the privileged server client", () => {
  for (const key of ["sb_publishable_fake", token({ role: "anon" })])
    assert.throws(
      () => validateSupabaseKey(url, key, "service"),
      /Server-side/,
    );
});
test("checks both public key aliases even when the first one is valid", () => {
  assert.throws(
    () =>
      assertSupabaseBuildEnvironment({
        ...env("sb_publishable_fake"),
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_fake",
      }),
    /privileged/i,
  );
});
test("checks an unrelated public variable for an elevated Supabase key", () => {
  for (const key of ["sb_secret_fake", token({ role: "service_role" })])
    assert.throws(
      () => assertSupabaseBuildEnvironment({ NEXT_PUBLIC_MISPLACED: key }),
      /privileged/i,
    );
});
test("rejects public names that advertise private credentials", () => {
  for (const name of [
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_PRIVATE_KEY",
    "NEXT_PUBLIC_DATABASE_PASSWORD",
  ])
    assert.throws(
      () => assertSupabaseBuildEnvironment({ [name]: "fixture" }),
      /privileged/i,
    );
});
test("rejects insecure remote URLs and origins carrying credentials or paths", () => {
  for (const value of [
    "http://example.com",
    "not-a-url",
    "https://user:password@example.com",
    `${url}/rest/v1`,
    `${url}?key=fixture`,
    `${url}#fragment`,
  ])
    assert.throws(() => validateSupabaseUrl(value));
});
test("configuration errors never print key values", () => {
  const key = "sb_secret_do_not_print_this_fake_value";
  assert.throws(
    () => validateSupabaseKey(url, key, "public"),
    (error) => !error.message.includes(key),
  );
});
test("loading the actual Next configuration fails before compilation with a public secret", () => {
  const cleanEnv = Object.fromEntries(
    Object.entries(process.env).filter(
      ([name]) => !/^(NEXT_PUBLIC_|SUPABASE|SENTRY)/.test(name),
    ),
  );
  const key = "sb_secret_build_should_never_embed_this_fake_value";
  const result = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `await import(${JSON.stringify(new URL("../next.config.mjs", import.meta.url).href)})`,
    ],
    {
      env: { ...cleanEnv, NODE_ENV: "test", NEXT_PUBLIC_MISPLACED: key },
      encoding: "utf8",
      windowsHide: true,
      timeout: 30000,
    },
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /privileged credential/);
  assert.equal((result.stderr + result.stdout).includes(key), false);
});

test("public credentials cannot evade classification with surrounding whitespace", () => {
  for (const key of [
    " sb_secret_fake ",
    " " + token({ role: "service_role" }) + " ",
  ]) {
    assert.throws(() => validateSupabaseKey(url, key, "public"), /Privileged/);
    assert.throws(
      () => assertSupabaseBuildEnvironment({ NEXT_PUBLIC_MISPLACED: key }),
      /privileged/i,
    );
  }
});

test("retired hosts remain blocked with a DNS trailing dot", () => {
  assert.throws(
    () => validateSupabaseUrl("https://ponhrxfdfbzaronotelp.supabase.co."),
    /retired/,
  );
});
