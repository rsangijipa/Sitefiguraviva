jest.mock("@/infrastructure/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getUser: jest
        .fn()
        .mockResolvedValue({ data: { user: null }, error: null }),
    },
  }),
}));

import { saveSession } from "./repository";
import type { PauseSessionRecord } from "./types";

const session: PauseSessionRecord = {
  id: "pause-1",
  userId: "",
  practiceId: "breathing",
  plannedDurationSeconds: 120,
  activeDurationSeconds: 90,
  endedBy: "user",
  reflection: "Percebi meus ombros mais leves.",
  contentVersion: "1",
  createdAt: "2026-09-13T00:00:00.000Z",
  clientRequestId: "request-1",
};

describe("pause-room repository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("keeps an unauthenticated reflection in memory without explicit local consent", async () => {
    await expect(saveSession(session)).resolves.toEqual(session);
    expect(localStorage.getItem("fv_pause_sessions")).toBeNull();
  });

  it("persists an unauthenticated reflection only after local consent", async () => {
    await saveSession(session, { allowLocalStorage: true });

    expect(
      JSON.parse(localStorage.getItem("fv_pause_sessions") || "[]"),
    ).toEqual([session]);
  });
});
