import { getYouTubeVideoId, safeContentUrl } from "../media";

describe("getYouTubeVideoId", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/watch?list=PL1&v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?si=abc", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://m.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ])("extracts the id from %s", (input, expected) => {
    expect(getYouTubeVideoId(input)).toBe(expected);
  });

  it.each([
    [undefined],
    [""],
    ["https://vimeo.com/123456"],
    ["https://evil.example/watch?v=dQw4w9WgXcQ"],
    ["https://www.youtube.com/watch?v=short"],
    ["https://www.youtube.com/channel/UC123"],
  ])("rejects %s", (input) => {
    expect(getYouTubeVideoId(input)).toBeNull();
  });
});

describe("safeContentUrl", () => {
  it("keeps http(s) and same-site relative links", () => {
    expect(safeContentUrl("https://example.com/a.pdf")).toBe(
      "https://example.com/a.pdf",
    );
    expect(safeContentUrl("http://example.com/")).toBe("http://example.com/");
    expect(safeContentUrl("/recursos/igarape")).toBe("/recursos/igarape");
  });

  it.each([
    ["javascript:alert(1)"],
    ["JaVaScRiPt:alert(1)"],
    ["data:text/html,<script>alert(1)</script>"],
    ["//evil.example/x"],
    ["not a url"],
    [""],
    [undefined],
  ])("rejects %s", (input) => {
    expect(safeContentUrl(input)).toBeNull();
  });
});
