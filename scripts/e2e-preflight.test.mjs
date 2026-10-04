import test from "node:test";
import assert from "node:assert/strict";
import { assertIsolatedE2eEnvironment } from "./e2e-preflight.mjs";
const staging = {
  BASE_URL: "https://staging.example.invalid",
  E2E_ISOLATED_ENVIRONMENT: "true",
  E2E_ALLOW_MUTATIONS: "true",
  E2E_SUPABASE_PROJECT_REF: "abcdefghijklmnopqrst",
  ADMIN_EMAIL: "admin@example.invalid",
  ADMIN_PASSWORD: "fake",
  STUDENT_EMAIL: "student@example.invalid",
  STUDENT_PASSWORD: "fake",
};
test("accepts explicitly isolated staging with test accounts", () =>
  assert.equal(assertIsolatedE2eEnvironment(staging), staging.BASE_URL));
for (const BASE_URL of [
  "https://www.institutofiguraviva.com.br",
  "https://institutofiguraviva.com.br",
  "http://staging.example.invalid",
  "https://user:secret@staging.example.invalid",
  "https://staging.example.invalid/path",
]) {
  test(`rejects invalid or production staging origin: ${new URL(BASE_URL).hostname}`, () =>
    assert.throws(() =>
      assertIsolatedE2eEnvironment({ ...staging, BASE_URL }),
    ));
}
test("rejects production database even with a staging hostname", () =>
  assert.throws(() =>
    assertIsolatedE2eEnvironment({
      ...staging,
      E2E_SUPABASE_PROJECT_REF: "jdxorryvmcvtqsddkpdm",
    }),
  ));
test("requires explicit mutation configuration", () =>
  assert.throws(() =>
    assertIsolatedE2eEnvironment({ ...staging, E2E_ALLOW_MUTATIONS: "false" }),
  ));
test("requires complete test accounts", () =>
  assert.throws(() =>
    assertIsolatedE2eEnvironment({ ...staging, ADMIN_PASSWORD: "" }),
  ));

import { createCiFixture } from "./ci-fixture.mjs";
test("CI replaces service settings, forces a local browser target and rejects HTTP writes", async () => {
  const source = {
    SUPABASE_SERVICE_ROLE_KEY: "fake-operational-key",
    SENTRY_AUTH_TOKEN: "fake-token",
    BASE_URL: "https://www.institutofiguraviva.com.br",
    E2E_REMOTE: "1",
    ADMIN_EMAIL: "private@example.invalid",
    NEXT_PUBLIC_GA_ID: "fake-ga",
  };
  const fixture = await createCiFixture(source);
  try {
    assert.notEqual(
      fixture.env.SUPABASE_SERVICE_ROLE_KEY,
      source.SUPABASE_SERVICE_ROLE_KEY,
    );
    assert.equal(fixture.env.SENTRY_AUTH_TOKEN, undefined);
    assert.equal(fixture.env.ADMIN_EMAIL, undefined);
    assert.equal(fixture.env.NEXT_PUBLIC_GA_ID, undefined);
    assert.equal(fixture.env.E2E_REMOTE, "0");
    assert.equal(new URL(fixture.env.BASE_URL).hostname, "127.0.0.1");
    assert.deepEqual(
      await (await fetch(fixture.env.NEXT_PUBLIC_SUPABASE_URL)).json(),
      [],
    );
    assert.equal(
      (await fetch(fixture.env.NEXT_PUBLIC_SUPABASE_URL, { method: "POST" }))
        .status,
      405,
    );
    assert.equal(source.SUPABASE_SERVICE_ROLE_KEY, "fake-operational-key");
  } finally {
    await fixture.close();
  }
});
