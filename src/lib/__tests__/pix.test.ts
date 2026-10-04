import { buildPixPayload, getPixConfig } from "@/lib/pix";

describe("pix payload builder", () => {
  afterEach(() => {
    delete process.env.PIX_MERCHANT_KEY;
    delete process.env.PIX_MERCHANT_NAME;
    delete process.env.PIX_MERCHANT_CITY;
  });

  it("returns null config when PIX_MERCHANT_KEY is not set", () => {
    delete process.env.PIX_MERCHANT_KEY;
    expect(getPixConfig()).toBeNull();
  });

  it("reads a configured merchant key with sensible defaults", () => {
    process.env.PIX_MERCHANT_KEY = "chave@example.com";
    const config = getPixConfig();
    expect(config).toEqual({
      key: "chave@example.com",
      merchantName: "INSTITUTO FIGURA VIVA",
      merchantCity: "SAO PAULO",
    });
  });

  it("builds a payload ending in a valid 4-hex-digit CRC preceded by 6304", () => {
    const payload = buildPixPayload(
      {
        key: "chave@example.com",
        merchantName: "Instituto Figura Viva",
        merchantCity: "Sao Paulo",
      },
      { txId: "abc123" },
    );

    expect(payload.endsWith("")).toBe(true);
    expect(payload).toMatch(/6304[0-9A-F]{4}$/);
    // Must embed the real key, never a random one.
    expect(payload).toContain("chave@example.com");
  });

  it("includes the amount field only when a positive amount is given", () => {
    const config = {
      key: "chave@example.com",
      merchantName: "Instituto",
      merchantCity: "Sao Paulo",
    };

    const withAmount = buildPixPayload(config, { amount: 199.9, txId: "x" });
    expect(withAmount).toContain("5406199.90");

    const withoutAmount = buildPixPayload(config, { txId: "x" });
    expect(withoutAmount).not.toMatch(/54\d{2}\d+\.\d{2}/);
  });

  it("never embeds Math.random-style non-deterministic content for the same input", () => {
    const config = {
      key: "chave@example.com",
      merchantName: "Instituto",
      merchantCity: "Sao Paulo",
    };
    const a = buildPixPayload(config, { txId: "same" });
    const b = buildPixPayload(config, { txId: "same" });
    expect(a).toBe(b);
  });
});
