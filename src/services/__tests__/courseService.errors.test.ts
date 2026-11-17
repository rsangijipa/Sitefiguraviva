import { courseService } from "../courseService";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";

jest.mock("@/infrastructure/supabase/client", () => ({ createSupabaseBrowserClient: jest.fn() }));

it("propagates catalog and material failures so the portal can offer retry instead of an empty library", async () => {
  const error = new Error("Connection unavailable");
  const query = { select: jest.fn().mockReturnThis(), in: jest.fn().mockResolvedValue({ data: null, error }), eq: jest.fn().mockResolvedValue({ data: null, error }) };
  (createSupabaseBrowserClient as jest.Mock).mockReturnValue({ from: jest.fn().mockReturnValue(query) });
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  await expect(courseService.getCoursesByIds(["course"])).rejects.toThrow("Connection unavailable");
  await expect(courseService.getCourseMaterials("course")).rejects.toThrow("Connection unavailable");
  log.mockRestore();
});

it("keeps a successful empty material catalog distinct from a request failure", async () => {
  const query = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: [], error: null }) };
  (createSupabaseBrowserClient as jest.Mock).mockReturnValue({ from: jest.fn().mockReturnValue(query) });
  await expect(courseService.getCourseMaterials("course")).resolves.toEqual([]);
});
