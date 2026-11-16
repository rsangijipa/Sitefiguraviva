import { readCourseAgenda } from "./course-agenda";

/**
 * Decides whether a course already happened, so catalogs can move it to a
 * history section. The structured agenda wins; otherwise the free text that
 * admins type in `details.date` ("Início das aulas: 25 e 26 de abril 2026")
 * is parsed and its latest date is used.
 */

const MONTHS: Record<string, number> = {
  janeiro: 1,
  fevereiro: 2,
  marco: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12,
};
const MONTH_NAMES = Object.keys(MONTHS).join("|");

const pad = (value: number) => String(value).padStart(2, "0");

function isoDate(year: number, month: number, day: number): string | null {
  if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1)
    return null;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day > lastDay) return null;
  return `${year}-${pad(month)}-${pad(day)}`;
}

function lastDayOfMonth(year: number, month: number) {
  return isoDate(year, month, new Date(Date.UTC(year, month, 0)).getUTCDate());
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Every calendar date written in a Portuguese free-text field, sorted. */
export function parsePtBrDates(text?: string | null): string[] {
  if (!text) return [];
  const source = normalize(text);
  const found = new Set<string>();
  const covered: Array<[number, number]> = [];

  // "25 e 26 de abril 2026", "3, 10 e 17 de maio de 2026", "1º de junho de 2026"
  const dayList = new RegExp(
    String.raw`((?:\d{1,2}(?:o|º)?\s*(?:,|e|a|-|–|ate)\s*)*\d{1,2}(?:o|º)?)\s+de\s+(${MONTH_NAMES})(?:\s+de)?\s*(?:,\s*)?(\d{4})`,
    "g",
  );
  for (const match of source.matchAll(dayList)) {
    const month = MONTHS[match[2]];
    const year = Number(match[3]);
    for (const day of match[1].match(/\d{1,2}/g) ?? []) {
      const date = isoDate(year, month, Number(day));
      if (date) found.add(date);
    }
    covered.push([match.index ?? 0, (match.index ?? 0) + match[0].length]);
  }

  // "25/04/2026" or "25-04-2026"
  for (const match of source.matchAll(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/g)) {
    const date = isoDate(Number(match[3]), Number(match[2]), Number(match[1]));
    if (date) found.add(date);
  }

  // "abril de 2026" with no day: the course runs until the end of that month.
  const monthOnly = new RegExp(
    String.raw`(${MONTH_NAMES})(?:\s+de)?\s+(\d{4})`,
    "g",
  );
  for (const match of source.matchAll(monthOnly)) {
    const start = match.index ?? 0;
    if (covered.some(([from, to]) => start >= from && start < to)) continue;
    const date = lastDayOfMonth(Number(match[2]), MONTHS[match[1]]);
    if (date) found.add(date);
  }

  return [...found].sort();
}

// Accepts admin CourseDoc and public ContentRecord alike; only date/details
// are read, defensively.
type TimelineCourse = object;
type TimelineFields = { date?: unknown; details?: unknown };

/** Latest known date of the course (YYYY-MM-DD), or null when unknown. */
export function getCourseLastDate(input: TimelineCourse): string | null {
  const course = input as TimelineFields;
  const details =
    course.details && typeof course.details === "object"
      ? (course.details as Record<string, unknown>)
      : {};
  const agenda = readCourseAgenda(details.agenda);
  if (agenda) {
    const sessionDates = agenda.sessions.map((session) => session.date).sort();
    const end =
      agenda.endDate ||
      sessionDates[sessionDates.length - 1] ||
      agenda.startDate;
    if (end) return end;
  }
  const text =
    typeof details.date === "string" && details.date.trim()
      ? details.date
      : typeof course.date === "string"
        ? course.date
        : "";
  const dates = parsePtBrDates(text);
  return dates.length ? dates[dates.length - 1] : null;
}

/** Today's date in Brazil (the institute's calendar), as YYYY-MM-DD. */
export function todayInBrazil(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** A course is past once its latest date is before today. Unknown = current. */
export function isCoursePast(
  course: TimelineCourse,
  today: string = todayInBrazil(),
): boolean {
  const last = getCourseLastDate(course);
  return last !== null && last < today;
}

export function splitCoursesByTimeline<T extends TimelineCourse>(
  courses: T[],
  today: string = todayInBrazil(),
): { current: T[]; past: T[] } {
  const current: T[] = [];
  const past: Array<{ course: T; last: string }> = [];
  for (const course of courses) {
    const last = getCourseLastDate(course);
    if (last !== null && last < today) past.push({ course, last });
    else current.push(course);
  }
  past.sort((a, b) => b.last.localeCompare(a.last));
  return { current, past: past.map((item) => item.course) };
}

/** "abril de 2026" style label for history lists. */
export function formatHistoryMonth(isoDateValue: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDateValue}T12:00:00Z`));
}
