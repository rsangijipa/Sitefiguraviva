import { calculateASRS, ASRS_SCREENING_THRESHOLD } from "./asrs";

/**
 * Testes do ASRS v1.1 6Q
 * Validar thresholds e classificação
 */

describe("ASRS v1.1 Scoring", () => {
  test("score 0 - all zeros (negative)", () => {
    const result = calculateASRS({
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      q5: 0,
      q6: 0,
    });
    expect(result.rawScore).toBe(0);
    expect(result.classification).toBe("Faixa negativa baixa");
    expect(result.screenStatus).toBe("negative");
  });

  test("score 9 - negative low boundary", () => {
    const result = calculateASRS({
      q1: 2,
      q2: 1,
      q3: 2,
      q4: 2,
      q5: 1,
      q6: 1,
    });
    expect(result.rawScore).toBe(9);
    expect(result.classification).toBe("Faixa negativa baixa");
    expect(result.screenStatus).toBe("negative");
  });

  test("score 10 - negative high", () => {
    const result = calculateASRS({
      q1: 2,
      q2: 2,
      q3: 2,
      q4: 2,
      q5: 1,
      q6: 1,
    });
    expect(result.rawScore).toBe(10);
    expect(result.classification).toBe("Faixa negativa alta");
    expect(result.screenStatus).toBe("negative");
  });

  test("score 13 - just before screening threshold", () => {
    const result = calculateASRS({
      q1: 2,
      q2: 2,
      q3: 2,
      q4: 3,
      q5: 2,
      q6: 2,
    });
    expect(result.rawScore).toBe(13);
    expect(result.classification).toBe("Faixa negativa alta");
    expect(result.screenStatus).toBe("negative");
  });

  test("score 14 - at screening threshold (POSITIVE)", () => {
    const result = calculateASRS({
      q1: 2,
      q2: 2,
      q3: 3,
      q4: 3,
      q5: 2,
      q6: 2,
    });
    expect(result.rawScore).toBe(14);
    expect(result.classification).toBe("Faixa positiva baixa");
    expect(result.screenStatus).toBe("positive");
    expect(result.rawScore).toBe(ASRS_SCREENING_THRESHOLD);
  });

  test("score 17 - positive low boundary", () => {
    const result = calculateASRS({
      q1: 3,
      q2: 3,
      q3: 3,
      q4: 3,
      q5: 3,
      q6: 2,
    });
    expect(result.rawScore).toBe(17);
    expect(result.classification).toBe("Faixa positiva baixa");
    expect(result.screenStatus).toBe("positive");
  });

  test("score 18 - positive high", () => {
    const result = calculateASRS({
      q1: 3,
      q2: 3,
      q3: 3,
      q4: 3,
      q5: 3,
      q6: 3,
    });
    expect(result.rawScore).toBe(18);
    expect(result.classification).toBe("Faixa positiva alta");
    expect(result.screenStatus).toBe("positive");
  });

  test("score 24 - maximum", () => {
    const result = calculateASRS({
      q1: 4,
      q2: 4,
      q3: 4,
      q4: 4,
      q5: 4,
      q6: 4,
    });
    expect(result.rawScore).toBe(24);
    expect(result.classification).toBe("Faixa positiva alta");
    expect(result.screenStatus).toBe("positive");
  });

  test("missing response returns invalid", () => {
    const result = calculateASRS({
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      q5: 0,
      q6: null as any,
    });
    expect(result.valid).toBe(false);
    expect(result.missingItems).toBe(1);
  });

  test("contextual answers included in interpretation", () => {
    const result = calculateASRS(
      {
        q1: 4,
        q2: 4,
        q3: 4,
        q4: 4,
        q5: 4,
        q6: 4,
      },
      {
        multipleContexts: ["Trabalho", "Casa"],
        childhoodDifficulties: "yes",
      },
    );
    expect(result.interpretation).toContain("Trabalho");
    expect(result.interpretation).toContain("Casa");
    expect(result.interpretation).toContain("infância");
  });
});
