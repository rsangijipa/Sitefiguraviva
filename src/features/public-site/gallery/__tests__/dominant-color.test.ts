import {
  GALLERY_FALLBACK_COLOR,
  contrastWithWhite,
  dominantColorFromPixels,
  hexToRgb,
  normalizeHexColor,
  overlayBackground,
  readableOverlayColor,
} from "../dominant-color";
import {
  galleryYearFromLegacy,
  mergeGalleryLegacyPayload,
} from "../gallery-payload";

function pixels(...colors: Array<[number, number, number, number?, number?]>) {
  // [r, g, b, alpha = 255, repeat = 1]
  const out: number[] = [];
  for (const [r, g, b, a = 255, repeat = 1] of colors) {
    for (let i = 0; i < repeat; i += 1) out.push(r, g, b, a);
  }
  return Uint8ClampedArray.from(out);
}

describe("dominantColorFromPixels", () => {
  it("returns the most frequent color band", () => {
    const data = pixels([20, 120, 60, 255, 70], [200, 60, 40, 255, 30]);
    const color = hexToRgb(dominantColorFromPixels(data)!);
    expect(color.g).toBeGreaterThan(color.r);
    expect(color.g).toBeGreaterThan(110);
  });

  it("ignores near-white, near-black and transparent pixels", () => {
    const data = pixels(
      [250, 250, 250, 255, 200],
      [5, 5, 5, 255, 200],
      [30, 90, 200, 0, 200],
      [180, 120, 40, 255, 10],
    );
    expect(dominantColorFromPixels(data)).toBe("#b47828");
  });

  it("weights saturated colors over grey of similar frequency", () => {
    const data = pixels([128, 128, 128, 255, 50], [30, 140, 70, 255, 40]);
    const color = hexToRgb(dominantColorFromPixels(data)!);
    expect(color.g).toBe(140);
  });

  it("returns null when no usable pixel remains", () => {
    expect(
      dominantColorFromPixels(pixels([255, 255, 255, 255, 10])),
    ).toBeNull();
    expect(dominantColorFromPixels(new Uint8ClampedArray())).toBeNull();
  });

  it("supports sampling every n-th pixel", () => {
    const data = pixels(
      [200, 40, 40],
      [40, 40, 200],
      [200, 40, 40],
      [40, 40, 200],
    );
    expect(dominantColorFromPixels(data, 2)).toBe("#c82828");
  });
});

describe("overlay color", () => {
  it("darkens light colors until white text is readable", () => {
    const color = readableOverlayColor("#f1e9db");
    expect(contrastWithWhite(hexToRgb(color))).toBeGreaterThanOrEqual(7);
  });

  it("keeps dark colors as they are", () => {
    expect(readableOverlayColor("#005a1f")).toBe("#005a1f");
  });

  it("falls back to the brand green for missing or invalid colors", () => {
    expect(readableOverlayColor(null)).toBe(GALLERY_FALLBACK_COLOR);
    expect(readableOverlayColor("vermelho")).toBe(GALLERY_FALLBACK_COLOR);
    expect(overlayBackground(undefined)).toBe("rgba(0, 90, 31, 0.86)");
  });

  it("normalizes hex input", () => {
    expect(normalizeHexColor(" #ABCDEF ")).toBe("#abcdef");
    expect(normalizeHexColor("abcdef")).toBe("#abcdef");
    expect(normalizeHexColor("#abc")).toBeNull();
    expect(normalizeHexColor("url(javascript:1)")).toBeNull();
  });
});

describe("gallery legacy payload", () => {
  it("keeps unknown keys and stores year and color", () => {
    expect(
      mergeGalleryLegacyPayload(
        { firebase_id: "x", ano: "1999" },
        { category: "Eventos", year: "2024", dominant_color: "#AA3300" },
      ),
    ).toEqual({
      firebase_id: "x",
      category: "Eventos",
      year: "2024",
      dominant_color: "#aa3300",
    });
  });

  it("drops a stale color when the image changes without a new one", () => {
    expect(
      mergeGalleryLegacyPayload(
        { dominant_color: "#112233" },
        { year: "", dominant_color: null, imageChanged: true },
      ),
    ).toEqual({});
    expect(
      mergeGalleryLegacyPayload(
        { dominant_color: "#112233" },
        { year: "", dominant_color: null, imageChanged: false },
      ),
    ).toEqual({ dominant_color: "#112233" });
  });

  it("reads only explicit four-digit years", () => {
    expect(galleryYearFromLegacy({ year: 2023 })).toBe("2023");
    expect(galleryYearFromLegacy({ ano: "2019" })).toBe("2019");
    expect(galleryYearFromLegacy({ year: "ontem" })).toBeNull();
    expect(galleryYearFromLegacy({})).toBeNull();
  });
});
