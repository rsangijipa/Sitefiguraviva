import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

// Findings contain locations and categories only, never matched credential values.
export function secretCategories(source) {
  const findings = new Set();
  for (const [category, pattern] of [
    [
      "private-key",
      /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----\s+[A-Za-z0-9+/=\r\n]{80,}-----END/,
    ],
    ["stripe-live-key", /sk_live_[A-Za-z0-9]{20,}/],
    ["supabase-secret", /sb_secret_[A-Za-z0-9_-]{25,}/],
    ["database-password", /postgres(?:ql)?:\/\/[^\s:@/]+:([^\s@/]{8,})@/],
  ])
    if (pattern.test(source)) findings.add(category);
  for (const match of source.matchAll(
    /eyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g,
  )) {
    try {
      if (
        JSON.parse(Buffer.from(match[1], "base64url").toString()).role ===
        "service_role"
      )
        findings.add("service-role-jwt");
    } catch {}
  }
  return [...findings];
}
export function scanRelease(history = false) {
  const findings = [];
  const eligible = (file) =>
    /\.(?:[cm]?[jt]sx?|json|md|sql|ya?ml|txt|toml)$/.test(file) ||
    /(?:^|\/)\.env/.test(file);
  const check = (file, text, revision) => {
    const testFixture = /(?:__tests__|\.test\.[cm]?[jt]sx?$)/.test(file);
    if (testFixture)
      text = text.replace(/sb_secret_[A-Za-z0-9_-]{25,}/g, (value) =>
        /fake|fixture|test|never|not_leak|DO_NOT/i.test(value)
          ? "redacted-test-fixture"
          : value,
      );
    for (const category of secretCategories(text))
      findings.push({ file, category, ...(revision ? { revision } : {}) });
  };
  const files = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { encoding: "utf8" },
  )
    .split("\0")
    .filter(Boolean);
  for (const file of files)
    if (eligible(file) && fs.existsSync(file) && fs.statSync(file).isFile())
      check(file, fs.readFileSync(file, "utf8"));
  if (history) {
    const commits = execFileSync("git", ["rev-list", "HEAD"], {
      encoding: "utf8",
    })
      .trim()
      .split("\n")
      .filter(Boolean);
    const blobs = new Map();
    for (const commit of commits) {
      const tracked = execFileSync(
        "git",
        ["ls-tree", "-r", "--format=%(objectname)%x09%(path)", commit],
        { encoding: "utf8" },
      )
        .trim()
        .split("\n");
      for (const line of tracked) {
        const separator = line.indexOf("\t");
        const hash = line.slice(0, separator),
          file = line.slice(separator + 1);
        if (eligible(file) && !blobs.has(hash))
          blobs.set(hash, { file, revision: commit.slice(0, 12) });
      }
    }
    if (blobs.size) {
      const output = execFileSync("git", ["cat-file", "--batch"], {
        input: [...blobs.keys()].join("\n") + "\n",
        maxBuffer: 128 * 1024 * 1024,
      });
      let offset = 0;
      for (const [hash, location] of blobs) {
        const end = output.indexOf(10, offset),
          header = output.subarray(offset, end).toString("utf8").split(" "),
          length = Number(header[2]);
        if (
          header[0] !== hash ||
          header[1] !== "blob" ||
          !Number.isSafeInteger(length)
        )
          throw new Error("Invalid Git blob response");
        const text = output
          .subarray(end + 1, end + 1 + length)
          .toString("utf8");
        check(location.file, text, location.revision);
        offset = end + length + 2;
      }
    }
  }
  return findings;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const findings = scanRelease(process.argv.includes("--history"));
  console.log(
    JSON.stringify(
      {
        scope: process.argv.includes("--history")
          ? "release and reachable HEAD history"
          : "release",
        findings,
      },
      null,
      2,
    ),
  );
  process.exitCode = findings.length ? 1 : 0;
}
