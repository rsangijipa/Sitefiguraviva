const session = jest.fn();
const insert = jest.fn();
jest.mock("@/lib/auth/server", () => ({ verifySession: () => session() }));
jest.mock("@/lib/firebase/admin", () => ({
  auth: {},
  adminDb: {
    collection: () => {
      throw new Error("Unexpected legacy write");
    },
  },
}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({ from: () => ({ insert }) }),
}));
import { trackEvent, trackFunnelEvent } from "../analytics";

beforeEach(() => {
  jest.clearAllMocks();
  session.mockResolvedValue({ uid: "student", role: "student" });
  insert.mockResolvedValue({ error: null });
});
it("only acknowledges a persisted canonical event and excludes free text", async () => {
  expect(
    await trackEvent("quiz_start", "quiz", {
      courseId: "course",
      answers: "private",
      token: "secret",
    }),
  ).toEqual({ success: true });
  expect(insert).toHaveBeenCalledWith(
    expect.objectContaining({
      actor_user_id: "student",
      payload: { courseId: "course" },
    }),
  );
});
it.each(["response", "exception"])(
  "reports %s persistence failure without logging payload",
  async (mode) => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    if (mode === "response")
      insert.mockResolvedValue({ error: { message: "sensitive details" } });
    else insert.mockRejectedValue(new Error("sensitive details"));
    expect(
      await trackEvent("quiz_complete", "quiz", { answers: "private" }),
    ).toMatchObject({ success: false });
    expect(log).toHaveBeenCalledWith("Analytics event could not be persisted");
    log.mockRestore();
  },
);
it("denies unauthenticated and cross-user funnel events before writing", async () => {
  session.mockResolvedValue(null);
  expect(await trackEvent("page_view", "lesson")).toMatchObject({
    success: false,
  });
  session.mockResolvedValue({ uid: "student", role: "student" });
  expect(
    await trackFunnelEvent("funnel_enrollment_active", {}, "other"),
  ).toMatchObject({ success: false });
  expect(insert).not.toHaveBeenCalled();
});
it("does not acknowledge a failed funnel write", async () => {
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  insert.mockResolvedValue({ error: { code: "unavailable" } });
  expect(await trackFunnelEvent("funnel_signup")).toMatchObject({
    success: false,
  });
  log.mockRestore();
});
it("rejects arbitrary event types and free text resource identifiers before persistence", async () => {
  expect(await trackEvent("unknown" as any, "quiz")).toMatchObject({
    success: false,
  });
  expect(await trackEvent("page_view", "my private answer")).toMatchObject({
    success: false,
  });
  expect(insert).not.toHaveBeenCalled();
});
