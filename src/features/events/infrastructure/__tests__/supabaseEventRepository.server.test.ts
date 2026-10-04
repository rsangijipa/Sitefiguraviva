import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { createSupabaseChainMock } from "@/test-utils/supabaseMock";

const from = jest.fn();
jest.mock("@/infrastructure/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({ from }),
}));

import {
  checkInEvent,
  listUpcomingEvents,
} from "../supabaseEventRepository.server";

describe("supabaseEventRepository", () => {
  beforeEach(() => {
    from.mockReset();
  });

  it("lists upcoming public events in chronological order", async () => {
    const chain = createSupabaseChainMock({
      data: [
        {
          id: "event-1",
          title: "Future",
          description: null,
          starts_at: "2026-09-06T12:00:00.000Z",
          ends_at: null,
          status: "scheduled",
          is_public: true,
          course_id: null,
          type: "webinar",
          join_url: null,
          location: null,
          cover_image: null,
          check_in_code: null,
          created_at: "2026-09-05T10:00:00.000Z",
          updated_at: "2026-09-05T10:00:00.000Z",
        },
      ],
    });
    from.mockReturnValue(chain);

    const client = { from } as any;

    await expect(listUpcomingEvents(5, client)).resolves.toEqual([
      expect.objectContaining({
        id: "event-1",
        startsAt: "2026-09-06T12:00:00.000Z",
      }),
    ]);

    expect(from).toHaveBeenCalledWith("events");
    expect(chain.eq).toHaveBeenCalledWith("is_public", true);
  });

  it("registers an event check-in once per user", async () => {
    const eventQuery = createSupabaseChainMock({
      data: {
        id: "event-1",
        title: "Live Session",
        course_id: "co-visar",
      },
    });
    const attendanceQuery = createSupabaseChainMock({ data: null });
    from.mockImplementation((table) => {
      if (table === "events") return eventQuery;
      if (table === "event_attendance") return attendanceQuery;
      throw new Error(`unexpected table ${table}`);
    });

    const client = { from } as any;

    await expect(checkInEvent("ABC123", "user-1", client)).resolves.toEqual(
      expect.objectContaining({
        success: true,
        eventTitle: "Live Session",
      }),
    );

    expect(from).toHaveBeenCalledWith("events");
    expect(from).toHaveBeenCalledWith("event_attendance");
  });
});
