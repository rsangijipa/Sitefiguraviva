import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createCiFixture } from "./ci-fixture.mjs";

const require = createRequire(import.meta.url);
function packageBin(packageName, command) {
  const manifestPath = require.resolve(`${packageName}/package.json`);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  return resolve(
    dirname(manifestPath),
    typeof manifest.bin === "string" ? manifest.bin : manifest.bin[command],
  );
}
const modes = new Set([
  "lint",
  "scripts",
  "unit",
  "types",
  "security",
  "build",
  "smoke",
  "brand",
]);
const requested = process.argv.slice(2);
if (requested.some((mode) => !modes.has(mode)))
  throw new Error("Unknown CI check.");
// Next loads these files implicitly. Refuse a workspace carrying operational credentials.
if (
  [
    ".env",
    ".env.local",
    ".env.production",
    ".env.production.local",
    ".env.test",
    ".env.test.local",
    ".env.development",
    ".env.development.local",
  ].some(existsSync)
)
  throw new Error(
    "Run check:ci in a clean copy without .env files; production credentials must not be used.",
  );
const checks = requested.length
  ? requested
  : ["lint", "scripts", "unit", "types", "security", "brand", "build"];
const fixture = await createCiFixture();
const results = [];
try {
  for (const check of checks) {
    const env = {
      ...fixture.env,
      NODE_ENV: check === "build" || check === "smoke" ? "production" : "test",
    };
    if (check === "unit") delete env.FIRESTORE_EMULATOR_HOST;
    // Do not inherit a bypass from the caller. A build-only invocation must
    // still validate, and failed checks must never authorize the bypass.
    delete env.FIGURA_CI_VALIDATED;
    if (
      check === "build" &&
      ["lint", "types", "security"].every((validation) =>
        results.some(
          (result) => result.check === validation && result.exitCode === 0,
        ),
      )
    ) {
      env.FIGURA_CI_VALIDATED = "1";
    }
    const commands = {
      brand: ["scripts/lint-marca.mjs"],
      lint: [packageBin("eslint", "eslint"), "src", "tests", "e2e"],
      scripts: [
        "--test",
        "scripts/upload-course-covers.test.mjs",
        "scripts/upload-course-covers-lib.test.mjs",
        "scripts/e2e-preflight.test.mjs",
        "scripts/supabase-environment.test.mjs",
        "scripts/check-release-secrets.test.mjs",
      ],
      unit: [packageBin("jest", "jest"), "--runInBand"],
      types: [
        require.resolve("typescript/lib/tsc.js"),
        "--noEmit",
        "--incremental",
        "false",
      ],
      security: [
        require.resolve("typescript/lib/tsc.js"),
        "--project",
        "tsconfig.security.json",
      ],
      build: [require.resolve("next/dist/bin/next"), "build"],
      smoke: [
        packageBin("@playwright/test", "playwright"),
        "test",
        "--project=public",
      ],
    };
    console.log(`CI check: ${check}`);
    const exitCode = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, commands[check], {
        env,
        stdio: "inherit",
        windowsHide: true,
      });
      child.once("error", reject);
      child.once("exit", (code) => resolve(code ?? 1));
    });
    results.push({ check, exitCode });
  }
} finally {
  await fixture.close();
}
console.log(
  JSON.stringify({
    checks: results,
    scope: "isolated fixtures, never a deployment",
  }),
);
process.exitCode = results.every((result) => result.exitCode === 0) ? 0 : 1;
