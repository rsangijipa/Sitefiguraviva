import { TECHNIQUES, SESSION_DURATION_SECONDS } from "../constants";

describe("TECHNIQUES", () => {
  it("exposes numeric phase durations in seconds for every technique", () => {
    Object.values(TECHNIQUES).forEach((technique) => {
      expect(typeof technique.inhaleDuration).toBe("number");
      expect(technique.inhaleDuration).toBeGreaterThan(0);
      expect(typeof technique.holdDuration).toBe("number");
      expect(typeof technique.exhaleDuration).toBe("number");
      expect(technique.exhaleDuration).toBeGreaterThan(0);
      expect(typeof technique.holdAfterExhale).toBe("number");
    });
  });

  it("keeps the 4-6 technique at 4s inhale / 6s exhale with no holds", () => {
    expect(TECHNIQUES["4-6"].inhaleDuration).toBe(4);
    expect(TECHNIQUES["4-6"].holdDuration).toBe(0);
    expect(TECHNIQUES["4-6"].exhaleDuration).toBe(6);
    expect(TECHNIQUES["4-6"].holdAfterExhale).toBe(0);
  });

  it("keeps the pursed-lips technique at 2s inhale / 4s exhale with no holds", () => {
    expect(TECHNIQUES["pursed-lips"].inhaleDuration).toBe(2);
    expect(TECHNIQUES["pursed-lips"].holdDuration).toBe(0);
    expect(TECHNIQUES["pursed-lips"].exhaleDuration).toBe(4);
    expect(TECHNIQUES["pursed-lips"].holdAfterExhale).toBe(0);
  });

  it("keeps the 2-minute session duration", () => {
    expect(SESSION_DURATION_SECONDS).toBe(120);
  });
});
