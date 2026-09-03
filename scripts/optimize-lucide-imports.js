#!/usr/bin/env node

/**
 * Lucide Tree-Shaking Optimizer
 *
 * This script converts Lucide-React imports from:
 *   import { Icon1, Icon2 } from 'lucide-react';
 *
 * To tree-shakeable individual imports:
 *   import Icon1 from 'lucide-react/dist/esm/icons/icon-1';
 *   import Icon2 from 'lucide-react/dist/esm/icons/icon-2';
 *
 * **Impact**: Reduces bundle size by ~100-150KB
 *
 * **Usage**:
 *   node scripts/optimize-lucide-imports.js
 *
 * **Safety**: Creates backups before modifying files
 */

const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "..", "src");
const BACKUP_DIR = path.join(__dirname, "..", ".lucide-backups");

// Kebab-case conversion (Icon Name -> icon-name)
function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

// Find all files with lucide imports
function findLucideFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules, .next, etc
      if (!["node_modules", ".next", "dist", "out"].includes(entry.name)) {
        findLucideFiles(fullPath, files);
      }
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".tsx") ||
        entry.name.endsWith(".ts") ||
        entry.name.endsWith(".jsx"))
    ) {
      const content = fs.readFileSync(fullPath, "utf-8");
      if (content.includes("from 'lucide-react'")) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

// Transform file content
function transformFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const newLines = [];

  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match: import { Icon1, Icon2 } from 'lucide-react';
    const match = line.match(
      /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/,
    );

    if (match) {
      modified = true;
      const icons = match[1]
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s && s !== "LucideIcon"); // Keep type imports as-is

      // Special case: LucideIcon type
      if (match[1].includes("LucideIcon")) {
        newLines.push("import { LucideIcon } from 'lucide-react';");
      }

      // Generate individual imports
      for (const icon of icons) {
        const kebab = toKebabCase(icon);
        newLines.push(
          `import ${icon} from 'lucide-react/dist/esm/icons/${kebab}';`,
        );
      }
    } else {
      newLines.push(line);
    }
  }

  if (modified) {
    // Create backup
    const relativePath = path.relative(SRC_DIR, filePath);
    const backupPath = path.join(BACKUP_DIR, relativePath);
    const backupDir = path.dirname(backupPath);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.writeFileSync(backupPath, content);

    // Write optimized file
    fs.writeFileSync(filePath, newLines.join("\n"));

    return true;
  }

  return false;
}

// Main execution
console.log("🔍 Searching for Lucide imports...\n");

const files = findLucideFiles(SRC_DIR);

console.log(`📦 Found ${files.length} files with Lucide imports\n`);

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

let optimizedCount = 0;

for (const file of files) {
  const wasModified = transformFile(file);
  if (wasModified) {
    optimizedCount++;
    const relativePath = path.relative(SRC_DIR, file);
    console.log(`✅ Optimized: ${relativePath}`);
  }
}

console.log(`\n🎉 Successfully optimized ${optimizedCount} files!`);
console.log(`📁 Backups saved to: ${BACKUP_DIR}`);
console.log("\n💡 Next steps:");
console.log("   1. Run: npm run dev");
console.log("   2. Test the application");
console.log("   3. If issues, restore from backups");
console.log("   4. Run: npm run build (to verify tree-shaking worked)");
