import { createEvent, deleteEvent, updateEventStatus } from "@/actions/event";
import { checkInEvent } from "@/app/actions/event";
import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/auth/server", () => ({
  verifySession: jest.fn(),
}));

jest.mock("@/lib/rateLimit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ allowed: true, remaining: 10, resetAt: 0 }),
  RateLimitPresets: { CREATE_EVENT: {} },
}));

jest.mock("@/lib/audit", () => ({
  logAudit: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/features/notifications/infrastructure/supabaseNotificationRepository.server", () => ({
  createNotification: jest.fn().mockResolvedValue("notif-1"),
}));

jest.mock("@/lib/events/bus", () => ({
  publishEvent: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(),
}));

describe("event actions (Supabase)", () => {
  const mockInsert = jest.fn();
  const mockSelect = jest.fn();
  const mockDelete = jest.fn();
  const mockUpdate = jest.fn();
  const mockEq = jest.fn();
  const mockIn = jest.fn();
  const mockMaybeSingle = jest.fn();

  const mockSupabase = {
    from: jest.fn((table: string) => {
      if (table === "events") {
        return {
          insert: mockInsert,
          delete: jest.fn(() => ({
            eq: mockEq.mockResolvedValue({ error: null }),
          })),
          update: jest.fn(() => ({
            eq: mockEq.mockResolvedValue({ error: null }),
          })),
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              in: jest.fn(() => ({
                maybeSingle: mockMaybeSingle,
              })),
            })),
          })),
        };
      }
      if (table === "event_attendance") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                maybeSingle: mockMaybeSingle,
              })),
            })),
          })),
          insert: mockInsert,
          update: jest.fn(() => ({
            eq: mockEq.mockResolvedValue({ error: null }),
          })),
        };
      }
      if (table === "enrollments") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({ data: [], error: null }),
            })),
          })),
        };
      }
      return {};
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createSupabaseServiceClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe("createEvent", () => {
    it("rejects unauthorized caller", async () => {
      (verifySession as jest.Mock).mockResolvedValue(null);
      const res = await createEvent({
        title: "Mentorship",
        description: "Live Q&A",
        startsAt: "2026-10-01T18:00:00.000Z",
        endsAt: "2026-10-01T19:00:00.000Z",
        type: "webinar",
      });
      expect(res).toEqual({ error: "Unauthorized" });
    });

    it("rejects non-admin caller", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        uid: "user-1",
        role: "student",
        isAdmin: false,
      });
      const res = await createEvent({
        title: "Mentorship",
        description: "Live Q&A",
        startsAt: "2026-10-01T18:00:00.000Z",
        endsAt: "2026-10-01T19:00:00.000Z",
        type: "webinar",
      });
      expect(res).toEqual({ error: "Forbidden: Admins only" });
    });

    it("creates an event for admin", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        uid: "admin-1",
        role: "admin",
        isAdmin: true,
      });
      mockInsert.mockResolvedValue({ error: null });

      const res = await createEvent({
        title: "Mentorship",
        description: "Live Q&A",
        startsAt: "2026-10-01T18:00:00.000Z",
        endsAt: "2026-10-01T19:00:00.000Z",
        type: "webinar",
      });
      expect(res).toEqual(expect.objectContaining({ success: true }));
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Mentorship",
          description: "Live Q&A",
          status: "scheduled",
        }),
      );
    });
  });

  describe("deleteEvent", () => {
    it("deletes event for admin", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        uid: "admin-1",
        role: "admin",
        isAdmin: true,
      });

      const res = await deleteEvent("ev-1");
      expect(res).toEqual({ success: true });
    });
  });

  describe("updateEventStatus", () => {
    it("updates status for admin", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        uid: "admin-1",
        role: "admin",
        isAdmin: true,
      });

      const res = await updateEventStatus("ev-1", "live");
      expect(res).toEqual({ success: true });
    });
  });
});
