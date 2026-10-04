import { describe, expect, it } from "@jest/globals";
import { mapGamificationProfileToClient } from "../gamificationService";

describe("mapGamificationProfileToClient", () => {
  it("keeps Supabase ISO strings intact at the client service boundary", () => {
    expect(
      mapGamificationProfileToClient({
        userId: "user-1",
        totalXp: 120,
        level: 2,
        currentStreak: 4,
        longestStreak: 7,
        lastActivityDate: "2026-09-05T10:15:30.000Z",
        badges: ["first-step"],
        createdAt: "2026-09-05T10:00:00.000Z",
        updatedAt: "2026-09-05T10:16:00.000Z",
      }),
    ).toEqual({
      uid: "user-1",
      totalXp: 120,
      level: 2,
      currentStreak: 4,
      longestStreak: 7,
      lastActivityDate: "2026-09-05T10:15:30.000Z",
      badges: ["first-step"],
      updatedAt: "2026-09-05T10:16:00.000Z",
    });
  });
});
