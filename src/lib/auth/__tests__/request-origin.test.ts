/** @jest-environment node */
import { isSameOriginRequest } from "../request-origin";
const request = (origin?: string, host?: string, forwarded?: string) =>
  new Request("https://localhost/api/auth/login", {
    method: "POST",
    headers: {
      ...(origin ? { origin } : {}),
      ...(host ? { host } : {}),
      ...(forwarded ? { "x-forwarded-host": forwarded } : {}),
    },
  });
it("accepts the browser destination when Next uses an internal hostname", () => {
  expect(
    isSameOriginRequest(request("https://site.invalid", "site.invalid")),
  ).toBe(true);
});
it("rejects a cross-site request to the real destination", () => {
  expect(
    isSameOriginRequest(request("https://attacker.invalid", "site.invalid")),
  ).toBe(false);
});
it("ignores an untrusted forwarded-host override", () => {
  expect(
    isSameOriginRequest(
      request("https://attacker.invalid", "site.invalid", "attacker.invalid"),
    ),
  ).toBe(false);
});
it("rejects an absent Origin", () => {
  expect(isSameOriginRequest(request(undefined, "site.invalid"))).toBe(false);
});
it.each(["user:pass@site.invalid", "site.invalid/path", "site.invalid?x=1"])(
  "rejects malformed Host %s",
  (host) => {
    expect(isSameOriginRequest(request("https://site.invalid", host))).toBe(
      false,
    );
  },
);
it("does not accept a path in Origin", () => {
  expect(
    isSameOriginRequest(request("https://site.invalid/path", "site.invalid")),
  ).toBe(false);
});
