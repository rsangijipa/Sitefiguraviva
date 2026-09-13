import { calculatePHQ9, PHQ9_SCREENING_THRESHOLD } from "./phq9";

/**
 * Testes do PHQ-9
 * Validar todos os pontos de corte e cálculos
 */

describe("PHQ-9 Scoring", () => {
  test("score 0 - all zeros", () => {
    const result = calculatePHQ9({
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      q5: 0,
      q6: 0,
      q7: 0,
      q8: 0,
      q9: 0,
    });
    expect(result.rawScore).toBe(0);
    expect(result.classification).toBe("Mínimo");
    expect(result.screenStatus).toBe("negative");
  });

  test("score 4 - minimum classification boundary", () => {
    const result = calculatePHQ9({
      q1: 1,
      q2: 1,
      q3: 1,
      q4: 1,
      q5: 0,
      q6: 0,
      q7: 0,
      q8: 0,
      q9: 0,
    });
    expect(result.rawScore).toBe(4);
    expect(result.classification).toBe("Mínimo");
  });

  test("score 5 - mild classification", () => {
    const result = calculatePHQ9({
      q1: 1,
      q2: 1,
      q3: 1,
      q4: 1,
      q5: 1,
      q6: 0,
      q7: 0,
      q8: 0,
      q9: 0,
    });
    expect(result.rawScore).toBe(5);
    expect(result.classification).toBe("Leve");
    expect(result.screenStatus).toBe("negative");
  });

  test("score 9 - mild/moderate boundary", () => {
    const result = calculatePHQ9({
      q1: 2,
      q2: 2,
      q3: 2,
      q4: 2,
      q5: 1,
      q6: 0,
      q7: 0,
      q8: 0,
      q9: 0,
    });
    expect(result.rawScore).toBe(9);
    expect(result.classification).toBe("Leve");
  });

  test("score 10 - moderate classification (SCREENING POSITIVE)", () => {
    const result = calculatePHQ9({
      q1: 2,
      q2: 2,
      q3: 2,
      q4: 2,
      q5: 2,
      q6: 0,
      q7: 0,
      q8: 0,
      q9: 0,
    });
    expect(result.rawScore).toBe(10);
    expect(result.classification).toBe("Moderado");
    expect(result.screenStatus).toBe("borderline");
  });

  test("score 14 - moderate/severe boundary", () => {
    const result = calculatePHQ9({
      q1: 2,
      q2: 2,
      q3: 2,
      q4: 2,
      q5: 2,
      q6: 2,
      q7: 2,
      q8: 0,
      q9: 0,
    });
    expect(result.rawScore).toBe(14);
    expect(result.classification).toBe("Moderado");
  });

  test("score 15 - moderately severe classification", () => {
    const result = calculatePHQ9({
      q1: 2,
      q2: 2,
      q3: 2,
      q4: 2,
      q5: 2,
      q6: 2,
      q7: 2,
      q8: 1,
      q9: 0,
    });
    expect(result.rawScore).toBe(15);
    expect(result.classification).toBe("Moderadamente grave");
    expect(result.screenStatus).toBe("positive");
  });

  test("score 20 - severe classification", () => {
    const result = calculatePHQ9({
      q1: 3,
      q2: 3,
      q3: 3,
      q4: 3,
      q5: 3,
      q6: 2,
      q7: 1,
      q8: 2,
      q9: 0,
    });
    expect(result.rawScore).toBe(20);
    expect(result.classification).toBe("Grave");
    expect(result.screenStatus).toBe("positive");
  });

  test("score 27 - maximum", () => {
    const result = calculatePHQ9({
      q1: 3,
      q2: 3,
      q3: 3,
      q4: 3,
      q5: 3,
      q6: 3,
      q7: 3,
      q8: 3,
      q9: 3,
    });
    expect(result.rawScore).toBe(27);
    expect(result.classification).toBe("Grave");
    expect(result.screenStatus).toBe("positive");
    expect(result.maxScore).toBe(27);
  });

  test("safety flag triggered when q9 > 0", () => {
    const result = calculatePHQ9({
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      q5: 0,
      q6: 0,
      q7: 0,
      q8: 0,
      q9: 1,
    });
    expect(result.safetyFlags).toContain("self_harm_item_positive");
  });

  test("missing response returns invalid", () => {
    const result = calculatePHQ9({
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      q5: 0,
      q6: 0,
      q7: 0,
      q8: 0,
      q9: null as any,
    });
    expect(result.valid).toBe(false);
    expect(result.missingItems).toBe(1);
  });
});
