jest.mock("@/lib/auth/server", () => ({ requireAdmin: jest.fn() }));
jest.mock("@/lib/auth/authoring-gate", () => ({
  assertCanAuthorCourse: jest.fn(),
}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(),
}));
jest.mock(
  "@/features/courses/infrastructure/supabaseAdminCourseRepository.server",
  () => ({ getAdminCourse: jest.fn() }),
);
jest.mock("@/lib/audit", () => ({ auditService: { logEvent: jest.fn() } }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { getAdminCourse } from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";
import { auditService } from "@/lib/audit";
import {
  setCourseCommercialState,
  validateCoursePublishable,
  toggleCourseStatus,
} from "../admin-publishing";
const rpc = jest.fn();
beforeEach(() => {
  jest.resetAllMocks();
  jest
    .mocked(requireAdmin)
    .mockResolvedValue({ uid: "admin", email: "admin@example.invalid" } as any);
  jest.mocked(createSupabaseServiceClient).mockReturnValue({ rpc } as any);
  rpc.mockResolvedValue({
    data: { status: "closed", isPublished: true, contentRevision: 2 },
    error: null,
  });
});
it("publishes commercial data without loading modules or lessons", async () => {
  jest.mocked(getAdminCourse).mockResolvedValue({
    title: "Oferta",
    description: "Informações",
    coverImage: "/cover.jpg",
  } as any);
  expect(await validateCoursePublishable("offer")).toEqual({
    valid: true,
    errors: [],
  });
  expect(await setCourseCommercialState("offer", "publish")).toMatchObject({
    success: true,
    newStatus: "closed",
    isPublished: true,
  });
  expect(rpc).toHaveBeenCalledWith("set_course_commercial_state", {
    p_actor: "admin",
    p_course: "offer",
    p_command: "publish",
  });
});
it("rejects an unauthorized actor before reaching privileged data", async () => {
  jest.mocked(requireAdmin).mockRejectedValue(new Error("Forbidden"));
  await expect(validateCoursePublishable("offer")).rejects.toThrow("Forbidden");
  await expect(setCourseCommercialState("offer", "open")).rejects.toThrow(
    "Forbidden",
  );
  expect(rpc).not.toHaveBeenCalled();
  expect(getAdminCourse).not.toHaveBeenCalled();
});
it("reports the missing initial charge without success", async () => {
  rpc.mockResolvedValue({
    data: null,
    error: { message: "Initial Pix price required" },
  });
  expect(await setCourseCommercialState("offer", "open")).toMatchObject({
    success: false,
    error: expect.stringContaining("Pix"),
  });
});
it("does not report a rolled-back state when a subsequent audit delivery fails", async () => {
  jest
    .mocked(auditService.logEvent)
    .mockRejectedValue(new Error("audit offline"));
  const spy = jest.spyOn(console, "error").mockImplementation(() => {});
  expect(await setCourseCommercialState("offer", "publish")).toMatchObject({
    success: true,
  });
  spy.mockRestore();
});
it("ignores client status in the compatibility action", async () => {
  jest
    .mocked(getAdminCourse)
    .mockResolvedValue({ isPublished: true, status: "closed" } as any);
  await toggleCourseStatus("offer", "draft");
  expect(rpc).toHaveBeenCalledWith(
    "set_course_commercial_state",
    expect.objectContaining({ p_command: "unpublish" }),
  );
});
