import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { createSupabaseChainMock } from "@/test-utils/supabaseMock";

const from = jest.fn();
jest.mock("@/infrastructure/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({ from }),
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

  it("writes an xp transaction and updates the profile", async () => {
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
    const txChain = createSupabaseChainMock({ data: { id: "tx-1" } });
    from.mockImplementation((table) => {
      if (table === "gamification_profiles") return profileChain;
      if (table === "xp_transactions") return txChain;
      if (table === "earned_badges")
        return createSupabaseChainMock({ data: { id: "badge-1" } });
      throw new Error(`unexpected table ${table}`);
    });

    const client = { from } as any;

    await expect(
      awardXp("user-1", 25, "daily_login", { source: "test" }, client),
    ).resolves.toEqual(
      expect.objectContaining({
        newTotalXp: 35,
      }),
    );

    expect(from).toHaveBeenCalledWith("xp_transactions");
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
