import { awardManualXp, awardManualBadge } from "../gamification-admin";
import { requireAdmin } from "@/lib/auth/server";
import {
  awardXp,
  awardBadge,
} from "@/features/gamification/infrastructure/supabaseGamificationRepository.server";
import { BADGE_DEFINITIONS } from "@/lib/gamification";
jest.mock("@/lib/auth/server", () => ({ requireAdmin: jest.fn() }));
jest.mock(
  "@/features/gamification/infrastructure/supabaseGamificationRepository.server",
  () => ({ awardXp: jest.fn(), awardBadge: jest.fn() }),
);
jest.mock("@/lib/audit", () => ({ auditService: { logEvent: jest.fn() } }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(requireAdmin).mockResolvedValue({ uid: "admin" } as never);
  jest
    .mocked(awardXp)
    .mockResolvedValue({
      newTotalXp: 10,
      newLevel: 1,
      leveledUp: false,
      awarded: true,
    });
  jest.mocked(awardBadge).mockResolvedValue(undefined);
});
it.each([NaN, Infinity, -1, 0, 1.5, 100001])(
  "rejects invalid XP %s before writing",
  async (amount) => {
    expect(await awardManualXp("user", amount, "Motivo")).toHaveProperty(
      "error",
    );
    expect(awardXp).not.toHaveBeenCalled();
  },
);
it("allows two deliberate awards on the same day instead of silently deduplicating them", async () => {
  await awardManualXp("user", 10, "Primeiro motivo");
  await awardManualXp("user", 10, "Segundo motivo");
  const events = jest
    .mocked(awardXp)
    .mock.calls.map((call) => call[0].eventKey);
  expect(new Set(events).size).toBe(2);
});
it("does not report success when the Supabase award fails", async () => {
  const spy = jest.spyOn(console, "error").mockImplementation(() => {});
  jest.mocked(awardXp).mockRejectedValue(new Error("offline"));
  expect(await awardManualXp("user", 10, "Motivo")).toHaveProperty("error");
  spy.mockRestore();
});
it("validates the badge and writes to the Supabase repository", async () => {
  expect(await awardManualBadge("user", "unknown-badge")).toHaveProperty(
    "error",
  );
  expect(awardBadge).not.toHaveBeenCalled();
  expect(await awardManualBadge("user", BADGE_DEFINITIONS[0].id)).toEqual({
    success: true,
  });
  expect(awardBadge).toHaveBeenCalledWith("user", BADGE_DEFINITIONS[0].id);
});
