import { z } from "zod";

/**
 * Content release rules, modelled on Moodle's "Restrict access":
 * - sequential: a lesson opens once the previous lesson (course order) is
 *   completed;
 * - module dates: a module opens on a given day (America/Sao_Paulo).
 * Stored in courses.details.release, so no schema change is needed.
 * Lessons the student already completed always stay open.
 */

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use datas no formato AAAA-MM-DD.");

export const contentReleaseSchema = z.object({
  mode: z.enum(["free", "sequential"]).default("free"),
  moduleDates: z.record(z.string().min(1).max(200), isoDate).default({}),
});

export type ContentRelease = z.infer<typeof contentReleaseSchema>;

export const DEFAULT_CONTENT_RELEASE: ContentRelease = {
  mode: "free",
  moduleDates: {},
};

export function readContentRelease(details: unknown): ContentRelease {
  const source =
    details && typeof details === "object" && !Array.isArray(details)
      ? (details as Record<string, unknown>).release
      : undefined;
  const parsed = contentReleaseSchema.safeParse(source ?? {});
  return parsed.success ? parsed.data : DEFAULT_CONTENT_RELEASE;
}

export type LessonLock =
  | { locked: false }
  | { locked: true; reason: "date"; availableFrom: string }
  | { locked: true; reason: "sequence"; previousLessonId: string };

interface ReleaseModule {
  id: string;
  lessons: { id: string; isCompleted?: boolean }[];
}

/** Today's date (YYYY-MM-DD) in Brazil, the institute's reference time. */
export function todayInBrazil(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Modules and lessons must already be in course order. Returns a lock for
 * every lesson id.
 */
export function computeLessonLocks(
  modules: ReleaseModule[],
  release: ContentRelease,
  today: string = todayInBrazil(),
): Map<string, LessonLock> {
  const locks = new Map<string, LessonLock>();
  let previous: { id: string; isCompleted?: boolean } | null = null;

  for (const courseModule of modules) {
    const opensOn = release.moduleDates[courseModule.id];
    for (const lesson of courseModule.lessons) {
      if (lesson.isCompleted) {
        locks.set(lesson.id, { locked: false });
      } else if (opensOn && today < opensOn) {
        locks.set(lesson.id, {
          locked: true,
          reason: "date",
          availableFrom: opensOn,
        });
      } else if (
        release.mode === "sequential" &&
        previous &&
        !previous.isCompleted
      ) {
        locks.set(lesson.id, {
          locked: true,
          reason: "sequence",
          previousLessonId: previous.id,
        });
      } else {
        locks.set(lesson.id, { locked: false });
      }
      previous = lesson;
    }
  }
  return locks;
}

export function formatReleaseDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

export function describeLessonLock(lock: LessonLock): string | null {
  if (!lock.locked) return null;
  return lock.reason === "date"
    ? `Disponível a partir de ${formatReleaseDate(lock.availableFrom)}`
    : "Disponível após concluir a aula anterior";
}
