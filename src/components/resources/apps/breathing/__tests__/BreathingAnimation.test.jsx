import { render } from "@testing-library/react";
import { act } from "react";
import { BreathingAnimation } from "../BreathingAnimation";

const technique = {
  id: "4-6",
  inhaleDuration: 4,
  holdDuration: 0,
  exhaleDuration: 6,
  holdAfterExhale: 0,
};

describe("BreathingAnimation", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("calls onPhaseChange with Inspire immediately when activated", () => {
    const onPhaseChange = jest.fn();
    render(
      <BreathingAnimation
        technique={technique}
        isActive={true}
        onPhaseChange={onPhaseChange}
      />,
    );
    expect(onPhaseChange).toHaveBeenCalledWith("Inspire...");
  });

  it("moves to Expire only after the full inhale duration elapses", () => {
    const onPhaseChange = jest.fn();
    render(
      <BreathingAnimation
        technique={technique}
        isActive={true}
        onPhaseChange={onPhaseChange}
      />,
    );
    onPhaseChange.mockClear();

    act(() => {
      jest.advanceTimersByTime(3999);
    });
    expect(onPhaseChange).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onPhaseChange).toHaveBeenCalledWith("Expire...");
  });

  it("loops back to Inspire after the full exhale duration elapses", () => {
    const onPhaseChange = jest.fn();
    render(
      <BreathingAnimation
        technique={technique}
        isActive={true}
        onPhaseChange={onPhaseChange}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(4000); // inhale complete -> exhale
    });
    onPhaseChange.mockClear();

    act(() => {
      jest.advanceTimersByTime(6000); // exhale complete -> loops to inhale
    });
    expect(onPhaseChange).toHaveBeenCalledWith("Inspire...");
  });

  it("keeps advancing phases even when the parent passes a new onPhaseChange function on every render", () => {
    const phases = [];
    const { rerender } = render(
      <BreathingAnimation
        technique={technique}
        isActive={true}
        onPhaseChange={(p) => phases.push(p)}
      />,
    );

    // Simulate a parent re-rendering every second (e.g. a countdown timer)
    // with a fresh inline onPhaseChange callback each time, as
    // BreathingApp.jsx's `onPhaseChange={() => {}}` does.
    for (let second = 1; second <= 10; second += 1) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      rerender(
        <BreathingAnimation
          technique={technique}
          isActive={true}
          onPhaseChange={(p) => phases.push(p)}
        />,
      );
    }

    expect(phases).toContain("Expire...");
  });

  it("resets to the resting scale when isActive is false", () => {
    const { container } = render(
      <BreathingAnimation
        technique={technique}
        isActive={false}
        onPhaseChange={() => {}}
      />,
    );
    const mandala = container.querySelector("[data-mandala-scale]");
    expect(mandala).not.toBeNull();
    expect(mandala.getAttribute("data-mandala-scale")).toBe("0.7");
  });
});
