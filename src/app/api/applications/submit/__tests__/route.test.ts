/** @jest-environment node */

const set = jest.fn().mockResolvedValue(undefined);

jest.mock("@/lib/firebase/admin", () => ({
  adminDb: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({ set })),
    })),
  },
}));

jest.mock("@/lib/auth/supabase-session", () => ({
  getBearerSupabaseSessionClaims: jest.fn().mockResolvedValue({
    uid: "user-1",
    isActive: true,
  }),
}));

jest.mock("@/lib/rateLimit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ allowed: true }),
  RateLimitPresets: { APPLICATION_SUBMIT: {} },
  getClientIdentifier: jest.fn(),
}));

jest.mock("firebase-admin/firestore", () => ({
  FieldValue: { serverTimestamp: jest.fn(() => "timestamp") },
}));

import { POST } from "../route";

describe("POST /api/applications/submit", () => {
  beforeEach(() => {
    set.mockClear();
  });

  it("accepts the enrollment form payload with LGPD consent timestamp", async () => {
    const response = await POST(
      {
        text: async () =>
          JSON.stringify({
          courseId: "co-visar",
          answers: {
            fullName: "Richard",
            phone: "6992399836",
            profession: "Psicólogo",
          },
          consent: { lgpd: true, acceptedAt: "2026-09-05T00:00:00.000Z" },
          }),
      } as any,
    );

    expect(response.status).toBe(200);
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        consent: { lgpd: true, acceptedAt: "2026-09-05T00:00:00.000Z" },
      }),
      { merge: true },
    );
  });
});
