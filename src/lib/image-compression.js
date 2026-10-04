// Node-only core, shared by the upload API, server actions and import scripts.
const sharpModule = require("sharp");
const sharp =
  typeof sharpModule === "function" ? sharpModule : sharpModule.default;

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;
const formats = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

class ImageCompressionError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = "ImageCompressionError";
  }
}

/**
 * Decode before trusting the MIME type; auto-orient and strip metadata.
 * Private evidence retains its format to respect existing bucket policies.
 * @param {Buffer} body
 * @param {string} contentType
 * @param {{ format?: "webp" | "source", maxDimension?: number, avatar?: boolean, quality?: number, maxBytes?: number }} [options]
 */
async function compressImage(body, contentType, options = {}) {
  if (!IMAGE_MIME_TYPES.includes(contentType))
    throw new ImageCompressionError("Formato inválido. Use JPG, PNG ou WEBP.");
  if (
    !body.length ||
    body.length > (options.maxBytes ?? MAX_IMAGE_UPLOAD_BYTES)
  )
    throw new ImageCompressionError(
      "A imagem está vazia ou excede o limite de tamanho.",
    );
  try {
    const image = sharp(body, {
      limitInputPixels: 40_000_000,
      failOn: "warning",
    });
    const metadata = await image.metadata();
    if (
      metadata.format !== formats[contentType] ||
      !metadata.width ||
      !metadata.height
    )
      throw new ImageCompressionError(
        "O conteúdo do arquivo não corresponde ao formato da imagem.",
      );
    if ((metadata.pages ?? 1) > 1)
      throw new ImageCompressionError(
        "Imagens animadas não são suportadas neste upload.",
      );

    const dimension = options.avatar ? 512 : (options.maxDimension ?? 2048);
    let pipeline = image.rotate().resize(dimension, dimension, {
      fit: options.avatar ? "cover" : "inside",
      withoutEnlargement: true,
      position: "centre",
    });
    const format = options.format === "source" ? formats[contentType] : "webp";
    const quality = options.quality ?? 82;
    if (format === "jpeg") pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    else if (format === "png")
      pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
    else pipeline = pipeline.webp({ quality, effort: 4 });
    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    if (data.length > (options.maxBytes ?? MAX_IMAGE_UPLOAD_BYTES))
      throw new ImageCompressionError(
        "A imagem processada excede o limite de tamanho.",
      );
    return {
      body: data,
      contentType: `image/${format}`,
      extension: format === "jpeg" ? "jpg" : format,
      originalBytes: body.length,
      bytes: data.length,
      width: info.width,
      height: info.height,
    };
  } catch (error) {
    if (error instanceof ImageCompressionError) throw error;
    throw new ImageCompressionError(
      "Não foi possível processar a imagem. Envie um arquivo válido.",
    );
  }
}

exports.IMAGE_MIME_TYPES = IMAGE_MIME_TYPES;
exports.MAX_IMAGE_UPLOAD_BYTES = MAX_IMAGE_UPLOAD_BYTES;
exports.ImageCompressionError = ImageCompressionError;
exports.compressImage = compressImage;
