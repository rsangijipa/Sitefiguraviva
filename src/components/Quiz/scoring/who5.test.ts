import { calculateWHO5 } from "./who5";

/**
 * Testes do WHO-5
 * Validar conversão percentual e thresholds
 */

describe("WHO-5 Scoring", () => {
  test("score 0 - all zeros (worst well-being)", () => {
    const result = calculateWHO5({
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      q5: 0,
    });
    expect(result.rawScore).toBe(0);
    expect(result.normalizedScore).toBe(0);
    expect(result.screenStatus).toBe("borderline");
  });

  test("score 12 - just below threshold", () => {
    const result = calculateWHO5({
      q1: 2,
      q2: 2,
      q3: 2,
      q4: 2,
      q5: 4,
    });
    expect(result.rawScore).toBe(12);
    expect(result.normalizedScore).toBe(48);
    expect(result.screenStatus).toBe("borderline");
  });

  test("score 13 - at threshold (52%)", () => {
    const result = calculateWHO5({
      q1: 2,
      q2: 2,
      q3: 3,
      q4: 3,
      q5: 3,
    });
    expect(result.rawScore).toBe(13);
    expect(result.normalizedScore).toBe(52);
    expect(result.screenStatus).toBe("negative");
  });

  test("score 25 - maximum (best well-being)", () => {
    const result = calculateWHO5({
      q1: 5,
      q2: 5,
      q3: 5,
      q4: 5,
      q5: 5,
    });
    expect(result.rawScore).toBe(25);
    expect(result.normalizedScore).toBe(100);
    expect(result.screenStatus).toBe("negative");
    expect(result.classification).toBe("Bem-estar adequado");
  });

  test("score 17 - mid-range", () => {
    const result = calculateWHO5({
      q1: 3,
      q2: 3,
      q3: 3,
      q4: 4,
      q5: 4,
    });
    expect(result.rawScore).toBe(17);
    expect(result.normalizedScore).toBe(68);
    expect(result.screenStatus).toBe("negative");
  });

  test("missing response returns invalid", () => {
    const result = calculateWHO5({
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      q5: null as any,
    });
    expect(result.valid).toBe(false);
    expect(result.missingItems).toBe(1);
  });

  test("percentage conversion formula: raw * 4", () => {
    // Verificar conversão para todos os scores
    const testCases = [
      { raw: 0, expected: 0 },
      { raw: 5, expected: 20 },
      { raw: 10, expected: 40 },
      { raw: 15, expected: 60 },
      { raw: 20, expected: 80 },
      { raw: 25, expected: 100 },
    ];

    testCases.forEach(({ raw, expected }) => {
      const values = Array(raw)
        .fill(0)
        .map((_, i) => (i < raw ? 1 : 0))
        .slice(0, 5);

      const result = calculateWHO5({
        q1: values[0] || 0,
        q2: values[1] || 0,
        q3: values[2] || 0,
        q4: values[3] || 0,
        q5: values[4] || 0,
      });

      expect(result.normalizedScore).toBe(expected);
    });
  });
});
