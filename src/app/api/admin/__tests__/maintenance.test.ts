/** @jest-environment node */
const session = jest.fn();
const client = jest.fn();
jest.mock("@/lib/auth/server", () => ({ verifySession: () => session() }));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => client(),
}));
import * as seed from "../seed/route";
import * as migration from "../migrate-content/route";
import * as stats from "../sync-stats/route";
const routes = [seed, migration, stats];
beforeEach(() => jest.clearAllMocks());
it.each(routes)(
  "rejects GET without invoking authentication or the database",
  async (route) => {
    const result = await route.GET();
    expect(result.status).toBe(405);
    expect(result.headers.get("Allow")).toBe("POST");
    expect(session).not.toHaveBeenCalled();
    expect(client).not.toHaveBeenCalled();
  },
);
it.each(routes)(
  "rejects missing and cross-site Origins before touching data",
  async (route) => {
    for (const origin of [undefined, "https://attacker.invalid"]) {
      const req = new Request("https://site.invalid/api/admin/seed", {
        method: "POST",
        headers: origin ? { origin } : {},
      });
      expect((await route.POST(req as never)).status).toBe(403);
    }
    expect(session).not.toHaveBeenCalled();
    expect(client).not.toHaveBeenCalled();
  },
);
it.each(routes)(
  "requires an authenticated administrator for same-origin requests",
  async (route) => {
    const req = new Request("https://site.invalid/api/admin/seed", {
      method: "POST",
      headers: { origin: "https://site.invalid" },
    });
    session.mockResolvedValueOnce(null);
    expect((await route.POST(req as never)).status).toBe(401);
    session.mockResolvedValueOnce({ isAdmin: false });
    expect((await route.POST(req as never)).status).toBe(403);
    expect(client).not.toHaveBeenCalled();
  },
);
