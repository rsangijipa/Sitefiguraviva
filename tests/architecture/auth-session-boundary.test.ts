import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "@jest/globals";

function sourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(absolute);
    return /\.[jt]sx?$/.test(entry.name) &&
      !/\.(?:test|spec)\./.test(entry.name)
      ? [absolute]
      : [];
  });
}

describe("Supabase session boundary", () => {
  it("never validates the session cookie with Firebase in active actions or APIs", () => {
    const roots = ["src/actions", "src/app/actions", "src/app/api"]
      .map((root) => path.join(process.cwd(), root))
      .filter(fs.existsSync);
    const violations = roots
      .flatMap(sourceFiles)
      .filter((file) =>
        /\.verifySessionCookie\s*\(/.test(fs.readFileSync(file, "utf8")),
      )
      .map((file) => path.relative(process.cwd(), file));

    expect(violations).toEqual([]);
  });
});
