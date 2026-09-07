import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(
  new URL("./upload-course-covers.mjs", import.meta.url),
);

test("unsupported arguments are rejected without echoing their values", () => {
  const secret = "do-not-log-this-secret";
  const result = spawnSync(
    process.execPath,
    [scriptPath, `--service-key=${secret}`],
    { encoding: "utf8" },
  );

  assert.equal(result.status, 1);
  assert.equal(result.stderr.trim(), "Unsupported command-line arguments.");
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, new RegExp(secret));
});
