# Lago Resource + Breathing Guide Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the broken breathing-guide animation (wrong timing, redesigned as a compact inflating/deflating mandala) and add the "Lago" WebGL pond simulation as a new interactive resource on `/recursos`, matching the site's existing resource-app pattern.

**Architecture:** Two independent slices. (1) `src/components/resources/apps/breathing/` gets a bug fix (property-name mismatch between `constants.js` and `BreathingAnimation.jsx`) and a component rewrite of the mandala visual. (2) The standalone Vite app at `C:\Users\aless\Downloads\lago` is ported file-for-file into `src/components/resources/apps/lago/`, re-themed at the UI-chrome layer only (canvas/WebGL visuals untouched), and wired into `ResourcesSection.jsx` exactly like the existing SomaScan resource.

**Tech Stack:** Next.js (App Router), React 19, TypeScript/JSX, Tailwind CSS v4 tokens (`primary`, `accent`, `sage`/`igarape`, `paper`, `text`, `stone`), `framer-motion`, `lucide-react`, `clsx`, Jest + `@testing-library/react` for unit tests.

## Global Constraints

- Do not add the `@google/genai` dependency — it is not used anywhere in the Lago app's source.
- Only the Lago UI chrome (header, control dock, "Sobre" modal) is re-themed to the site's light palette; the WebGL canvas/lighting itself stays as-is (day/sunset/night via its own existing control).
- Breathing technique durations must not change — only property names are unified and the visual is redesigned.
- No new test framework or dependency — use the project's existing Jest + Testing Library setup.
- Follow existing file organization: ported apps live under `src/components/resources/apps/<name>/`, wired into `ResourcesSection.jsx` via `activeResource` state, same as SomaScan/EmotionTree/Quiz.

---

### Task 1: Fix the breathing technique property-name bug (regression test first)

**Files:**
- Modify: `src/components/resources/apps/breathing/constants.js`
- Test: `src/components/resources/apps/breathing/__tests__/constants.test.js` (create)

**Interfaces:**
- Produces: `TECHNIQUES` object where every technique has numeric properties `inhaleDuration` (seconds), `holdDuration` (seconds), `exhaleDuration` (seconds), `holdAfterExhale` (seconds) — these exact names are consumed by `BreathingAnimation.jsx` (Task 2) and were previously named `inhaleTime`/`holdTime`/`exhaleTime`/`holdPostExhaleTime` in milliseconds, which is the root cause of the broken animation (`undefined * 1000 = NaN` passed to `setTimeout`).

- [ ] **Step 1: Write the failing test**

Create `src/components/resources/apps/breathing/__tests__/constants.test.js`:

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/resources/apps/breathing/__tests__/constants.test.js`
Expected: FAIL — `technique.inhaleDuration` is `undefined`, `typeof undefined !== "number"`.

- [ ] **Step 3: Fix `constants.js`**

Replace the full contents of `src/components/resources/apps/breathing/constants.js`:

```javascript
export const SESSION_DURATION_SECONDS = 120;

export const TECHNIQUES = {
  "4-6": {
    id: "4-6",
    title: "Relaxamento Rápido",
    subtitle: "Inspire em 4s, Expire em 6s",
    inhaleDuration: 4,
    holdDuration: 0,
    exhaleDuration: 6,
    holdAfterExhale: 0,
    color: "bg-accent",
    ringColor: "stroke-accent",
    instruction: "Inspire pelo nariz...",
    instructionExhale: "Expire pela boca...",
  },
  "pursed-lips": {
    id: "pursed-lips",
    title: "Lábios Semicerrados",
    subtitle: "Controle o fluxo de ar",
    inhaleDuration: 2,
    holdDuration: 0,
    exhaleDuration: 4,
    holdAfterExhale: 0,
    color: "bg-secondary",
    ringColor: "stroke-secondary",
    instruction: "Inspire fundo...",
    instructionExhale: "Sopre suavemente...",
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/resources/apps/breathing/__tests__/constants.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/resources/apps/breathing/constants.js src/components/resources/apps/breathing/__tests__/constants.test.js
git commit -m "fix: unify breathing technique duration property names"
```

---

### Task 2: Rewrite the breathing mandala as a compact inflate/deflate circle

**Files:**
- Modify: `src/components/resources/apps/breathing/BreathingAnimation.jsx`
- Test: `src/components/resources/apps/breathing/__tests__/BreathingAnimation.test.jsx` (create)

**Interfaces:**
- Consumes: `TECHNIQUES["4-6"]` / `TECHNIQUES["pursed-lips"]` from Task 1 (`inhaleDuration`, `holdDuration`, `exhaleDuration`, `holdAfterExhale`, `id`, all in seconds).
- Produces: `BreathingAnimation({ technique, isActive, onPhaseChange })` — same exported signature as before, still called from `BreathingApp.jsx` (`src/components/resources/apps/breathing/BreathingApp.jsx:331-336`), no changes needed there. `onPhaseChange` is still called with the same Portuguese strings (`"Inspire..."`, `"Segure..."`, `"Expire..."`, `"Pausa..."`) at the same transition points, so `BreathingApp.jsx` requires no changes.

- [ ] **Step 1: Write the failing test**

Create `src/components/resources/apps/breathing/__tests__/BreathingAnimation.test.jsx`:

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/resources/apps/breathing/__tests__/BreathingAnimation.test.jsx`
Expected: FAIL — with the unfixed component the phase timing used `NaN` delays before Task 1's fix; even after Task 1, the current `Mandala` markup has no `data-mandala-scale` attribute, so the last test fails on `mandala` being `null`.

- [ ] **Step 3: Replace `BreathingAnimation.jsx` with the compact mandala**

Replace the full contents of `src/components/resources/apps/breathing/BreathingAnimation.jsx`:

```javascript
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RING_MIN_SCALE = 0.72;
const RING_MAX_SCALE = 1;

// Mandala compacta: um núcleo + duas camadas de pétalas que giram devagar,
// e a escala geral segue o ritmo da respiração (inspira = expande).
const Mandala = ({ theme, scale }) => {
  const rings = useMemo(
    () => [
      { count: 10, size: 26, radius: 34, spinDuration: 60 },
      { count: 16, size: 40, radius: 62, spinDuration: 90 },
    ],
    [],
  );

  return (
    <motion.div
      data-mandala-scale={scale}
      className="relative flex items-center justify-center will-change-transform"
      style={{ width: "220px", height: "220px" }}
      animate={{ scale }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {/* Aura central suave */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-40 transition-colors duration-1000"
        style={{
          background: `radial-gradient(circle, ${theme.primary}, ${theme.secondary}, transparent 70%)`,
        }}
      />

      {rings.map((ring, ringIndex) => (
        <div
          key={ringIndex}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: `mandala-spin ${ring.spinDuration}s linear infinite ${
              ringIndex % 2 === 1 ? "reverse" : "normal"
            }`,
          }}
        >
          {Array.from({ length: ring.count }).map((_, i) => {
            const rotation = (360 / ring.count) * i;
            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${ring.size}px`,
                  height: `${ring.size}px`,
                  background: `linear-gradient(135deg, ${theme.primary}66, ${theme.secondary}66)`,
                  transform: `rotate(${rotation}deg) translateY(-${ring.radius}px)`,
                  transformOrigin: "center center",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
            );
          })}
        </div>
      ))}

      {/* Núcleo */}
      <div className="relative z-10 flex items-center justify-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: `conic-gradient(from 0deg, ${theme.primary}, ${theme.secondary}, ${theme.primary})`,
            boxShadow: `0 0 32px ${theme.primary}70`,
          }}
        >
          <div className="w-11 h-11 bg-white/15 backdrop-blur-md rounded-full border border-white/30" />
        </div>
      </div>

      <style>{`
        @keyframes mandala-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

export const BreathingAnimation = ({ technique, isActive, onPhaseChange }) => {
  const [phase, setPhase] = useState("inhale");
  const [scale, setScale] = useState(RING_MIN_SCALE);

  useEffect(() => {
    if (!isActive) {
      setScale(RING_MIN_SCALE);
      return;
    }

    const timeoutIds = [];
    const schedule = (fn, seconds) => {
      const id = window.setTimeout(fn, seconds * 1000);
      timeoutIds.push(id);
      return id;
    };

    const runCycle = () => {
      setPhase("inhale");
      setScale(RING_MAX_SCALE);
      onPhaseChange?.("Inspire...");

      schedule(() => {
        const afterInhale = () => {
          setPhase("exhale");
          setScale(RING_MIN_SCALE);
          onPhaseChange?.("Expire...");

          schedule(() => {
            if (technique.holdAfterExhale > 0) {
              setPhase("wait");
              onPhaseChange?.("Pausa...");
              schedule(runCycle, technique.holdAfterExhale);
            } else {
              runCycle();
            }
          }, technique.exhaleDuration);
        };

        if (technique.holdDuration > 0) {
          setPhase("hold");
          onPhaseChange?.("Segure...");
          schedule(afterInhale, technique.holdDuration);
        } else {
          afterInhale();
        }
      }, technique.inhaleDuration);
    };

    runCycle();
    return () => timeoutIds.forEach((id) => window.clearTimeout(id));
  }, [isActive, technique, onPhaseChange]);

  const mandalaTheme = useMemo(() => {
    const isCalming = technique.id === "4-7-8" || technique.id === "4-6";
    return {
      primary: isCalming ? "#588157" : "#C45B50",
      secondary: isCalming ? "#A3B18A" : "#E6AD9B",
    };
  }, [technique.id]);

  const getInstructionText = () => {
    switch (phase) {
      case "inhale":
        return technique.icon === "nose" ? "Inspire pelo nariz" : "Inspire";
      case "hold":
        return "Segure o ar...";
      case "exhale":
        return technique.id === "pursed-lips"
          ? "Expire lentamente"
          : "Expire pela boca";
      case "wait":
        return "Aguarde...";
      default:
        return "Prepare-se";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-2 md:py-4">
      <div className="relative flex items-center justify-center w-[160px] h-[160px] md:w-[220px] md:h-[220px]">
        <div className="scale-[0.73] md:scale-100 flex items-center justify-center">
          <Mandala theme={mandalaTheme} scale={scale} />
        </div>
      </div>

      <div className="h-16 mt-4 flex flex-col items-center justify-start">
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-2xl font-serif text-ink tracking-tight text-center"
          >
            {getInstructionText()}
          </motion.p>
        </AnimatePresence>
        <motion.p
          className="text-earth-light/80 font-sans text-sm mt-1"
          animate={{ opacity: phase === "hold" || phase === "wait" ? 1 : 0 }}
        >
          {phase === "hold"
            ? `por ${technique.holdDuration}s`
            : phase === "wait"
              ? `por ${technique.holdAfterExhale}s`
              : ""}
        </motion.p>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/resources/apps/breathing/__tests__/BreathingAnimation.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Run the full breathing test suite together**

Run: `npx jest src/components/resources/apps/breathing`
Expected: PASS (8 tests total across both files).

- [ ] **Step 6: Commit**

```bash
git add src/components/resources/apps/breathing/BreathingAnimation.jsx src/components/resources/apps/breathing/__tests__/BreathingAnimation.test.jsx
git commit -m "feat: redesign breathing mandala as compact inflate/deflate circle"
```

---

### Task 3: Compact the active-session layout in BreathingApp.jsx

**Files:**
- Modify: `src/components/resources/apps/breathing/BreathingApp.jsx:305-364` (the `renderActiveSession` function and its `TimerRing` sub-component at `:101-175`)

**Interfaces:**
- Consumes: `BreathingAnimation` from Task 2 (same props, now visually smaller by default).
- No exported interface changes — `BreathingApp` default export signature (`{ onClose }`) is unchanged.

- [ ] **Step 1: Shrink the `TimerRing` sub-component**

In `src/components/resources/apps/breathing/BreathingApp.jsx`, inside the `TimerRing` component (around line 101), change the radius and wrapper size to be more compact:

Find:
```javascript
  const TimerRing = ({ total, current }) => {
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const progress = current / total;
    const strokeDashoffset = circumference - progress * circumference;

    return (
      <div className="relative w-64 h-64 flex items-center justify-center">
```

Replace with:
```javascript
  const TimerRing = ({ total, current }) => {
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const progress = current / total;
    const strokeDashoffset = circumference - progress * circumference;

    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
```

Then update the two `<svg viewBox="0 0 260 260">` elements and their `cx`/`cy`/`r` values in the same component to match the smaller radius. Find (spinner ring):
```javascript
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 260 260">
```
and the two `<motion.circle cx="130" cy="130" r={128} ...>` / `<circle cx="130" cy="130" r={radius} .../>` / `<motion.circle ... cx="130" cy="130" r={radius} .../>` blocks that follow (both the spinner `<svg>` and the progress `<svg className="... rotate-[-90deg]" viewBox="0 0 260 260">`). Replace every `viewBox="0 0 260 260"` with `viewBox="0 0 200 200"`, every `cx="130" cy="130"` with `cx="100" cy="100"`, and the spinner's fixed `r={128}` with `r={98}`. The `r={radius}` circles automatically follow the new `radius = 90` from the state above — no literal change needed there.

Also shrink the center text:
```javascript
          <span className="text-5xl font-sans font-light text-primary tracking-tight">
```
Replace with:
```javascript
          <span className="text-4xl font-sans font-light text-primary tracking-tight">
```

- [ ] **Step 2: Compact vertical spacing in `renderActiveSession`**

Find (around line 330):
```javascript
        <div className="relative mb-8 w-full flex justify-center scale-110">
          <BreathingAnimation
            technique={activeTechnique}
            isActive={sessionActive}
            onPhaseChange={() => {}}
          />
        </div>

        <div className="mb-8">
          <TimerRing
            total={SESSION_DURATION_SECONDS}
            current={secondsRemaining}
          />
        </div>
```

Replace with:
```javascript
        <div className="relative mb-4 w-full flex justify-center">
          <BreathingAnimation
            technique={activeTechnique}
            isActive={sessionActive}
            onPhaseChange={() => {}}
          />
        </div>

        <div className="mb-4">
          <TimerRing
            total={SESSION_DURATION_SECONDS}
            current={secondsRemaining}
          />
        </div>
```

(Removing the `scale-110` since the mandala is already sized correctly at its own natural scale after Task 2, and tightening the `mb-8` gaps to `mb-4` to compact the vertical rhythm as requested.)

- [ ] **Step 2: Run the existing breathing tests to confirm nothing broke**

Run: `npx jest src/components/resources/apps/breathing`
Expected: PASS (8 tests, unchanged — this task only touches JSX layout/markup that isn't asserted on).

- [ ] **Step 3: Commit**

```bash
git add src/components/resources/apps/breathing/BreathingApp.jsx
git commit -m "refactor: compact breathing session layout to match smaller mandala"
```

---

### Task 4: Port Lago's non-visual modules (webgl/, simulation/, audio/, types)

**Files:**
- Create: `src/components/resources/apps/lago/types.ts`
- Create: `src/components/resources/apps/lago/webgl/shaders.ts`
- Create: `src/components/resources/apps/lago/webgl/waterSim.ts`
- Create: `src/components/resources/apps/lago/webgl/riverbedTexture.ts`
- Create: `src/components/resources/apps/lago/simulation/koiFish.ts`
- Create: `src/components/resources/apps/lago/simulation/floatingLeaves.ts`
- Create: `src/components/resources/apps/lago/audio/waterSound.ts`

**Interfaces:**
- Produces: `WaterSimConfig`, `KoiFishData`, `FloatingLeaf`, `FoodPellet`, `SplashParticle`, `RainDrop`, `WaterInteractionMode`, `AmbientLighting`, `RainIntensity`, `QualityProfile` types (from `types.ts`); `WebGLWaterSimulation` class (from `webgl/waterSim.ts`, consumed by Task 5's `PondCanvas.tsx`); `createRiverbedCanvas`, `createSkyCanvas` (from `webgl/riverbedTexture.ts`); `createKoiFish`, `updateKoiFish`, `renderKoiFishOnCanvas` (from `simulation/koiFish.ts`); `createFloatingLeaves`, `updateFloatingLeaves`, `renderLeavesOnCanvas` (from `simulation/floatingLeaves.ts`); `waterAudio` singleton (from `audio/waterSound.ts`). All consumed verbatim by `PondCanvas.tsx` in Task 5.

This is a direct byte-for-byte port with no logic changes — these modules have no `window.innerWidth`/viewport assumptions (confirmed: `waterSim.ts`/`koiFish.ts`/`floatingLeaves.ts`/`riverbedTexture.ts` work purely off canvas/texture dimensions passed as parameters; `waterSound.ts` only touches `window.AudioContext`).

- [ ] **Step 1: Copy the seven files verbatim**

Run (from the repo root `C:\Users\aless\Downloads\Sitefiguraviva`):

```bash
mkdir -p src/components/resources/apps/lago/webgl src/components/resources/apps/lago/simulation src/components/resources/apps/lago/audio
cp "/c/Users/aless/Downloads/lago/src/types.ts" src/components/resources/apps/lago/types.ts
cp "/c/Users/aless/Downloads/lago/src/webgl/shaders.ts" src/components/resources/apps/lago/webgl/shaders.ts
cp "/c/Users/aless/Downloads/lago/src/webgl/waterSim.ts" src/components/resources/apps/lago/webgl/waterSim.ts
cp "/c/Users/aless/Downloads/lago/src/webgl/riverbedTexture.ts" src/components/resources/apps/lago/webgl/riverbedTexture.ts
cp "/c/Users/aless/Downloads/lago/src/simulation/koiFish.ts" src/components/resources/apps/lago/simulation/koiFish.ts
cp "/c/Users/aless/Downloads/lago/src/simulation/floatingLeaves.ts" src/components/resources/apps/lago/simulation/floatingLeaves.ts
cp "/c/Users/aless/Downloads/lago/src/audio/waterSound.ts" src/components/resources/apps/lago/audio/waterSound.ts
```

(All internal imports in these files use relative paths like `'../types'` and `'./shaders'`, which resolve correctly once the directory structure is preserved 1:1.)

- [ ] **Step 2: Confirm the files landed correctly**

Run: `ls src/components/resources/apps/lago/webgl src/components/resources/apps/lago/simulation src/components/resources/apps/lago/audio src/components/resources/apps/lago/types.ts`
Expected: all 7 files present, no error.

- [ ] **Step 3: Commit**

```bash
git add src/components/resources/apps/lago/types.ts src/components/resources/apps/lago/webgl src/components/resources/apps/lago/simulation src/components/resources/apps/lago/audio
git commit -m "feat: port lago webgl/simulation/audio modules"
```

---

### Task 5: Port and adapt PondCanvas, LoadingScreen, and PondControls

**Files:**
- Create: `src/components/resources/apps/lago/components/PondCanvas.tsx`
- Create: `src/components/resources/apps/lago/components/LoadingScreen.tsx`
- Create: `src/components/resources/apps/lago/components/PondControls.tsx`

**Interfaces:**
- Consumes: everything from Task 4 (`../types`, `../webgl/waterSim`, `../webgl/riverbedTexture`, `../simulation/koiFish`, `../simulation/floatingLeaves`, `../audio/waterSound`).
- Produces: `PondCanvas` (forwardRef component with `PondCanvasHandle { clearLake(); tossRandomStone(); }`, props `{ config, onLoadProgress?, onLoadComplete?, onWebGLError?, onAudioStatus? }`), `LoadingScreen` (`{ progress: number; onComplete?: () => void }`), `PondControls` (`{ config, onChangeConfig, onClearLake, onTossStoneBurst, audioStatus }`) — all three consumed verbatim by `LagoApp.tsx` in Task 6.

- [ ] **Step 1: Copy `PondCanvas.tsx` verbatim (no visual/layout changes needed)**

```bash
cp "/c/Users/aless/Downloads/lago/src/components/PondCanvas.tsx" src/components/resources/apps/lago/components/PondCanvas.tsx
```

`PondCanvas.tsx` already sizes its canvas from `canvas.clientWidth`/`clientHeight` (not `window.innerWidth`/`innerHeight`) and its root `<div>` already uses `w-full h-full` (not `w-screen h-screen`), so no edits are required — it will correctly fill whatever container `LagoApp.tsx` gives it in Task 6.

- [ ] **Step 2: Copy `LoadingScreen.tsx` and change `fixed` to `absolute`**

```bash
cp "/c/Users/aless/Downloads/lago/src/components/LoadingScreen.tsx" src/components/resources/apps/lago/components/LoadingScreen.tsx
```

Then edit `src/components/resources/apps/lago/components/LoadingScreen.tsx`. Find:
```javascript
      className={`loading-screen fixed inset-0 z-[100] flex flex-col items-center justify-center
```
Replace with:
```javascript
      className={`loading-screen absolute inset-0 z-[100] flex flex-col items-center justify-center
```

(`fixed` positions relative to the browser viewport, which inside a modal would cover the entire page instead of just the Lago app's own container. `absolute` positions relative to `LagoApp.tsx`'s `relative` root from Task 6, keeping it correctly scoped to the modal. The dark `bg-slate-950` background and pond-themed visuals stay as-is — this is the pre-render splash for the canvas itself, not UI chrome, so it keeps its original look per the design decision to only re-theme the header/controls/info-modal.)

- [ ] **Step 3: Copy `PondControls.tsx` and re-theme it to the site's light palette**

```bash
cp "/c/Users/aless/Downloads/lago/src/components/PondControls.tsx" src/components/resources/apps/lago/components/PondControls.tsx
```

Then edit `src/components/resources/apps/lago/components/PondControls.tsx` with the following replacements (each `Find` block appears exactly once in the file):

Find:
```javascript
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4 pointer-events-none select-none">
```
Replace:
```javascript
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4 pointer-events-none select-none">
```

Find:
```javascript
            className="w-full bg-slate-950/90 backdrop-blur-xl text-slate-100 rounded-2xl
              border border-slate-700/50 p-4 shadow-2xl
              animate-slide-up"
```
Replace:
```javascript
            className="w-full bg-white/95 backdrop-blur-xl text-text rounded-2xl
              border border-stone-200 p-4 shadow-2xl
              animate-slide-up"
```

Find every occurrence of the muted-label span pattern (there are several `text-slate-500 font-medium uppercase tracking-wider text-[10px]` and `text-slate-500 uppercase tracking-wider font-medium` spans) — replace `text-slate-500` with `text-text/50` in each of these four label spans:
```javascript
                <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Elementos</span>
```
```javascript
                  <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Iluminação</span>
```
```javascript
                  <span className="text-slate-500 uppercase tracking-wider font-medium">Persistência da Onda</span>
```
```javascript
                  <span className="text-slate-500 uppercase tracking-wider font-medium">Refração da Água</span>
```
become (respectively) `text-text/50 font-medium uppercase tracking-wider text-[10px]`, `text-text/50 font-medium uppercase tracking-wider text-[10px]`, `text-text/50 uppercase tracking-wider font-medium`, `text-text/50 uppercase tracking-wider font-medium`.

Find the inactive-toggle-button base style (appears twice, for Carpas/Folhas toggles):
```javascript
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-300'
```
Replace both occurrences with:
```javascript
                        : 'bg-stone-50 border-stone-200 text-text/50 hover:text-primary'
```

Find the ambient-button inactive style:
```javascript
                            : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-300'
```
Replace with:
```javascript
                            : 'bg-stone-50 border-stone-200 text-text/50 hover:text-primary'
```

Find the two value readouts:
```javascript
                  <span className="text-slate-300 tabular-nums">{Math.round(config.damping * 1000) / 10}%</span>
```
```javascript
                  <span className="text-slate-300 tabular-nums">
```
Replace `text-slate-300` with `text-text/80` in both.

Find the two description spans:
```javascript
                <span id="wave-damping-description" className="text-[10px] text-slate-400">Maior valor mantém as ondas por mais tempo.</span>
```
```javascript
                <span id="refraction-description" className="text-[10px] text-slate-400">Ajusta quanto o leito se distorce com as ondas.</span>
```
```javascript
                <span className="text-[10px] text-slate-400">Define a resolução da simulação e a frequência das texturas.</span>
```
Replace `text-slate-400` with `text-text/50` in all three.

Find the quality `<select>`:
```javascript
              <label htmlFor="quality-profile" className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Qualidade visual</label>
                <select
                  id="quality-profile"
                  value={config.quality}
                  onChange={(event) => onChangeConfig((prev) => ({ ...prev, quality: event.target.value as QualityProfile }))}
                  className="min-h-11 rounded-lg border border-slate-700/70 bg-slate-900 px-3 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
```
Replace with:
```javascript
              <label htmlFor="quality-profile" className="text-text/50 font-medium uppercase tracking-wider text-[10px]">Qualidade visual</label>
                <select
                  id="quality-profile"
                  value={config.quality}
                  onChange={(event) => onChangeConfig((prev) => ({ ...prev, quality: event.target.value as QualityProfile }))}
                  className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
```

Find the primary dock container:
```javascript
        className="flex max-w-full items-center gap-1 overflow-x-auto sm:gap-1.5 bg-slate-950/92 backdrop-blur-xl
            border border-slate-700/70 p-1.5 rounded-full shadow-2xl text-slate-200
            ring-1 ring-inset ring-white/5"
```
Replace with:
```javascript
        className="flex max-w-full items-center gap-1 overflow-x-auto sm:gap-1.5 bg-white/95 backdrop-blur-xl
            border border-stone-200 p-1.5 rounded-full shadow-2xl text-text
            ring-1 ring-inset ring-black/5"
```

Find every remaining inactive mode-button style (Ondular/Pedra/Alimentar/Vento — four occurrences of this exact string):
```javascript
                  : 'hover:bg-slate-800/70 text-slate-400 hover:text-slate-200'
```
Replace all four with:
```javascript
                  : 'hover:bg-stone-100 text-text/50 hover:text-primary'
```

Find the divider:
```javascript
          <div className="w-px h-5 bg-slate-700/60 mx-0.5 flex-none" aria-hidden="true" />
```
Replace with:
```javascript
          <div className="w-px h-5 bg-stone-200 mx-0.5 flex-none" aria-hidden="true" />
```

Find the rain-toggle inactive style:
```javascript
                  ? 'bg-blue-500/25 text-blue-300 border border-blue-400/40'
                  : 'hover:bg-slate-800/70 text-slate-500 hover:text-slate-300'
```
Replace the second line with:
```javascript
                  : 'hover:bg-stone-100 text-text/50 hover:text-primary'
```
(leave the `bg-blue-500/25...` active state as-is — it's a semantic "rain" color, not part of the dark chrome).

Find the sound-toggle inactive style:
```javascript
                  ? 'bg-teal-500/25 text-teal-300 border border-teal-400/40'
                  : 'hover:bg-slate-800/70 text-slate-500 hover:text-slate-300'
```
Replace the second line with:
```javascript
                  : 'hover:bg-stone-100 text-text/50 hover:text-primary'
```

Find the "Áudio indisponível" label and clear-lake / expand-toggle buttons (three occurrences of this pattern):
```javascript
            <span className="hidden max-w-32 truncate px-1 text-[10px] text-amber-200 sm:inline" role="status">
```
Replace `text-amber-200` with `text-warning`.

```javascript
              className="min-w-11 min-h-11 p-2 rounded-full hover:bg-slate-800/70 text-slate-500 hover:text-slate-300 transition-all duration-150 flex items-center justify-center"
```
Replace with:
```javascript
              className="min-w-11 min-h-11 p-2 rounded-full hover:bg-stone-100 text-text/50 hover:text-primary transition-all duration-150 flex items-center justify-center"
```

```javascript
              className={`p-2 rounded-full transition-all duration-150 flex items-center justify-center ${
                isExpanded
                  ? 'bg-slate-700/60 text-slate-300'
                  : 'hover:bg-slate-800/70 text-slate-500 hover:text-slate-300'
              }`}
```
Replace with:
```javascript
              className={`p-2 rounded-full transition-all duration-150 flex items-center justify-center ${
                isExpanded
                  ? 'bg-stone-200 text-primary'
                  : 'hover:bg-stone-100 text-text/50 hover:text-primary'
              }`}
```

Finally, find the `Tip` tooltip component definition near the top of the file:
```javascript
    <span className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap
      rounded-lg bg-slate-800/95 border border-slate-700/60 px-2 py-1 text-[10px] text-slate-300 shadow-xl
      opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 z-50">
```
Replace with:
```javascript
    <span className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap
      rounded-lg bg-primary border border-primary/60 px-2 py-1 text-[10px] text-white shadow-xl
      opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 z-50">
```

- [ ] **Step 4: Typecheck the three ported components**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "apps/lago" || echo "no lago errors"`
Expected: `no lago errors` (imports resolve since Task 4's modules exist; `WaterSimConfig`/`QualityProfile` types line up unchanged).

- [ ] **Step 5: Commit**

```bash
git add src/components/resources/apps/lago/components
git commit -m "feat: port lago pond canvas/controls, retheme controls to light UI"
```

---

### Task 6: Port and adapt LagoApp.tsx (entry component)

**Files:**
- Create: `src/components/resources/apps/lago/LagoApp.tsx`

**Interfaces:**
- Consumes: `PondCanvas`/`PondCanvasHandle` (`./components/PondCanvas`), `PondControls` (`./components/PondControls`), `LoadingScreen` (`./components/LoadingScreen`), `WaterSimConfig` (`./types`) — all from Tasks 4–5.
- Produces: `export default function LagoApp()` — a self-contained component with no required props, consumed by `ResourcesSection.jsx` in Task 8 as `<LagoApp />`.

- [ ] **Step 1: Copy `App.tsx` to `LagoApp.tsx`**

```bash
cp "/c/Users/aless/Downloads/lago/src/App.tsx" src/components/resources/apps/lago/LagoApp.tsx
```

- [ ] **Step 2: Rename the component and fix the root layout**

Edit `src/components/resources/apps/lago/LagoApp.tsx`. Find:
```javascript
export default function App() {
```
Replace:
```javascript
export default function LagoApp() {
```

Find:
```javascript
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
```
Replace:
```javascript
    <main className="relative min-h-[min(72vh,640px)] w-full h-full overflow-hidden rounded-[1.5rem] bg-slate-950 font-sans select-none sm:min-h-[min(62vh,560px)]">
```

(`w-screen h-screen` sized the app to the full browser viewport, which is correct for the standalone Vite app but not inside a modal. `min-h-[...]` + `w-full h-full` follows the same pattern already used by `SomaScan/App.tsx`'s root — a guaranteed minimum height so the WebGL canvas has real pixels to size against, while filling whatever the modal gives it. `rounded-[1.5rem]` matches the modal's own rounded corners so the dark canvas doesn't show square corners against `ResourceModalShell`'s `rounded-[2rem]` frame.)

- [ ] **Step 3: Re-theme the header to the light palette**

Find:
```javascript
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-900/70 backdrop-blur-md border border-slate-700/50 px-3.5 py-1.5 rounded-full shadow-lg">
          <div className="flex items-center gap-2">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            <h1 className="text-sm font-semibold tracking-widest text-slate-100 font-serif">
              Lago
            </h1>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline border-l border-slate-700/80 pl-2.5 leading-none">
            {modeHints[config.mode]}
          </span>
        </div>
```
Replace:
```javascript
        <div className="pointer-events-auto flex items-center gap-3 bg-white/90 backdrop-blur-md border border-stone-200 px-3.5 py-1.5 rounded-full shadow-lg">
          <div className="flex items-center gap-2">
            <Droplets className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <h1 className="text-sm font-semibold tracking-widest text-primary font-serif">
              Lago
            </h1>
          </div>
          <span className="text-[11px] text-text/60 hidden sm:inline border-l border-stone-200 pl-2.5 leading-none">
            {modeHints[config.mode]}
          </span>
        </div>
```

Find:
```javascript
          <span className="hidden sm:flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md border border-slate-700/40 px-2.5 py-1 rounded-full text-[10px] text-slate-400 tracking-wider select-none">
```
Replace:
```javascript
          <span className="hidden sm:flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-stone-200 px-2.5 py-1 rounded-full text-[10px] text-text/60 tracking-wider select-none">
```

Find:
```javascript
            className="bg-slate-900/70 backdrop-blur-md border border-slate-700/50 p-2 rounded-full text-slate-400 hover:text-white hover:border-slate-600 transition-all shadow-lg"
```
Replace:
```javascript
            className="bg-white/90 backdrop-blur-md border border-stone-200 p-2 rounded-full text-text/60 hover:text-primary hover:border-stone-300 transition-all shadow-lg"
```

- [ ] **Step 4: Re-theme the "Sobre" info modal, and make its overlay `absolute`**

Find:
```javascript
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            id="modal-info"
            ref={infoDialogRef}
            tabIndex={-1}
            className="w-full max-w-md bg-slate-900/98 border border-slate-700/80 rounded-2xl p-6 text-slate-200 shadow-2xl space-y-4 animate-modal-in"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-cyan-400" aria-hidden="true" />
                <h2 id="modal-title" className="text-sm font-semibold text-white tracking-wide">
                  Sobre o Lago WebGL
                </h2>
              </div>
              <button
                id="btn-close-info"
                type="button"
                ref={infoCloseRef}
                onClick={() => setShowInfo(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Uma experiência sensorial de águas calmas simulada em tempo real com equações de onda em{' '}
              <span className="text-cyan-300 font-medium">WebGL</span>.
            </p>
```
Replace:
```javascript
        <div
          className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            id="modal-info"
            ref={infoDialogRef}
            tabIndex={-1}
            className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-6 text-text shadow-2xl space-y-4 animate-modal-in"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-accent" aria-hidden="true" />
                <h2 id="modal-title" className="text-sm font-semibold text-primary tracking-wide">
                  Sobre o Lago WebGL
                </h2>
              </div>
              <button
                id="btn-close-info"
                type="button"
                ref={infoCloseRef}
                onClick={() => setShowInfo(false)}
                className="p-1.5 rounded-lg text-text/50 hover:text-primary hover:bg-stone-100 transition-colors"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-text/80 leading-relaxed">
              Uma experiência sensorial de águas calmas simulada em tempo real com equações de onda em{' '}
              <span className="text-accent font-medium">WebGL</span>.
            </p>
```

Find:
```javascript
                <li key={label} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className={`mt-0.5 flex-none w-1.5 h-1.5 rounded-full ${color}`} aria-hidden="true" />
                  <span><strong className="text-slate-200">{label}:</strong> {desc}</span>
                </li>
```
Replace:
```javascript
                <li key={label} className="flex items-start gap-2.5 text-xs text-text/80">
                  <span className={`mt-0.5 flex-none w-1.5 h-1.5 rounded-full ${color}`} aria-hidden="true" />
                  <span><strong className="text-text">{label}:</strong> {desc}</span>
                </li>
```

Find:
```javascript
              className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 font-semibold text-xs rounded-xl transition-all shadow-md"
```
Replace:
```javascript
              className="w-full py-2.5 px-4 bg-accent hover:bg-accent-light active:scale-[0.98] text-white font-semibold text-xs rounded-xl transition-all shadow-md"
```

- [ ] **Step 5: Re-theme the WebGL-unavailable error banner**

Find:
```javascript
        <div className="absolute inset-x-4 top-20 z-20 mx-auto max-w-lg rounded-xl border border-amber-300/30 bg-slate-950/90 p-4 text-sm text-amber-100 shadow-xl" role="alert">
          <strong className="block text-amber-200">Visualização indisponível</strong>
          <span>{webglError}</span>
        </div>
```
Replace:
```javascript
        <div className="absolute inset-x-4 top-20 z-20 mx-auto max-w-lg rounded-xl border border-warning/30 bg-white/95 p-4 text-sm text-text shadow-xl" role="alert">
          <strong className="block text-warning">Visualização indisponível</strong>
          <span>{webglError}</span>
        </div>
```

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "apps/lago" || echo "no lago errors"`
Expected: `no lago errors`.

- [ ] **Step 7: Commit**

```bash
git add src/components/resources/apps/lago/LagoApp.tsx
git commit -m "feat: port and retheme LagoApp entry component to light UI chrome"
```

---

### Task 7: Add Lago's scoped animation/utility CSS

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: CSS classes `.lago-app .pond-range`, `.lago-app .pond-range::-webkit-slider-thumb`, `.lago-app .pond-range::-moz-range-thumb`, `@keyframes mandala-spin` is already inlined via `<style>` in `BreathingAnimation.jsx` (Task 2) and does not need a global entry; `@keyframes ring-pulse`, `koi-swim`, `float-particle`, `slide-up`, `modal-in`, `fade-in-lago` scoped under `.lago-app` so they don't collide with the site's existing `fade-in`/`fade-in-up` animation names in `tailwind.config.js`. Consumed by class names already present in the ported `LoadingScreen.tsx` (`animate-slide-up` is referenced by `PondControls.tsx`'s expanded panel; `loading-rings` and inline `animation: ring-pulse ...` / `koi-swim` / `float-particle` styles are inlined in `LoadingScreen.tsx` via the `style` prop, not via a class name — so only `.pond-range` and `.animate-slide-up`/`.animate-modal-in`/`.animate-fade-in` need real definitions).

- [ ] **Step 1: Append the scoped Lago styles to the end of `src/app/globals.css`**

Add at the end of the file:

```css

/* ─── Lago resource — scoped animations & range input ──────────────────── */

.lago-app {
  --lago-accent: rgb(var(--color-accent));
}

@keyframes lago-ring-pulse {
  0%   { opacity: 0.7; transform: scale(1); }
  60%  { opacity: 0.15; transform: scale(1.12); }
  100% { opacity: 0; transform: scale(1.22); }
}

@keyframes lago-koi-swim {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  35%       { transform: translateX(8px) rotate(8deg); }
  65%       { transform: translateX(-5px) rotate(-5deg); }
}

@keyframes lago-float-particle {
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  50%       { transform: translateY(-14px); opacity: 0.9; }
}

@keyframes lago-slide-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes lago-modal-in {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.lago-app .animate-slide-up {
  animation: lago-slide-up 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.lago-app .animate-modal-in {
  animation: lago-modal-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.lago-app .loading-rings circle[style*="ring-pulse"] {
  animation-name: lago-ring-pulse;
}

.lago-app .pond-range {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 9999px;
  outline: none;
  min-height: 44px;
  background: linear-gradient(to right, var(--lago-accent), rgb(var(--color-accent-light)));
}

.lago-app .pond-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--lago-accent);
  cursor: pointer;
  box-shadow: 0 0 0 3px rgb(var(--color-accent) / 0.15);
  transition: box-shadow 0.15s ease;
}

.lago-app .pond-range::-webkit-slider-thumb:hover {
  box-shadow: 0 0 0 5px rgb(var(--color-accent) / 0.25);
}

.lago-app .pond-range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--lago-accent);
  cursor: pointer;
}

.lago-app canvas {
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}
```

- [ ] **Step 2: Wrap `LagoApp.tsx`'s root in the `.lago-app` scope class**

Edit `src/components/resources/apps/lago/LagoApp.tsx` once more. Find the `<main>` root opening tag from Task 6 Step 2:
```javascript
    <main className="relative min-h-[min(72vh,640px)] w-full h-full overflow-hidden rounded-[1.5rem] bg-slate-950 font-sans select-none sm:min-h-[min(62vh,560px)]">
```
Replace:
```javascript
    <main className="lago-app relative min-h-[min(72vh,640px)] w-full h-full overflow-hidden rounded-[1.5rem] bg-slate-950 font-sans select-none sm:min-h-[min(62vh,560px)]">
```

The `ring-pulse` / `koi-swim` / `float-particle` inline `style={{ animation: '...' }}` occurrences inside `LoadingScreen.tsx` (Task 5) reference the animation names `ring-pulse`, `koi-swim`, `float-particle` directly (not `lago-ring-pulse` etc.) — since `globals.css` only defines the `lago-*`-prefixed keyframes to avoid clobbering any future global animation of the same short name, update `LoadingScreen.tsx`'s three inline `animation:` style strings to use the prefixed names. In `src/components/resources/apps/lago/components/LoadingScreen.tsx`, find:
```javascript
                animation: `ring-pulse 3s ease-out infinite`,
```
Replace:
```javascript
                animation: `lago-ring-pulse 3s ease-out infinite`,
```

Find (two occurrences):
```javascript
            style={{ animation: 'koi-swim 4s ease-in-out infinite' }}
```
and
```javascript
            style={{ animation: 'koi-swim 4s ease-in-out infinite', animationDelay: '1.6s' }}
```
Replace `koi-swim` with `lago-koi-swim` in both.

Find:
```javascript
              animation: `float-particle ${5 + (i % 4)}s ease-in-out infinite`,
```
Replace:
```javascript
              animation: `lago-float-particle ${5 + (i % 4)}s ease-in-out infinite`,
```

(Remove the now-unused `.lago-app .loading-rings circle[style*="ring-pulse"] { animation-name: lago-ring-pulse; }` rule added in Step 1, since the inline style now names `lago-ring-pulse` directly — edit `globals.css` to delete that one rule block.)

- [ ] **Step 3: Visually sanity-check the CSS compiles**

Run: `npx next build --no-lint 2>&1 | tail -40`
Expected: build completes (or fails on unrelated pre-existing issues only) with no CSS syntax errors reported for `globals.css`.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/components/resources/apps/lago/LagoApp.tsx src/components/resources/apps/lago/components/LoadingScreen.tsx
git commit -m "feat: scope lago animations and range-input styles under .lago-app"
```

---

### Task 8: Wire Lago into ResourcesSection.jsx

**Files:**
- Modify: `src/components/ResourcesSection.jsx`

**Interfaces:**
- Consumes: `LagoApp` default export from `./resources/apps/lago/LagoApp` (Task 6/7).
- Produces: new `activeResource === "lago"` state value, reachable via a new card; no changes to `ResourceModalShell`/`ResourceAppFrame` props/signatures.

- [ ] **Step 1: Import `LagoApp` and add the `Waves` icon**

In `src/components/ResourcesSection.jsx`, find:
```javascript
import {
  Wind,
  Sprout,
  Sparkles,
  Fingerprint,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import BreathingApp from "./resources/apps/breathing/BreathingApp";
import { App as QuizBank } from "./Quiz/App";
import SomaScan from "./resources/apps/soma-scan/App";
import ResourceModalShell from "./resources/ResourceModalShell";
import ResourceAppFrame from "./resources/ResourceAppFrame";
import { EmotionTreeApp } from "./resources/apps/emotion-tree/EmotionTreeApp";
```
Replace:
```javascript
import {
  Wind,
  Sprout,
  Sparkles,
  Fingerprint,
  Waves,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import BreathingApp from "./resources/apps/breathing/BreathingApp";
import { App as QuizBank } from "./Quiz/App";
import SomaScan from "./resources/apps/soma-scan/App";
import LagoApp from "./resources/apps/lago/LagoApp";
import ResourceModalShell from "./resources/ResourceModalShell";
import ResourceAppFrame from "./resources/ResourceAppFrame";
import { EmotionTreeApp } from "./resources/apps/emotion-tree/EmotionTreeApp";
```

- [ ] **Step 2: Update the `activeResource` doc comment**

Find:
```javascript
  const [activeResource, setActiveResource] = useState(null); // 'breathing' | 'emotion-tree' | 'quiz' | 'somascan'
```
Replace:
```javascript
  const [activeResource, setActiveResource] = useState(null); // 'breathing' | 'emotion-tree' | 'quiz' | 'somascan' | 'lago'
```

- [ ] **Step 3: Add the Lago card after the Mental Health Quiz card**

Find the end of the Quiz card block and the closing of the scroll container:
```javascript
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-sage group-hover:text-primary transition-colors">
                Explorar Quizzes
              </span>
            </motion.div>
          </div>
```
Replace:
```javascript
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-sage group-hover:text-primary transition-colors">
                Explorar Quizzes
              </span>
            </motion.div>

            {/* Lago Card (NEW) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -5 }}
              className="flex-shrink-0 w-80 md:w-auto snap-center group relative bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center"
              onClick={() => openResource("lago")}
            >
              <div className="w-16 h-16 rounded-2xl bg-sage/10 flex items-center justify-center text-sage mb-6 group-hover:scale-110 transition-transform">
                <Waves size={32} />
              </div>
              <h3 className="text-xl font-serif text-primary font-bold mb-2">
                Lago
              </h3>
              <p className="text-text/60 text-sm mb-6 flex-grow">
                Um lago vivo em WebGL — toque a água, alimente as carpas,
                sinta a calma se espalhar.
              </p>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-sage group-hover:text-primary transition-colors">
                Entrar no Lago
              </span>
            </motion.div>
          </div>
```

- [ ] **Step 4: Add the modal title branch and content branch**

Find:
```javascript
        title={
          activeResource === "emotion-tree"
            ? "Árvore das Emoções"
            : activeResource === "breathing"
              ? "Guia de Respiração"
              : activeResource === "somascan"
                ? "SomaScan"
                : "Banco de Quizzes"
        }
```
Replace:
```javascript
        title={
          activeResource === "emotion-tree"
            ? "Árvore das Emoções"
            : activeResource === "breathing"
              ? "Guia de Respiração"
              : activeResource === "somascan"
                ? "SomaScan"
                : activeResource === "lago"
                  ? "Lago"
                  : "Banco de Quizzes"
        }
```

Find:
```javascript
        {activeResource === "quiz" && (
          <ResourceAppFrame title="Banco de Quizzes">
            <div className="resource-app resource-app--light">
              <QuizBank />
            </div>
          </ResourceAppFrame>
        )}
      </ResourceModalShell>
```
Replace:
```javascript
        {activeResource === "quiz" && (
          <ResourceAppFrame title="Banco de Quizzes">
            <div className="resource-app resource-app--light">
              <QuizBank />
            </div>
          </ResourceAppFrame>
        )}
        {activeResource === "lago" && (
          <ResourceAppFrame title="Lago">
            <div className="resource-app resource-app--light">
              <LagoApp />
            </div>
          </ResourceAppFrame>
        )}
      </ResourceModalShell>
```

- [ ] **Step 5: Run the full test suite to check for regressions**

Run: `npx jest`
Expected: PASS — all previously-passing suites (including `app-shell-contract.test.tsx`, which does not import `LagoApp` and is unaffected) still pass, plus the 8 new breathing tests from Tasks 1–2.

- [ ] **Step 6: Commit**

```bash
git add src/components/ResourcesSection.jsx
git commit -m "feat: add lago as a new interactive resource on /recursos"
```

---

### Task 9: Manual verification in the browser

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server and open `/recursos`**

Run: `npm run dev` (or use the project's existing dev-server launch config), then open `http://localhost:3000/recursos` in a browser.

- [ ] **Step 2: Verify the Lago card and modal**

- Confirm a 5th card "Lago" appears (Waves icon, sage accent) after "Banco de Quizzes".
- Click it; confirm the modal opens, the loading screen animates to 100%, and the pond canvas renders and fills the modal without visible clipping or a scrollbar.
- Confirm the header, control dock, and expanded-settings panel are in the site's light palette (white/stone backgrounds, `primary`/`text`/`accent` text), while the water/sky itself keeps its original dark/aquatic look.
- Tap the water to create ripples; switch to "Pedra", "Alimentar", and "Vento" modes; toggle rain; open and close the "Sobre" info panel; confirm it is centered within the modal (not the full browser window) and light-themed.
- Resize the browser to a narrow (mobile) width; confirm the dock and header remain usable.

- [ ] **Step 3: Verify the Guia de Respiração fix**

- Open the "Guia de Respiração" card, select "Relaxamento Rápido" (4-6), start a session.
- With a stopwatch or by eye, confirm the mandala takes about 4 seconds to fully expand ("Inspire") and about 6 seconds to fully contract ("Expire") — not an instant flicker.
- Confirm the mandala and timer ring are visibly smaller/more compact than before, and the whole active-session view fits without excess empty space or scroll on both desktop and a narrow mobile width.
- Repeat briefly with "Lábios Semicerrados" (2s inhale / 4s exhale) to confirm both techniques are correctly timed.

- [ ] **Step 4: Stop the dev server**

No commit for this task — it is verification only. If any issue is found, fix it in the relevant earlier task's files and re-run that task's tests before re-verifying here.

---

## Self-Review Notes

- **Spec coverage:** Lago card + description (Task 8), light-theme UI chrome only / canvas untouched (Tasks 5–7), no `@google/genai` dependency (Global Constraints + Task 4 note), `activeResource === "lago"` wiring (Task 8), breathing bug root cause fixed via property-name unification (Task 1), compact inflate/deflate mandala (Task 2), compacted surrounding layout (Task 3), manual test plan (Task 9) — all spec sections have a corresponding task.
- **Type consistency:** `TECHNIQUES` properties (`inhaleDuration`/`holdDuration`/`exhaleDuration`/`holdAfterExhale`) are defined once in Task 1 and consumed with the same names in Task 2's rewritten `BreathingAnimation.jsx`; `LagoApp` default export name is defined in Task 6 and imported with that exact name in Task 8; `PondCanvasHandle`, `WaterSimConfig`, and the `PondControls`/`LoadingScreen` prop shapes are untouched from the original app, so Task 6's `LagoApp.tsx` usage (unchanged from the original `App.tsx` logic) continues to type-check.
- **No placeholders:** every step includes literal find/replace text or full file contents; no "add appropriate styling" or "similar to Task N" shortcuts.
