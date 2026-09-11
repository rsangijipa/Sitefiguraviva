/** @jest-environment node */

const upsert = jest.fn().mockResolvedValue({ error: null });
const maybeSingle = jest
  .fn()
  .mockResolvedValueOnce({
    data: { id: "co-visar", status: "open", is_published: true },
    error: null,
  })
  .mockResolvedValueOnce({ data: null, error: null });

const query = () => ({
  select: jest.fn(() => ({
    eq: jest.fn(() => ({ maybeSingle })),
  })),
  upsert,
});

jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(() => ({
    from: jest.fn(query),
  })),
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

import { POST } from "../route";

describe("POST /api/applications/submit", () => {
  beforeEach(() => {
    upsert.mockClear();
  });

  it("accepts the enrollment form payload with LGPD consent timestamp", async () => {
    const response = await POST({
      text: async () =>
        JSON.stringify({
          courseId: "co-visar",
          answers: {
            fullName: "Richard",
            phone: "6992399836",
            profession: "Psicólogo",
          },
          consent: {
            lgpd: true,
            acceptedAt: "2026-09-05T00:00:00.000Z",
            termsVersion: "2026-09-09",
          },
        }),
    } as any);

    expect(response.status).toBe(200);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "user-1_co-visar",
        user_id: "user-1",
        course_id: "co-visar",
        consent: {
          lgpd: true,
          acceptedAt: "2026-09-05T00:00:00.000Z",
          termsVersion: "2026-09-09",
        },
        status: "submitted",
        source: "internal",
      }),
      { onConflict: "id" },
    );
  });
});
