import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { createSupabaseChainMock } from "@/test-utils/supabaseMock";

const from = jest.fn();
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({ from }),
}));

import {
  awardXp,
  getProfile,
  listProfiles,
} from "../supabaseGamificationRepository.server";

describe("supabaseGamificationRepository", () => {
  beforeEach(() => {
    from.mockReset();
  });

  it("creates a default profile when one is missing", async () => {
    const profileChain = createSupabaseChainMock({ data: null });
    from.mockReturnValue(profileChain);

    const client = { from } as any;

    await expect(getProfile("user-1", client)).resolves.toEqual(
      expect.objectContaining({
        userId: "user-1",
        totalXp: 0,
        level: 1,
      }),
    );
  });

  it("awards through the atomic ledger RPC with a deterministic key", async () => {
    const profileChain = createSupabaseChainMock({
      data: {
        user_id: "user-1",
        total_xp: 10,
        level: 1,
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
        badges: [],
        created_at: "2026-09-05T10:00:00.000Z",
        updated_at: "2026-09-05T10:00:00.000Z",
      },
    });
    from.mockImplementation((table) => {
      if (table === "gamification_profiles") return profileChain;
      if (table === "earned_badges")
        return createSupabaseChainMock({ data: { id: "badge-1" } });
      throw new Error(`unexpected table ${table}`);
    });

    const rpc = jest.fn().mockResolvedValue({
      data: [{ new_total_xp: 35, new_level: 1, awarded: true }],
      error: null,
    });
    const client = { from, rpc } as any;

    await expect(
      awardXp(
        {
          userId: "user-1",
          amount: 25,
          reason: "daily_login",
          eventKey: "daily-login:2026-09-13",
          metadata: { source: "test" },
        },
        client,
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        newTotalXp: 35,
      }),
    );

    expect(rpc).toHaveBeenCalledWith(
      "grant_xp_idempotent",
      expect.objectContaining({ p_event_key: "daily-login:2026-09-13" }),
    );
  });

  it("lists profiles by xp", async () => {
    const chain = createSupabaseChainMock({
      data: [
        {
          user_id: "user-1",
          total_xp: 50,
          level: 2,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: null,
          badges: [],
          created_at: "2026-09-05T10:00:00.000Z",
          updated_at: "2026-09-05T10:00:00.000Z",
        },
      ],
    });
    from.mockReturnValue(chain);

    const client = { from } as any;

    await expect(listProfiles(client)).resolves.toEqual([
      expect.objectContaining({ userId: "user-1", totalXp: 50 }),
    ]);
  });
});
