jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(),
}));
jest.mock("@/infrastructure/supabase/storage.server", () => ({
  deleteStorageObject: jest.fn(),
}));
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { duplicateAdminCourse } from "../supabaseAdminCourseRepository.server";

type Row = Record<string, any>;

/** Minimal in-memory stand-in for the chained Supabase query builder. */
function fakeSupabase(tables: Record<string, Row[]>, failInsertOn?: string) {
  const inserts: Record<string, Row[]> = {};
  const deletes: Array<{ table: string; id: string }> = [];
  const from = (table: string) => {
    const filters: Array<[string, unknown]> = [];
    const rows = () =>
      (tables[table] ?? []).filter((row) =>
        filters.every(([key, value]) => row[key] === value),
      );
    const builder: any = {
      select: () => builder,
      eq: (key: string, value: unknown) => {
        filters.push([key, value]);
        return builder;
      },
      maybeSingle: async () => ({ data: rows()[0] ?? null, error: null }),
      then: (resolve: (value: unknown) => unknown) =>
        Promise.resolve({ data: rows(), error: null }).then(resolve),
      insert: async (payload: Row | Row[]) => {
        if (table === failInsertOn)
          return { error: new Error(`insert failed on ${table}`) };
        inserts[table] = [
          ...(inserts[table] ?? []),
          ...(Array.isArray(payload) ? payload : [payload]),
        ];
        return { error: null };
      },
      delete: () => ({
        eq: async (_key: string, id: string) => {
          deletes.push({ table, id });
          return { error: null };
        },
      }),
    };
    return builder;
  };
  return { client: { from }, inserts, deletes };
}

const source = {
  courses: [
    {
      id: "src",
      title: "III Formação Clínica",
      slug: "formacao-iii",
      status: "open",
      is_published: true,
      content_revision: 7,
      stripe_price_id: "price_1",
      stripe_product_id: "prod_1",
      billing_type: "one_time",
      total_price_cents: 1200000,
      details: { date: "abril de 2026", mediatorIds: ["med-1"] },
      stats: { lessonsCount: 2, studentsCount: 31 },
      created_at: "2026-01-01",
      updated_at: "2026-02-01",
    },
  ],
  course_modules: [
    { id: "m1", course_id: "src", title: "Módulo 1", sort_order: 1, created_at: "x" },
    { id: "m2", course_id: "src", title: "Módulo 2", sort_order: 2 },
  ],
  lessons: [
    { id: "l1", course_id: "src", module_id: "m1", title: "Aula 1", blocks: [{ id: "b", type: "text" }] },
    { id: "l2", course_id: "src", module_id: "m2", title: "Aula 2", blocks: [] },
  ],
  course_mediators: [{ course_id: "src", mediator_id: "med-1" }],
};

it("copies course, modules, lessons and mediators as a fresh draft", async () => {
  const fake = fakeSupabase(source);
  jest.mocked(createSupabaseServiceClient).mockReturnValue(fake.client as any);

  const result = await duplicateAdminCourse("src");

  const [course] = fake.inserts.courses;
  expect(result).toEqual({ courseId: course.id, modules: 2, lessons: 2 });
  expect(course).toMatchObject({
    title: "Cópia de III Formação Clínica",
    slug: null,
    status: "draft",
    is_published: false,
    content_revision: 1,
    stripe_price_id: null,
    stripe_product_id: null,
    stats: { lessonsCount: 0, studentsCount: 0 },
    total_price_cents: 1200000,
    details: { date: "abril de 2026", mediatorIds: ["med-1"] },
  });
  expect(course.id).not.toBe("src");
  expect(course).not.toHaveProperty("created_at");

  const modules = fake.inserts.course_modules;
  expect(modules.map((m) => m.title)).toEqual(["Módulo 1", "Módulo 2"]);
  expect(modules.every((m) => m.course_id === course.id && !["m1", "m2"].includes(m.id))).toBe(true);
  expect(modules[0]).not.toHaveProperty("created_at");

  const lessons = fake.inserts.lessons;
  const moduleByTitle = Object.fromEntries(modules.map((m) => [m.title, m.id]));
  expect(lessons).toEqual([
    expect.objectContaining({ title: "Aula 1", module_id: moduleByTitle["Módulo 1"], course_id: course.id, blocks: [{ id: "b", type: "text" }] }),
    expect.objectContaining({ title: "Aula 2", module_id: moduleByTitle["Módulo 2"], course_id: course.id }),
  ]);
  expect(lessons.map((l) => l.id)).not.toContain("l1");

  expect(fake.inserts.course_mediators).toEqual([{ course_id: course.id, mediator_id: "med-1" }]);
  expect(fake.deletes).toEqual([]);
});

it("removes the partial copy when a later step fails", async () => {
  const fake = fakeSupabase(source, "lessons");
  jest.mocked(createSupabaseServiceClient).mockReturnValue(fake.client as any);

  await expect(duplicateAdminCourse("src")).rejects.toThrow("insert failed on lessons");
  const newId = fake.inserts.courses[0].id;
  expect(fake.deletes).toEqual([{ table: "courses", id: newId }]);
});

it("reports a missing source course without creating anything", async () => {
  const fake = fakeSupabase({ courses: [] });
  jest.mocked(createSupabaseServiceClient).mockReturnValue(fake.client as any);

  await expect(duplicateAdminCourse("nope")).rejects.toThrow("Curso não encontrado.");
  expect(fake.inserts).toEqual({});
});
