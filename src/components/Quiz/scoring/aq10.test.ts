import { calculateAQ10, scoreAQItem, AQ10_SCREENING_THRESHOLD } from "./aq10";

/**
 * Testes do AQ-10
 * Validar scoring específico por item e thresholds
 */

describe("AQ-10 Item Scoring", () => {
  test("item 1: concordo = 1", () => {
    expect(scoreAQItem(1, 1)).toBe(1); // Concordo totalmente
    expect(scoreAQItem(1, 2)).toBe(1); // Concordo parcialmente
    expect(scoreAQItem(1, 3)).toBe(0); // Discordo parcialmente
    expect(scoreAQItem(1, 4)).toBe(0); // Discordo totalmente
  });

  test("item 2: discordo = 1", () => {
    expect(scoreAQItem(2, 1)).toBe(0); // Concordo totalmente
    expect(scoreAQItem(2, 2)).toBe(0); // Concordo parcialmente
    expect(scoreAQItem(2, 3)).toBe(1); // Discordo parcialmente
    expect(scoreAQItem(2, 4)).toBe(1); // Discordo totalmente
  });

  test("item 7: concordo = 1 (agree-scored)", () => {
    expect(scoreAQItem(7, 1)).toBe(1);
    expect(scoreAQItem(7, 4)).toBe(0);
  });

  test("item 10: concordo = 1 (agree-scored)", () => {
    expect(scoreAQItem(10, 1)).toBe(1);
    expect(scoreAQItem(10, 4)).toBe(0);
  });
});

describe("AQ-10 Total Scoring", () => {
  test("score 0 - all responses don't score", () => {
    const result = calculateAQ10({
      q1: 4, // discordo
      q2: 1, // concordo
      q3: 1, // concordo
      q4: 1, // concordo
      q5: 1, // concordo
      q6: 1, // concordo
      q7: 4, // discordo
      q8: 4, // discordo
      q9: 1, // concordo
      q10: 4, // discordo
    });
    expect(result.rawScore).toBe(0);
    expect(result.screenStatus).toBe("negative");
  });

  test("score 5 - below threshold", () => {
    // Items que concordam: 1,7,8,10
    const result = calculateAQ10({
      q1: 1, // +1 (agree)
      q2: 4, // +1 (disagree)
      q3: 4, // +1 (disagree)
      q4: 4, // +1 (disagree)
      q5: 1, // +0 (agree when should disagree)
      q6: 1, // +0 (agree when should disagree)
      q7: 1, // +1 (agree)
      q8: 4, // +1 (disagree)
      q9: 1, // +0 (agree when should disagree)
      q10: 4, // +0 (disagree)
    });
    expect(result.rawScore).toBe(5);
    expect(result.classification).toBe("Faixa de rastreio negativo");
    expect(result.screenStatus).toBe("negative");
  });

  test("score 6 - at screening threshold (POSITIVE)", () => {
    const result = calculateAQ10({
      q1: 1, // +1
      q2: 4, // +1
      q3: 4, // +1
      q4: 4, // +1
      q5: 4, // +1
      q6: 1, // +0
      q7: 1, // +1
      q8: 4, // +0
      q9: 1, // +0
      q10: 4, // +0
    });
    expect(result.rawScore).toBe(6);
    expect(result.classification).toBe("Faixa de rastreio positivo");
    expect(result.screenStatus).toBe("positive");
    expect(result.rawScore).toBe(AQ10_SCREENING_THRESHOLD);
  });

  test("score 10 - maximum", () => {
    const result = calculateAQ10({
      q1: 1, // +1 (agree)
      q2: 4, // +1 (disagree)
      q3: 4, // +1 (disagree)
      q4: 4, // +1 (disagree)
      q5: 4, // +1 (disagree)
      q6: 4, // +1 (disagree)
      q7: 1, // +1 (agree)
      q8: 1, // +1 (agree)
      q9: 4, // +1 (disagree)
      q10: 1, // +1 (agree)
    });
    expect(result.rawScore).toBe(10);
    expect(result.classification).toBe("Faixa de rastreio positivo");
    expect(result.screenStatus).toBe("positive");
  });

  test("missing response returns invalid", () => {
    const result = calculateAQ10({
      q1: 1,
      q2: 1,
      q3: 1,
      q4: 1,
      q5: 1,
      q6: 1,
      q7: 1,
      q8: 1,
      q9: 1,
      q10: null as any,
    });
    expect(result.valid).toBe(false);
    expect(result.missingItems).toBe(1);
  });

  test("contextual answers included in interpretation", () => {
    const result = calculateAQ10(
      {
        q1: 1,
        q2: 1,
        q3: 1,
        q4: 1,
        q5: 1,
        q6: 1,
        q7: 1,
        q8: 1,
        q9: 1,
        q10: 1,
      },
      {
        impactAreas: ["Trabalho", "Relações"],
        childhoodCharacteristics: "yes",
      },
    );
    expect(result.interpretation).toContain("Trabalho");
    expect(result.interpretation).toContain("Relações");
    expect(result.interpretation).toContain("infância");
  });

  test("threshold message mentions NICE guidelines", () => {
    const result = calculateAQ10({
      q1: 1,
      q2: 4,
      q3: 4,
      q4: 4,
      q5: 4,
      q6: 4,
      q7: 1,
      q8: 4,
      q9: 4,
      q10: 1,
    });
    expect(result.interpretation).toContain("NICE");
  });
});
