import { pixReceiptType } from "../pix-receipt";
describe("receipt file signatures", () => {
  it("accepts PNG, JPEG and PDF headers", () => {
    expect(
      pixReceiptType(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]))
        ?.contentType,
    ).toBe("image/png");
    expect(pixReceiptType(new Uint8Array([255, 216, 255]))?.extension).toBe(
      "jpg",
    );
    expect(
      pixReceiptType(new Uint8Array([37, 80, 68, 70, 45, 49, 46, 55]))
        ?.contentType,
    ).toBe("application/pdf");
  });
  it("rejects renamed HTML and empty files", () => {
    expect(pixReceiptType(new Uint8Array([60, 104, 116, 109, 108]))).toBeNull();
    expect(pixReceiptType(new Uint8Array())).toBeNull();
  });
});
