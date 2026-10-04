import { readableLesson, readableOutline } from "../course-content.server";
const lesson = {
  id: "lesson",
  moduleId: "module",
  courseId: "course",
  title: "Aula",
  isPublished: true,
  legacy_payload: { secret: "hidden" },
  blocks: [
    { id: "visible", content: { text: "ok" } },
    { id: "draft", isPublished: false, content: { text: "SECRET_DRAFT" } },
  ],
};
it("filters draft blocks from both the top-level content and the lesson projection", () => {
  const result = readableLesson(lesson);
  expect(result.blocks.map((b) => b.id)).toEqual(["visible"]);
  expect(JSON.stringify(result)).not.toContain("SECRET_DRAFT");
  expect(result).not.toHaveProperty("legacy_payload");
});
it("preserves drafts only for a previously authorized preview", () => {
  expect(readableLesson(lesson, true).blocks).toHaveLength(2);
});
it("removes draft modules, draft lessons and nested draft blocks from SSR props", () => {
  const outline = {
    course: { id: "course" },
    modules: [
      { id: "draft-module", isPublished: false, lessons: [lesson] },
      {
        id: "module",
        isPublished: true,
        lessons: [
          lesson,
          { ...lesson, id: "draft-lesson", isPublished: false },
        ],
      },
    ],
  } as any;
  const result = readableOutline(outline);
  expect(result.modules).toHaveLength(1);
  expect(result.modules[0].lessons.map((l) => l.id)).toEqual(["lesson"]);
  expect(JSON.stringify(result)).not.toContain("SECRET_DRAFT");
  expect(JSON.stringify(result)).not.toContain("legacy_payload");
  expect(readableOutline(outline, true).modules).toHaveLength(2);
});
