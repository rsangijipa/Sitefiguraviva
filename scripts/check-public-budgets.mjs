import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const root = process.cwd();
const distDir = process.env.NEXT_DIST_DIR || ".next-audit";
const distPath = path.join(root, distDir);
const manifestPath = path.join(distPath, "app-build-manifest.json");

if (!fs.existsSync(manifestPath)) {
  console.error(`Build manifest not found: ${manifestPath}`);
  console.error("Run an isolated production build before this audit.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const homeChunks = manifest.pages?.["/page"];

if (!Array.isArray(homeChunks) || homeChunks.length === 0) {
  console.error("Homepage chunks were not found in the app build manifest.");
  process.exit(1);
}

const uniqueChunks = [...new Set(homeChunks)];
const chunkStats = uniqueChunks.map((chunk) => {
  const bytes = fs.readFileSync(path.join(distPath, chunk));
  return { raw: bytes.length, gzip: gzipSync(bytes).length };
});

const homeRaw = chunkStats.reduce((total, item) => total + item.raw, 0);
const homeGzip = chunkStats.reduce((total, item) => total + item.gzip, 0);
const jsLimit = 250 * 1024;

const assetBudgets = [
  {
    label: "Hero tree",
    file: "public/assets/fv/hero-tree-lite.svg",
    limit: 80 * 1024,
  },
  {
    label: "Gallery placeholder",
    file: "public/assets/fv/placeholders/gallery.webp",
    limit: 100 * 1024,
  },
];

let failed = false;
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

console.log(
  `Homepage JavaScript (gzip): ${kb(homeGzip)} / ${kb(jsLimit)} ` +
    `(raw ${kb(homeRaw)}, ${uniqueChunks.length} chunks)`,
);
if (homeGzip > jsLimit) failed = true;

for (const budget of assetBudgets) {
  const size = fs.statSync(path.join(root, budget.file)).size;
  console.log(`${budget.label}: ${kb(size)} / ${kb(budget.limit)}`);
  if (size > budget.limit) failed = true;
}

if (failed) {
  console.error("One or more public performance budgets were exceeded.");
  process.exit(1);
}

console.log("All public performance budgets passed.");
