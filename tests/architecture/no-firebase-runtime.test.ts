import { execFileSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "@jest/globals";

type AuditResult = { violations: string[] };

function runNoFirebaseAudit(): AuditResult {
  const root = process.cwd();
  const output = execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      'import { runNoFirebaseAudit } from "./scripts/check-no-firebase.mjs"; console.log(JSON.stringify(runNoFirebaseAudit()));',
    ],
    { cwd: root, encoding: "utf8" },
  );

  return JSON.parse(output) as AuditResult;
}

describe("Firebase runtime architecture", () => {
  it("detects current Firebase runtime imports, configuration, and dependencies", () => {
    const result = runNoFirebaseAudit();

    expect(result.violations).not.toEqual([]);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        expect.stringContaining("src/"),
        expect.stringContaining("package.json"),
      ]),
    );
  });
});
