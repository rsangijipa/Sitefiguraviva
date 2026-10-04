/** @jest-environment node */
const remove = jest.fn();
jest.mock("next/headers", () => ({
  cookies: async () => ({ delete: remove }),
}));
jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: any, init?: any) => ({ body, status: init?.status ?? 200 }),
  },
}));
import { POST } from "../route";
beforeEach(() => remove.mockClear());
it.each([undefined, "https://attacker.invalid"])(
  "refuses logout from untrusted origin %s",
  async (origin) => {
    const req = new Request("https://site.invalid/api/auth/logout", {
      method: "POST",
      headers: origin ? { origin } : {},
    });
    expect((await POST(req)).status).toBe(403);
    expect(remove).not.toHaveBeenCalled();
  },
);
it("clears current and historical impersonation cookies for same-origin logout", async () => {
  expect(
    (
      await POST(
        new Request("https://site.invalid/api/auth/logout", {
          method: "POST",
          headers: { origin: "https://site.invalid" },
        }),
      )
    ).status,
  ).toBe(200);
  expect(remove.mock.calls).toEqual([["session"], ["admin_session_backup"]]);
});
