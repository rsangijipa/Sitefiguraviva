const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createRequire } = require("node:module");
const { spawnSync } = require("node:child_process");

const fromImport = createRequire(require.resolve("eslint-plugin-import"));
const match = fromImport("minimatch");

test("legacy callable matching handles file globs and lint options", () => {
  assert.equal(typeof match, "function");
  assert.equal(match("src/app/page.tsx", "src/**/*.{ts,tsx}"), true);
  assert.equal(match("src/app/page.js", "src/**/*.{ts,tsx}"), false);
  assert.equal(match("src/.hidden.ts", "src/*.ts"), false);
  assert.equal(match("src/.hidden.ts", "src/*.ts", { dot: true }), true);
  assert.equal(match("src/PAGE.TSX", "*.tsx", { matchBase: true, nocase: true }), true);
  assert.equal(match("src/app/page.tsx", "!src/admin/**"), true);
  assert.equal(match("src/admin/page.tsx", "!src/admin/**"), false);
  assert.equal(match("src/app/page.tsx", "src/*.tsx", { noglobstar: true }), false);
});

test("legacy helpers, constructor and chained defaults remain callable", () => {
  assert.deepEqual(match.match(["src/a.ts", "test/a.js"], "**/*.ts"), ["src/a.ts"]);
  assert.deepEqual(match.braceExpand("*.{ts,tsx}"), ["*.ts", "*.tsx"]);
  assert.equal(match.makeRe("src/**").test("src/a.ts"), true);
  assert.deepEqual(["a.ts", "a.js"].filter(match.filter("*.ts")), ["a.ts"]);
  assert.equal(new match.Minimatch("src/**").match("src/a.ts"), true);
  const defaults = match.defaults({ dot: true }).defaults({ nocase: true });
  assert.equal(defaults(".ENV", ".env"), true);
  assert.equal(defaults(".hidden", "*"), true);
  assert.equal(new defaults.Minimatch("*.TS").match("a.ts"), true);
});

test("modern consumers receive official named exports", () => {
  const fromEstree = createRequire(require.resolve("@typescript-eslint/typescript-estree"));
  const modern = fromEstree("minimatch");
  assert.equal(typeof modern.minimatch, "function");
  assert.equal(modern.minimatch("file.ts", "*.ts"), true);
});

test("coverage Glob still discovers the dependency test files", () => {
  const fromCoverage = createRequire(require.resolve("test-exclude"));
  const glob = fromCoverage("glob");
  const files = glob.sync("*.test.cjs", { cwd: __dirname }).sort();
  assert.deepEqual(files, ["deepmerge.test.cjs", "minimatch.test.cjs"]);
});

test("import rule enforces forbidden paths through the makeRe matcher", async () => {
  const { ESLint } = require("eslint");
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [{
      plugins: { import: require("eslint-plugin-import") },
      rules: { "import/no-internal-modules": ["error", { forbid: ["some-package/**"] }] },
    }],
  });
  const [blocked] = await eslint.lintText('import "some-package/internal";');
  assert.equal(blocked.messages.some((m) => m.ruleId === "import/no-internal-modules"), true);
  const [allowed] = await eslint.lintText('import "some-package";');
  assert.equal(allowed.errorCount, 0);
});

test("project lint config accepts CommonJS tests and retains React hook checks", async () => {
  const { ESLint } = require("eslint");
  const eslint = new ESLint();
  const [tooling] = await eslint.lintText('const assert = require("node:assert");', {
    filePath: "tests/dependency-security/fixture.cjs",
  });
  assert.equal(tooling.errorCount, 0);
  const app = await eslint.calculateConfigForFile("src/components/fixture.tsx");
  assert.equal(app.rules["react-hooks/rules-of-hooks"][0], 2);
  assert.ok(app.plugins["react-hooks"]);
});

test("amplifying glob patterns complete within a bounded child process", () => {
  const script = `const {createRequire}=require('node:module');
    const match=createRequire(${JSON.stringify(require.resolve("eslint-plugin-import"))})('minimatch');
    for(let n=8;n<=24;n+=4) new match.Minimatch('a/'+'**/../'.repeat(n)+'*.ts', {optimizationLevel:2});`;
  const result = spawnSync(process.execPath, ["-e", script], { timeout: 5000, windowsHide: true });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr?.toString());
});
