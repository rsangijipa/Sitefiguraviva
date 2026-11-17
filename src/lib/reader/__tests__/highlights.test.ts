import {
  highlightSegments,
  highlightStorageKey,
  highlightToRange,
  mergeHighlights,
  parseStoredHighlights,
  rangeToHighlight,
  readHighlights,
  readReaderTheme,
  subtractHighlight,
  writeHighlights,
  writeReaderTheme,
} from "../highlights";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
    map,
  };
}

const throwingStorage = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("quota");
  },
  removeItem: () => {
    throw new Error("blocked");
  },
};

describe("highlight lists", () => {
  it("sorts, drops invalid and merges overlapping or touching ranges", () => {
    expect(
      mergeHighlights([
        { start: 10, end: 20 },
        { start: 0, end: 5 },
        { start: 18, end: 25 },
        { start: 25, end: 30 },
        { start: 7, end: 7 },
        { start: -1, end: 3 },
        { start: 1.5, end: 4 },
      ]),
    ).toEqual([
      { start: 0, end: 5 },
      { start: 10, end: 30 },
    ]);
  });

  it("subtracts a selection, splitting a highlight when needed", () => {
    expect(
      subtractHighlight([{ start: 0, end: 20 }], { start: 5, end: 10 }),
    ).toEqual([
      { start: 0, end: 5 },
      { start: 10, end: 20 },
    ]);
    expect(
      subtractHighlight([{ start: 0, end: 4 }], { start: 4, end: 8 }),
    ).toEqual([{ start: 0, end: 4 }]);
  });

  it("parses only valid stored JSON", () => {
    expect(parseStoredHighlights("not json")).toEqual([]);
    expect(parseStoredHighlights('{"start":1}')).toEqual([]);
    expect(
      parseStoredHighlights('[{"start":1,"end":3},{"start":"a","end":2}]'),
    ).toEqual([{ start: 1, end: 3 }]);
  });
});

describe("storage", () => {
  it("persists per article and removes the key when empty", () => {
    const storage = memoryStorage();
    writeHighlights(storage, 42, [{ start: 3, end: 9 }]);
    expect(storage.map.get(highlightStorageKey(42))).toBe(
      '[{"start":3,"end":9}]',
    );
    expect(readHighlights(storage, "42")).toEqual([{ start: 3, end: 9 }]);
    expect(readHighlights(storage, "outro")).toEqual([]);
    writeHighlights(storage, 42, []);
    expect(storage.map.has(highlightStorageKey(42))).toBe(false);
  });

  it("never throws when storage is blocked", () => {
    expect(readHighlights(throwingStorage, 1)).toEqual([]);
    expect(() =>
      writeHighlights(throwingStorage, 1, [{ start: 0, end: 1 }]),
    ).not.toThrow();
    expect(readReaderTheme(throwingStorage)).toBe("pastel");
    expect(() => writeReaderTheme(throwingStorage, "dark")).not.toThrow();
    expect(readReaderTheme(null)).toBe("pastel");
  });

  it("remembers the reading theme", () => {
    const storage = memoryStorage();
    writeReaderTheme(storage, "dark");
    expect(readReaderTheme(storage)).toBe("dark");
  });
});

describe("DOM offsets", () => {
  function article() {
    const root = document.createElement("div");
    root.innerHTML =
      "<p>Contato é <strong>fronteira</strong>.</p><p>Awareness.</p>";
    document.body.appendChild(root);
    return root;
  }

  it("round-trips a selection that crosses elements", () => {
    const root = article();
    const text = root.textContent!;
    const start = text.indexOf("é");
    const end = text.indexOf("Aware") + 5;

    const range = document.createRange();
    const firstText = root.querySelector("p")!.firstChild!;
    range.setStart(firstText, firstText.textContent!.indexOf("é"));
    const lastText = root.querySelectorAll("p")[1].firstChild!;
    range.setEnd(lastText, 5);

    const highlight = rangeToHighlight(root, range)!;
    expect(highlight).toEqual({ start, end });

    const restored = highlightToRange(root, highlight)!;
    expect(restored.toString()).toBe(text.slice(start, end));
    expect(
      highlightSegments(root, highlight).map((s) =>
        s.node.data.slice(s.start, s.end),
      ),
    ).toEqual(["é ", "fronteira", ".", "Aware"]);
    root.remove();
  });

  it("ignores selections outside the article", () => {
    const root = article();
    const outside = document.createElement("p");
    outside.textContent = "fora";
    document.body.appendChild(outside);
    const range = document.createRange();
    range.selectNodeContents(outside);
    expect(rangeToHighlight(root, range)).toBeNull();
    expect(highlightToRange(root, { start: 500, end: 600 })).toBeNull();
    root.remove();
    outside.remove();
  });
});
