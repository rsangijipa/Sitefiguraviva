import "server-only";

/**
 * Minimal EMV "Pix Copia e Cola" (BR Code) payload builder.
 *
 * The enrollment PIX flow previously generated a payload with a
 * `Math.random()` string in place of a real merchant key (see
 * docs/RELATORIO_AUDITORIA_COMPLETA_2026-09-04.md, item "PIX simulado"). That
 * code has no valid checksum and does not point at any real account, so it
 * either fails to scan or, worse, looks like a legitimate payment request
 * while doing nothing. This module builds a spec-correct payload from a real,
 * operator-configured PIX key (`PIX_MERCHANT_KEY` + friends) so the QR code
 * is either genuine or entirely absent -- never fake-but-plausible.
 */

function tlv(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

/** CRC-16/CCITT-FALSE, as required by the EMV QR Code spec. */
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc =
        (crc & 0x8000) !== 0
          ? ((crc << 1) ^ 0x1021) & 0xffff
          : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

// Combining diacritical marks block (U+0300..U+036F), built from code points
// rather than a literal character range to avoid any source-encoding ambiguity.
const DIACRITICS_PATTERN = new RegExp(
  `[${String.fromCodePoint(0x0300)}-${String.fromCodePoint(0x036f)}]`,
  "g",
);
const NON_ALPHANUMERIC_PATTERN = /[^A-Za-z0-9 ]/g;

/** Strips accents/symbols EMV doesn't allow and truncates to `max` chars. */
function sanitizeAscii(value: string, max: number): string {
  const ascii = value
    .normalize("NFKD")
    .replace(DIACRITICS_PATTERN, "")
    .replace(NON_ALPHANUMERIC_PATTERN, "")
    .trim()
    .toUpperCase();
  return ascii.slice(0, max) || "NA";
}

export interface PixConfig {
  key: string;
  merchantName: string;
  merchantCity: string;
}

/** Reads the operator's real PIX key from the environment. Returns null if unconfigured. */
export function getPixConfig(): PixConfig | null {
  const key = process.env.PIX_MERCHANT_KEY?.trim();
  if (!key) return null;

  return {
    key,
    merchantName:
      process.env.PIX_MERCHANT_NAME?.trim() || "INSTITUTO FIGURA VIVA",
    merchantCity: process.env.PIX_MERCHANT_CITY?.trim() || "SAO PAULO",
  };
}

/**
 * Builds a real, scannable "Pix Copia e Cola" string. `amount` is the value
 * in BRL (e.g. 199.9); omit it to leave the amount open for the payer to
 * enter manually. `txId` should be short and alphanumeric (order/enrollment id).
 */
export function buildPixPayload(
  config: PixConfig,
  { amount, txId }: { amount?: number; txId?: string },
): string {
  const merchantAccountInfo =
    tlv("00", "BR.GOV.BCB.PIX") + tlv("01", config.key.slice(0, 77));

  const amountField =
    typeof amount === "number" && amount > 0
      ? tlv("54", amount.toFixed(2))
      : "";

  const referenceLabel = sanitizeAscii(txId || "FIGURAVIVA", 25).replace(
    /\s/g,
    "",
  );

  const withoutCrc =
    tlv("00", "01") +
    tlv("01", "11") +
    tlv("26", merchantAccountInfo) +
    tlv("52", "0000") +
    tlv("53", "986") +
    amountField +
    tlv("58", "BR") +
    tlv("59", sanitizeAscii(config.merchantName, 25)) +
    tlv("60", sanitizeAscii(config.merchantCity, 15)) +
    tlv("62", tlv("05", referenceLabel || "***")) +
    "6304";

  return withoutCrc + crc16(withoutCrc);
}
