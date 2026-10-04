import assert from "node:assert/strict";
import test from "node:test";

import { updateCourseCover } from "./upload-course-covers-lib.mjs";

function createSupabaseUpdateDouble(result) {
  const calls = {};
  const supabase = {
    from(table) {
      calls.table = table;
      return {
        update(values) {
          calls.values = values;
          return {
            eq(column, value) {
              calls.filter = { column, value };
              return {
                select(columns) {
                  calls.select = columns;
                  return Promise.resolve(result);
                },
              };
            },
          };
        },
      };
    },
  };

  return { calls, supabase };
}

test("a cover update succeeds only when Supabase returns the one course ID", async () => {
  const publicUrl =
    "https://project.supabase.co/storage/v1/object/public/course-assets/courses/co-visar/capa.jpeg";
  const { calls, supabase } = createSupabaseUpdateDouble({
    data: [{ id: "course-1" }],
    error: null,
  });

  await assert.doesNotReject(
    updateCourseCover({ supabase, courseId: "course-1", publicUrl }),
  );
  assert.deepEqual(calls, {
    table: "courses",
    values: {
      cover_image_url: publicUrl,
      image_url: publicUrl,
      thumbnail_url: publicUrl,
    },
    filter: { column: "id", value: "course-1" },
    select: "id",
  });
});

for (const returnedRows of [[], [{ id: "course-1" }, { id: "course-2" }]]) {
  test(`a cover update rejects when Supabase returns ${returnedRows.length} rows`, async () => {
    const { supabase } = createSupabaseUpdateDouble({
      data: returnedRows,
      error: null,
    });

    await assert.rejects(
      updateCourseCover({
        supabase,
        courseId: "course-1",
        publicUrl: "https://project.supabase.co/cover.jpeg",
      }),
      new Error(
        `Expected exactly one course row update for course=course-1; updated=${returnedRows.length}.`,
      ),
    );
  });
}
