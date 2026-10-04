/** @jest-environment node */
import sharp from "sharp";
import { compressImage, ImageCompressionError } from "../image-compression";

async function fixture(width = 3000, height = 2000) {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 34, g: 90, b: 60, alpha: 0.5 },
    },
  })
    .png()
    .toBuffer();
}

describe("real image compression", () => {
  it("reduces bytes and dimensions, preserves transparency, and stores valid WebP", async () => {
    const source = await fixture();
    const result = await compressImage(source, "image/png");
    const decoded = await sharp(result.body).metadata();
    expect(result.bytes).toBeLessThan(source.length);
    expect(result).toMatchObject({
      contentType: "image/webp",
      extension: "webp",
      width: 2048,
      height: 1365,
    });
    expect(decoded).toMatchObject({ format: "webp", hasAlpha: true });
    expect(decoded.exif).toBeUndefined();
  });

  it("does not enlarge small images", async () => {
    expect(
      await compressImage(await fixture(80, 40), "image/png"),
    ).toMatchObject({ width: 80, height: 40 });
  });

  it("rotates phone photos before removing EXIF metadata", async () => {
    const source = await sharp(await fixture(120, 80))
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const result = await compressImage(source, "image/jpeg");
    expect(result).toMatchObject({ width: 80, height: 120 });
    expect((await sharp(result.body).metadata()).exif).toBeUndefined();
  });

  it("creates a 512px avatar crop", async () => {
    const result = await compressImage(await fixture(1000, 700), "image/png", {
      avatar: true,
    });
    expect(result).toMatchObject({
      width: 512,
      height: 512,
      contentType: "image/webp",
    });
  });

  it.each(["png", "jpeg"] as const)(
    "retains %s for private evidence",
    async (format) => {
      const source = await sharp(await fixture(120, 80))
        .toFormat(format)
        .toBuffer();
      const result = await compressImage(source, `image/${format}`, {
        format: "source",
      });
      expect(result.contentType).toBe(`image/${format}`);
      expect((await sharp(result.body).metadata()).format).toBe(format);
    },
  );

  it("rejects corrupt images, spoofed MIME types, empty files and oversized inputs", async () => {
    await expect(
      compressImage(Buffer.from("<html>"), "image/jpeg"),
    ).rejects.toBeInstanceOf(ImageCompressionError);
    await expect(
      compressImage(await fixture(30, 30), "image/jpeg"),
    ).rejects.toThrow("não corresponde");
    await expect(compressImage(Buffer.alloc(0), "image/png")).rejects.toThrow(
      "vazia",
    );
    await expect(
      compressImage(Buffer.alloc(20), "image/png", { maxBytes: 10 }),
    ).rejects.toThrow("limite");
    await expect(
      compressImage(Buffer.from("<svg/>"), "image/svg+xml"),
    ).rejects.toThrow("Formato inválido");
  });
});
