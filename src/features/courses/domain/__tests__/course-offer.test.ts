import { parseAmountCents, validateCommercialFields } from "../course-offer";
describe("Commercial amount validation", () => {
  it("parses decimal cents exactly and preserves an undefined price", () => {
    expect(parseAmountCents("250,05")).toBe(25005);
    expect(parseAmountCents("0.29")).toBe(29);
    expect(parseAmountCents(" ")).toBeNull();
    expect(parseAmountCents("0")).toBe(0);
  });
  it("rejects invalid or oversized money and installment counts", () => {
    for (const text of ["-1", "NaN", "1e5", "250,005", "21474836.48"])
      expect(() => parseAmountCents(text)).toThrow();
    for (const installments of [0, 1.5, 121])
      expect(() => validateCommercialFields({ installments })).toThrow();
    expect(() => validateCommercialFields({ pixPriceCents: 0 })).toThrow();
    expect(() =>
      validateCommercialFields({
        totalPriceCents: 0,
        installments: 120,
        pixPriceCents: 25000,
      }),
    ).not.toThrow();
  });
});
