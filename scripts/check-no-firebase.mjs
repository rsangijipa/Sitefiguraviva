import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();

const forbidden = [
  /from ["']firebase(?:\/|["'])/,
  /from ["']firebase-admin(?:\/|["'])/,
  /@\/lib\/firebase/,
  /NEXT_PUBLIC_FIREBASE_/,
  /FIREBASE_/,
];
const firebaseRuntimeHosts = [
  /(?:firebase(?:storage)?|firestore|identitytoolkit|securetoken)\.googleapis\.com/i,
  /\.firebaseio\.com/i,
  /\.firebasestorage\.app/i,
  /\.firebaseapp\.com/i,
];

const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const publicExtensions = new Set([".js", ".mjs", ".json"]);
const configurationFiles = [
  ".firebaserc",
  "firebase.json",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "postcss.config.js",
  "tailwind.config.js",
  "tsconfig.json",
  "tsconfig.base.json",
];
const auditScript = path.relative(
  root,
  fileURLToPath(import.meta.url),
).replaceAll(path.sep, "/");

function toRelative(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

function collectFiles(directory, extensions) {
  const files = [];
  if (!fs.existsSync(directory)) return files;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__") continue;
      files.push(...collectFiles(entryPath, extensions));
    } else if (
      extensions.has(path.extname(entry.name)) &&
      !/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(entry.name)
    ) {
      files.push(entryPath);
    }
  }

  return files;
}

function packageScriptFiles(packageJson) {
  const files = new Set();
  const scriptPath = /(?:^|\s)scripts\/([\w./-]+\.(?:[cm]?js|ts|py))(?:\s|$)/g;

  for (const command of Object.values(packageJson.scripts ?? {})) {
    for (const match of command.matchAll(scriptPath)) {
      files.add(path.join(root, "scripts", match[1]));
    }
  }

  return [...files].filter((filePath) => fs.existsSync(filePath));
}

function matchingLines(contents) {
  return contents.split(/\r?\n/).flatMap((line, index) => {
    const match = [...forbidden, ...firebaseRuntimeHosts].find((pattern) => {
      pattern.lastIndex = 0;
      return pattern.test(line);
    });
    return match ? [`${index + 1} (${match})`] : [];
  });
}

function packageScriptViolations(packageJson) {
  return Object.entries(packageJson.scripts ?? {})
    .filter(([, command]) => /\bfirebase(?:\s|$)/i.test(command))
    .map(([name]) => `package.json:script ${name} (firebase CLI)`);
}

function scanFiles(files) {
  const violations = [];
  for (const filePath of files) {
    const relativePath = toRelative(filePath);
    if (relativePath === auditScript) continue;

    for (const match of matchingLines(fs.readFileSync(filePath, "utf8"))) {
      violations.push(`${relativePath}:${match}`);
    }
  }
  return violations;
}

function dependencyViolations(packageJson) {
  const dependencies = {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
    ...(packageJson.optionalDependencies ?? {}),
  };

  return Object.keys(dependencies)
    .filter((name) => name === "firebase" || name === "firebase-admin" || name.startsWith("@firebase/"))
    .sort()
    .map((name) => `package.json:dependency ${name}`);
}

export function runNoFirebaseAudit() {
  const packagePath = path.join(root, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  const files = [
    ...collectFiles(path.join(root, "src"), sourceExtensions),
    ...collectFiles(path.join(root, "public"), publicExtensions),
    ...configurationFiles
      .map((file) => path.join(root, file))
      .filter((file) => fs.existsSync(file)),
    ...fs
      .readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.startsWith(".env"))
      .map((entry) => path.join(root, entry.name)),
    ...packageScriptFiles(packageJson),
  ];

  return {
    violations: [
      ...new Set([
        ...scanFiles(files),
        ...packageScriptViolations(packageJson),
        ...dependencyViolations(packageJson),
      ]),
    ].sort(),
  };
}

const invokedAsScript = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedAsScript) {
  const result = runNoFirebaseAudit();
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(result));
  } else if (result.violations.length === 0) {
    console.log("No Firebase runtime imports, configuration, or dependencies found.");
  } else {
    console.error("Firebase runtime references found:");
    for (const violation of result.violations) console.error(`- ${violation}`);
  }
  process.exitCode = result.violations.length === 0 ? 0 : 1;
}
