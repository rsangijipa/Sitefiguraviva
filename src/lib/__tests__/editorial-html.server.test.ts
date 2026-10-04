jest.mock("server-only", () => ({}));
import { sanitizeEditorialHtml } from "../editorial-html.server";
it("renders editorial text on the server and strips stored XSS", () => {
  const html = sanitizeEditorialHtml(
    '<h2>Tema</h2><p>Texto <strong>importante</strong></p><script>alert(1)</script><img src="https://example.com/photo.png" onerror="alert(1)"><a href="javascript:alert(1)" target="_blank">link</a>',
  );
  expect(html).toContain("<h2>Tema</h2>");
  expect(html).toContain("<strong>importante</strong>");
  expect(html).not.toMatch(/<script|onerror|javascript:/);
  expect(html).toContain('rel="noopener noreferrer nofollow ugc"');
});
it("rejects SVG, data images, iframe, inline CSS and protocol-relative links", () => {
  const html = sanitizeEditorialHtml(
    '<svg onload="x()"></svg><iframe src="https://example.com"></iframe><img src="data:image/svg+xml,x"><a href="//example.com">x</a><p style="color:red">Texto</p>',
  );
  expect(html).not.toMatch(/<svg|<iframe|data:|href=|style=/);
  expect(html).toContain("Texto");
  expect(sanitizeEditorialHtml(null)).toBe("");
});
