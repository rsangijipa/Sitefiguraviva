jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(),
}));
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import {
  addAdminMaterial,
  updateAdminMaterial,
  deleteAdminMaterial,
} from "../supabaseAdminCourseRepository.server";
const query = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    maybeSingle: jest.fn(),
  },
  list = jest.fn(),
  from = jest.fn();
const path = "courses/c/materials/11111111-1111-4111-8111-111111111111.pdf";
beforeEach(() => {
  jest.clearAllMocks();
  for (const method of ["select", "update", "delete", "eq"] as const)
    query[method].mockReturnValue(query);
  query.insert.mockResolvedValue({ error: null });
  query.maybeSingle.mockResolvedValue({
    data: {
      id: "material",
      course_id: "c",
      title: "Guide",
      type: "link",
      url: "https://example.com/guide",
      visibility: "enrolled",
      is_published: true,
    },
    error: null,
  });
  list.mockResolvedValue({
    data: [
      {
        name: path.split("/").pop(),
        metadata: { mimetype: "application/pdf", size: 20 },
      },
    ],
    error: null,
  });
  from.mockReturnValue(query);
  jest
    .mocked(createSupabaseServiceClient)
    .mockReturnValue({ from, storage: { from: () => ({ list }) } } as any);
});
it("persists private reference, visibility and module as canonical columns", async () => {
  await addAdminMaterial("c", {
    title: "Guide",
    type: "pdf",
    url: "blob:untrusted",
    fileBucket: "course-materials",
    filePath: path,
    visibility: "team_only",
    moduleId: "m",
  });
  expect(query.insert).toHaveBeenCalledWith(
    expect.objectContaining({
      course_id: "c",
      url: "",
      storage_bucket: "course-materials",
      storage_path: path,
      visibility: "team_only",
      module_id: "m",
      legacy_payload: {},
    }),
  );
});
it.each([
  { fileBucket: "course-assets", filePath: path },
  { fileBucket: "course-materials", filePath: path.replace("/c/", "/other/") },
])("rejects public or cross-course file references", async (fields) => {
  await expect(
    addAdminMaterial("c", { title: "Guide", type: "pdf", ...fields }),
  ).rejects.toThrow();
  expect(query.insert).not.toHaveBeenCalled();
});
it("does not save a missing uploaded object", async () => {
  list.mockResolvedValue({ data: [], error: null });
  await expect(
    addAdminMaterial("c", {
      title: "Guide",
      type: "pdf",
      fileBucket: "course-materials",
      filePath: path,
    }),
  ).rejects.toThrow();
  expect(query.insert).not.toHaveBeenCalled();
});
it("persists visibility and qualifies update by course", async () => {
  await updateAdminMaterial("c", "material", {
    visibility: "after_completion",
    isPublished: false,
  });
  expect(query.update).toHaveBeenCalledWith(
    expect.objectContaining({
      visibility: "after_completion",
      is_published: false,
    }),
  );
  expect(query.eq).toHaveBeenCalledWith("course_id", "c");
});
it("rejects missing update targets", async () => {
  query.maybeSingle.mockResolvedValue({ data: null, error: null });
  await expect(
    updateAdminMaterial("c", "missing", { visibility: "team_only" }),
  ).rejects.toThrow();
  expect(query.update).not.toHaveBeenCalled();
});
it("deletes only scoped metadata and reports missing deletion", async () => {
  await deleteAdminMaterial("c", "material");
  expect(query.eq).toHaveBeenCalledWith("course_id", "c");
  expect(list).not.toHaveBeenCalled();
  query.maybeSingle.mockResolvedValue({ data: null, error: null });
  await expect(deleteAdminMaterial("c", "missing")).rejects.toThrow();
});
it("does not ignore SDK write errors", async () => {
  query.insert.mockResolvedValue({ error: new Error("write failed") });
  await expect(
    addAdminMaterial("c", {
      title: "Guide",
      type: "link",
      url: "https://example.com",
    }),
  ).rejects.toThrow("write failed");
});
