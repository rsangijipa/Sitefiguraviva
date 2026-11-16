import {
  computeLessonLocks,
  describeLessonLock,
  readContentRelease,
  todayInBrazil,
} from "../content-release";

const modules = (done: string[] = []) => [
  {
    id: "m1",
    lessons: ["a", "b"].map((id) => ({ id, isCompleted: done.includes(id) })),
  },
  {
    id: "m2",
    lessons: ["c", "d"].map((id) => ({ id, isCompleted: done.includes(id) })),
  },
];

describe("readContentRelease", () => {
  it("defaults to free release when details has no valid rule", () => {
    expect(readContentRelease(undefined)).toEqual({ mode: "free", moduleDates: {} });
    expect(readContentRelease({ release: { mode: "weird" } })).toEqual({
      mode: "free",
      moduleDates: {},
    });
  });

  it("reads sequential mode and module dates", () => {
    expect(
      readContentRelease({
        release: { mode: "sequential", moduleDates: { m2: "2026-12-01" } },
      }),
    ).toEqual({ mode: "sequential", moduleDates: { m2: "2026-12-01" } });
  });
});

describe("computeLessonLocks", () => {
  it("keeps everything open in free mode without dates", () => {
    const locks = computeLessonLocks(modules(), { mode: "free", moduleDates: {} });
    expect([...locks.values()].every((lock) => !lock.locked)).toBe(true);
  });

  it("opens each lesson only after the previous one in sequential mode", () => {
    const locks = computeLessonLocks(modules(["a"]), {
      mode: "sequential",
      moduleDates: {},
    });
    expect(locks.get("a")).toEqual({ locked: false });
    expect(locks.get("b")).toEqual({ locked: false });
    expect(locks.get("c")).toEqual({
      locked: true,
      reason: "sequence",
      previousLessonId: "b",
    });
    expect(locks.get("d")?.locked).toBe(true);
  });

  it("locks a module until its release date, then opens it", () => {
    const release = { mode: "free" as const, moduleDates: { m2: "2026-12-01" } };
    expect(computeLessonLocks(modules(), release, "2026-11-30").get("c")).toEqual({
      locked: true,
      reason: "date",
      availableFrom: "2026-12-01",
    });
    expect(computeLessonLocks(modules(), release, "2026-12-01").get("c")).toEqual({
      locked: false,
    });
  });

  it("never locks a lesson the student already completed", () => {
    const locks = computeLessonLocks(
      modules(["c"]),
      { mode: "sequential", moduleDates: { m2: "2099-01-01" } },
      "2026-11-15",
    );
    expect(locks.get("c")).toEqual({ locked: false });
  });
});

describe("helpers", () => {
  it("uses the Brazilian calendar day", () => {
    // 02:00 UTC on 16/11 is still 15/11 in São Paulo (UTC-3).
    expect(todayInBrazil(new Date("2026-11-16T02:00:00Z"))).toBe("2026-11-15");
  });

  it("describes locks in Portuguese", () => {
    expect(
      describeLessonLock({ locked: true, reason: "date", availableFrom: "2026-12-01" }),
    ).toBe("Disponível a partir de 01 de dezembro de 2026");
    expect(
      describeLessonLock({ locked: true, reason: "sequence", previousLessonId: "a" }),
    ).toBe("Disponível após concluir a aula anterior");
    expect(describeLessonLock({ locked: false })).toBeNull();
  });
});
