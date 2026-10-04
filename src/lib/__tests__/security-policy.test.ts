import { protectedContentSecurityPolicy } from "../security-policy";
it("requires a nonce and prevents inline/eval scripts in production", () => {
  const policy = protectedContentSecurityPolicy("safeNonce123");
  const scripts = policy
    .split(";")
    .find((value) => value.trim().startsWith("script-src"));
  expect(scripts).toContain("'nonce-safeNonce123'");
  expect(scripts).toContain("'strict-dynamic'");
  expect(scripts).not.toContain("'unsafe-inline'");
  expect(scripts).not.toContain("'unsafe-eval'");
  expect(policy).toContain("object-src 'none'");
  expect(policy).toContain("form-action 'self'");
});
it("does not interpolate arbitrary policy text", () => {
  expect(() => protectedContentSecurityPolicy("x'; script-src *")).toThrow();
  expect(protectedContentSecurityPolicy("safe", true)).toContain(
    "'unsafe-eval'",
  );
});
