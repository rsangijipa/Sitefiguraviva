import { getAuthEmailRedirect } from "../email-flow";
describe("configured Auth redirects", () => {
  const previous = process.env.NEXT_PUBLIC_BASE_URL;
  afterEach(() => {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_BASE_URL;
    else process.env.NEXT_PUBLIC_BASE_URL = previous;
  });
  it("encodes the course as a query value without changing the destination", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://www.institutofiguraviva.com.br";
    const url = new URL(
      getAuthEmailRedirect("confirm", "x?next=https://evil.example"),
    );
    expect(url.origin).toBe("https://www.institutofiguraviva.com.br");
    expect(url.pathname).toBe("/auth/confirm");
    expect(url.searchParams.get("courseId")).toBe(
      "x?next=https://evil.example",
    );
  });
  it("accepts localhost for development but refuses unsafe deployment URLs", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
    expect(getAuthEmailRedirect("recovery")).toBe(
      "http://localhost:3000/auth/update-password",
    );
    for (const base of [
      "http://public.example",
      "javascript:alert(1)",
      "https://user:password@example.com",
    ]) {
      process.env.NEXT_PUBLIC_BASE_URL = base;
      expect(() => getAuthEmailRedirect("confirm")).toThrow();
    }
    delete process.env.NEXT_PUBLIC_BASE_URL;
    expect(() => getAuthEmailRedirect("confirm")).toThrow();
  });
});
