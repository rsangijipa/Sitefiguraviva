/**
 * @jest-environment node
 */
jest.mock("@/features/enrollment-emails/processor.server", () => ({
  processEnrollmentEmails: jest.fn(),
}));
import { processEnrollmentEmails } from "@/features/enrollment-emails/processor.server";
import { GET } from "../route";

const call = (authorization?: string) =>
  GET(
    new Request("https://example.test/api/cron/enrollment-emails", {
      headers: authorization ? { authorization } : {},
    }),
  );

beforeEach(() => {
  jest.clearAllMocks();
  process.env.CRON_SECRET = "s3cret-value";
});

it("rejects calls without the cron secret", async () => {
  expect((await call()).status).toBe(401);
  expect((await call("Bearer wrong-value")).status).toBe(401);
  delete process.env.CRON_SECRET;
  expect((await call("Bearer ")).status).toBe(401);
  expect(processEnrollmentEmails).not.toHaveBeenCalled();
});

it("runs the processor and returns its summary", async () => {
  jest.mocked(processEnrollmentEmails).mockResolvedValue({
    status: "done",
    claimed: 2,
    sent: 2,
    retried: 0,
    failed: 0,
    canceledStale: 0,
  });
  const response = await call("Bearer s3cret-value");
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ sent: 2 });
});

it("answers 503 while Resend is not configured", async () => {
  jest.mocked(processEnrollmentEmails).mockResolvedValue({
    status: "not_configured",
    missing: ["RESEND_API_KEY"],
  });
  expect((await call("Bearer s3cret-value")).status).toBe(503);
});
