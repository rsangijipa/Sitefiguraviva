import {
  getCourseLastDate,
  isCoursePast,
  parsePtBrDates,
  splitCoursesByTimeline,
  todayInBrazil,
} from "../course-timeline";

const agenda = (overrides: Record<string, unknown>) => ({
  timezone: "America/Sao_Paulo",
  modality: "online",
  startDate: "",
  endDate: "",
  sessions: [],
  ...overrides,
});

describe("parsePtBrDates", () => {
  it.each([
    ["Início das aulas: 25 e 26 de abril 2026", ["2026-04-25", "2026-04-26"]],
    ["25 e 26 de abril de 2026", ["2026-04-25", "2026-04-26"]],
    ["3, 10 e 17 de maio de 2026", ["2026-05-03", "2026-05-10", "2026-05-17"]],
    ["1º de março de 2027", ["2027-03-01"]],
    ["Encontros em 05/09/2026 e 12/09/2026", ["2026-09-05", "2026-09-12"]],
    ["Turma de agosto de 2026", ["2026-08-31"]],
    ["De 25 de abril de 2026 a 30 de novembro de 2027", ["2026-04-25", "2027-11-30"]],
  ])("reads %s", (text, expected) => {
    expect(parsePtBrDates(text)).toEqual(expected);
  });

  it.each([[""], [null], ["4 semanas"], ["Em breve"], ["31 de fevereiro de 2026"]])(
    "finds no date in %s",
    (text) => {
      expect(parsePtBrDates(text)).toEqual([]);
    },
  );
});

describe("getCourseLastDate", () => {
  it("prefers the agenda end date over the free text", () => {
    expect(
      getCourseLastDate({
        details: {
          agenda: agenda({ startDate: "2026-04-25", endDate: "2027-12-12" }),
          date: "25 de abril de 2026",
        },
      }),
    ).toBe("2027-12-12");
  });

  it("uses the last session when the agenda has no end date", () => {
    expect(
      getCourseLastDate({
        details: {
          agenda: agenda({
            sessions: [
              { id: "a", title: "", date: "2026-12-05", startTime: "09:00", endTime: "12:00" },
              { id: "b", title: "", date: "2026-11-07", startTime: "09:00", endTime: "12:00" },
            ],
          }),
        },
      }),
    ).toBe("2026-12-05");
  });

  it("falls back to the text when the agenda is empty", () => {
    expect(
      getCourseLastDate({
        details: { agenda: agenda({}), date: "Início das aulas: 25 e 26 de abril 2026" },
      }),
    ).toBe("2026-04-26");
  });

  it("reads the top-level date used by public course records", () => {
    expect(getCourseLastDate({ date: "10 de janeiro de 2027" })).toBe("2027-01-10");
  });

  it("returns null when nothing is known", () => {
    expect(getCourseLastDate({ details: {}, date: "4 semanas" })).toBeNull();
  });
});

describe("timeline split", () => {
  const today = "2026-11-15";
  const formacao = { id: "f", details: { date: "Início das aulas: 25 e 26 de abril 2026" } };
  const covisar = { id: "c", details: { date: null } };
  const future = { id: "n", details: { date: "6 de março de 2027" } };
  const older = { id: "o", details: { date: "maio de 2025" } };
  const endsToday = { id: "t", details: { date: "15 de novembro de 2026" } };

  it("marks a course past only after its last date", () => {
    expect(isCoursePast(formacao, today)).toBe(true);
    expect(isCoursePast(endsToday, today)).toBe(false);
    expect(isCoursePast(covisar, today)).toBe(false);
    expect(isCoursePast(future, today)).toBe(false);
  });

  it("keeps order for current courses and lists history newest first", () => {
    const { current, past } = splitCoursesByTimeline(
      [older, covisar, formacao, future, endsToday],
      today,
    );
    expect(current.map((c) => c.id)).toEqual(["c", "n", "t"]);
    expect(past.map((c) => c.id)).toEqual(["f", "o"]);
  });

  it("computes today in the Brazilian calendar", () => {
    // 01:30 UTC on Nov 16 is still Nov 15 in São Paulo (UTC-3).
    expect(todayInBrazil(new Date("2026-11-16T01:30:00Z"))).toBe("2026-11-15");
  });
});
