export function validateCommercialFields(data: {
  totalPriceCents?: number | null;
  installments?: number | null;
  pixPriceCents?: number | null;
}) {
  for (const key of ["totalPriceCents", "pixPriceCents"] as const) {
    const value = data[key];
    if (
      value !== undefined &&
      value !== null &&
      (!Number.isInteger(value) ||
        value < (key === "pixPriceCents" ? 1 : 0) ||
        value > 2147483647)
    ) {
      throw new Error("Valor comercial inválido.");
    }
  }
  const count = data.installments;
  if (
    count !== undefined &&
    count !== null &&
    (!Number.isInteger(count) || count < 1 || count > 120)
  ) {
    throw new Error("Informe um número de parcelas entre 1 e 120.");
  }
}

export function parseAmountCents(input: string): number | null {
  const text = input.trim().replace(",", ".");
  if (!text) return null;
  if (!/^\d+(?:\.\d{1,2})?$/.test(text))
    throw new Error("Informe um valor com até duas casas decimais.");
  const [whole, fraction = ""] = text.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents > 2147483647)
    throw new Error("Valor comercial inválido.");
  return cents;
}
