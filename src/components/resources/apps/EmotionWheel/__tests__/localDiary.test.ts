import { readDiary, saveDiary, deleteDiary } from "../localDiary";
const KEY = "figura_viva_diary_entries_v1";

beforeEach(() => localStorage.clear());
afterEach(() => jest.restoreAllMocks());

it("keeps account and guest entries separate and preserves other resource data", () => {
  localStorage.setItem(KEY, JSON.stringify([{ id: "other", user_id: "a", resource_slug: "other-resource", payload: { reflection: "Other" } }]));
  const first = saveDiary("a", "session-a", { emotion_label: "Alegria" });
  const second = saveDiary("b", "session-b", { emotion_label: "Tristeza" });
  saveDiary("", "session-guest", { emotion_label: "Curiosidade" });
  expect(readDiary("a").map(entry => entry.id)).toEqual([first.id]);
  expect(readDiary("b").map(entry => entry.id)).toEqual([second.id]);
  expect(readDiary("")).toHaveLength(1);
  deleteDiary("b", first.id);
  expect(readDiary("a")).toHaveLength(1);
  deleteDiary("a", first.id);
  expect(readDiary("a")).toHaveLength(0);
  expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(expect.arrayContaining([expect.objectContaining({ id: "other" })]));
});

it("reports blocked writes without creating a saved entry", () => {
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Quota exceeded"); });
  expect(() => saveDiary("a", "session-a", { reflection: "Teste" })).toThrow("Quota exceeded");
  expect(readDiary("a")).toEqual([]);
});

it("does not overwrite unreadable history when saving", () => {
  localStorage.setItem(KEY, "invalid-json");
  expect(() => saveDiary("a", "session-a", {})).toThrow();
  expect(localStorage.getItem(KEY)).toBe("invalid-json");
});
