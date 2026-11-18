/** Real Pix action + real course guard, with an isolated stateful persistence double. */
const session = jest.fn(),
  admin = jest.fn(),
  rpc = jest.fn();
const enrollments = new Map<string, any>();
const course = { id: "pilot", isPublished: true, status: "open" };
jest.mock("../server", () => ({
  verifySession: () => session(),
  requireAdmin: () => admin(),
}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({ rpc }),
}));
jest.mock(
  "@/features/courses/infrastructure/supabaseAdminCourseRepository.server",
  () => ({ getAdminCourse: async () => course }),
);
jest.mock(
  "@/features/enrollments/infrastructure/supabaseEnrollmentRepository.server",
  () => ({
    findEnrollmentBySupabaseUser: async (uid: string) =>
      enrollments.get(uid) ?? null,
  }),
);
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/lib/logger", () => ({ logger: { warn: jest.fn() } }));
import { assertCanAccessCourse } from "../access-gate";
import {
  approvePixEnrollment,
  rejectPixEnrollment,
} from "@/app/actions/enrollment-pix";

const confirmation = {
  bankReference: "LOCAL-REFERENCE",
  receivedAt: "2026-01-01T00:00:00.000Z",
  receivedConfirmed: true as const,
  receivedAmountCents: 10000,
};
beforeEach(() => {
  jest.clearAllMocks();
  course.isPublished = true;
  course.status = "open";
  enrollments.clear();
  enrollments.set("student-a", {
    id: "enrollment-a",
    status: "pending_approval",
    paymentMethod: "pix",
  });
  session.mockResolvedValue({
    uid: "student-a",
    isActive: true,
    isAdmin: false,
  });
  admin.mockResolvedValue({ uid: "admin" });
  rpc.mockImplementation(async (_name, args) => {
    const row = enrollments.get(args.p_user);
    if (!row) return { error: { code: "missing-order" } };
    const alreadyProcessed = row.status === "active";
    row.status = args.p_approve ? "active" : "rejected";
    return { data: { alreadyProcessed }, error: null };
  });
});
it("blocks pending Pix and grants access only after successful administrative reconciliation", async () => {
  await expect(
    assertCanAccessCourse("student-a", "pilot"),
  ).rejects.toMatchObject({ code: "ENROLLMENT_PENDING" });
  expect(
    await approvePixEnrollment("student-a", "pilot", confirmation),
  ).toMatchObject({ success: true });
  expect(rpc).toHaveBeenCalledWith(
    "review_manual_pix_order",
    expect.objectContaining({
      p_admin: "admin",
      p_user: "student-a",
      p_approve: true,
    }),
  );
  expect(await assertCanAccessCourse("student-a", "pilot")).toMatchObject({
    enrollmentId: "enrollment-a",
  });
  expect(
    await approvePixEnrollment("student-a", "pilot", confirmation),
  ).toMatchObject({ alreadyProcessed: true });
});
it("does not grant access after failed reconciliation or rejection", async () => {
  rpc.mockResolvedValueOnce({ error: { code: "failed" } });
  expect(
    await approvePixEnrollment("student-a", "pilot", confirmation),
  ).toMatchObject({ success: false });
  await expect(
    assertCanAccessCourse("student-a", "pilot"),
  ).rejects.toMatchObject({ code: "ENROLLMENT_PENDING" });
  expect(
    await rejectPixEnrollment("student-a", "pilot", "Crédito não recebido"),
  ).toMatchObject({ success: true });
  await expect(
    assertCanAccessCourse("student-a", "pilot"),
  ).rejects.toMatchObject({ code: "ENROLLMENT_STATUS_NOT_ACTIVE" });
});
it("isolates a second student and rejects a forged first-student identity", async () => {
  await approvePixEnrollment("student-a", "pilot", confirmation);
  session.mockResolvedValue({
    uid: "student-b",
    isActive: true,
    isAdmin: false,
  });
  await expect(
    assertCanAccessCourse("student-b", "pilot"),
  ).rejects.toMatchObject({ code: "ENROLLMENT_NOT_FOUND" });
  await expect(
    assertCanAccessCourse("student-a", "pilot"),
  ).rejects.toMatchObject({ code: "ACCESS_DENIED" });
});
it("blocks an approved enrollment after expiry or course unpublishing", async () => {
  await approvePixEnrollment("student-a", "pilot", confirmation);
  enrollments.get("student-a").accessUntil = "2000-01-01T00:00:00Z";
  await expect(
    assertCanAccessCourse("student-a", "pilot"),
  ).rejects.toMatchObject({ code: "ENROLLMENT_EXPIRED" });
  delete enrollments.get("student-a").accessUntil;
  course.isPublished = false;
  await expect(
    assertCanAccessCourse("student-a", "pilot"),
  ).rejects.toMatchObject({ code: "COURSE_NOT_PUBLISHED" });
});
