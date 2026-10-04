export const MAX_PIX_RECEIPT_BYTES = 5 * 1024 * 1024;
export function pixReceiptType(
  bytes: Uint8Array,
): { extension: string; contentType: string } | null {
  if (
    bytes.length >= 8 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b)
  )
    return { extension: "png", contentType: "image/png" };
  if (
    bytes.length >= 3 &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[2] === 255
  )
    return { extension: "jpg", contentType: "image/jpeg" };
  if (
    bytes.length >= 5 &&
    String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-"
  )
    return { extension: "pdf", contentType: "application/pdf" };
  return null;
}
