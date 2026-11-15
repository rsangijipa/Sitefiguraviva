const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createRequire } = require("node:module");

const fromJest = createRequire(require.resolve("jest-config"));
const merge = fromJest("deepmerge");

function payload() {
  return JSON.parse('{"__proto__":{"fvPoisoned":true}}');
}

for (const clone of [true, false]) {
  test(`copying an own __proto__ key cannot poison the result (clone=${clone})`, () => {
    const result = merge(payload(), { valid: true }, { clone });
    assert.equal(Object.getPrototypeOf(result), Object.prototype);
    assert.equal(result.fvPoisoned, undefined);
    assert.equal(result.valid, true);
    assert.equal(Object.prototype.fvPoisoned, undefined);
  });

  test(`null-prototype source merge cannot invoke a prototype setter (clone=${clone})`, () => {
    const result = merge(Object.create(null), payload(), { clone });
    assert.equal(Object.getPrototypeOf(result), Object.prototype);
    assert.equal(result.fvPoisoned, undefined);
    assert.equal(Object.prototype.fvPoisoned, undefined);
  });
}

test("nested targets and sources preserve ordinary prototypes", () => {
  const result = merge({ nested: payload() }, { nested: { valid: true } });
  assert.equal(Object.getPrototypeOf(result.nested), Object.prototype);
  assert.equal(result.nested.fvPoisoned, undefined);
  assert.equal(result.nested.valid, true);
});

test("merging Jest globals clones objects, concatenates arrays and keeps symbols", () => {
  const symbol = Symbol("global");
  const date = new Date("2026-01-01");
  const target = { nested: { a: 1 }, list: [{ a: 1 }], [symbol]: { a: 1 }, date };
  const result = merge(target, { nested: { b: 2 }, list: [{ b: 2 }], [symbol]: { b: 2 } });
  assert.deepEqual(result.nested, { a: 1, b: 2 });
  assert.deepEqual(result.list, [{ a: 1 }, { b: 2 }]);
  assert.deepEqual(result[symbol], { a: 1, b: 2 });
  assert.notEqual(result.list[0], target.list[0]);
  assert.equal(result.date, date);
  assert.deepEqual(target.nested, { a: 1 });
});

test("custom merging, clone=false and merge.all retain upstream contracts", () => {
  const item = { stable: true };
  assert.equal(merge({}, { item }, { clone: false }).item, item);
  assert.deepEqual(merge({ list: [1] }, { list: [2] }, { arrayMerge: (_, source) => source }), { list: [2] });
  assert.deepEqual(merge({ count: { a: 1 } }, { count: { b: 2 } }, {
    customMerge: (key) => key === "count" ? () => ({ custom: true }) : undefined,
  }), { count: { custom: true } });
  assert.deepEqual(merge.all([{ a: 1 }, { b: 2 }]), { a: 1, b: 2 });
  assert.throws(() => merge.all({}), /array/);
});
