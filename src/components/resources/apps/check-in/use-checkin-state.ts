import { useCallback, useMemo, useState } from "react";

import type { RegionId, Sensation } from "../body-map/types";
import { getRegion } from "../body-map/data/regions";
import type { CheckInActions, CheckInState, MarkedRegion } from "./types";
import { CHECKIN_STEPS, checkinPrompts } from "./types";

const STORAGE_KEY = "checkin-corporal-state";

function loadPersisted(): Partial<CheckInState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<CheckInState>;
  } catch {
    return null;
  }
}

function persist(state: Partial<CheckInState>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota errors — silently ignored */
  }
}

interface MetaResult {
  markedRegions: MarkedRegion[];
  hasContent: boolean;
  totalSteps: number;
}

export function useCheckInState(): [CheckInState, CheckInActions, MetaResult] {
  const persisted = useMemo(() => loadPersisted(), []);

  const [arrivalAnswers, setArrivalAnswers] = useState<string[]>(
    persisted?.arrivalAnswers ?? ["", "", "", ""],
  );

  const [bodyMarks, setBodyMarks] = useState<
    Record<RegionId, Sensation | undefined>
  >(persisted?.bodyMarks ?? ({} as Record<RegionId, Sensation | undefined>));

  const [bodyNotes, setBodyNotes] = useState<Record<RegionId, string>>(
    persisted?.bodyNotes ?? ({} as Record<RegionId, string>),
  );

  const [currentStep, setCurrentStep] = useState<number>(
    persisted?.currentStep ?? CHECKIN_STEPS.ARRIVAL,
  );

  const advanceStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  const goBackStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const setArrivalAnswer = useCallback((index: number, value: string) => {
    setArrivalAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleBodyMark = useCallback(
    (region: RegionId, sensation: Sensation | undefined) => {
      setBodyMarks((prev) => ({ ...prev, [region]: sensation }));
    },
    [],
  );

  const setBodyNote = useCallback((region: RegionId, note: string) => {
    setBodyNotes((prev) => ({ ...prev, [region]: note }));
  }, []);

  const resetAll = useCallback(() => {
    setArrivalAnswers(["", "", "", ""]);
    setBodyMarks({} as Record<RegionId, Sensation | undefined>);
    setBodyNotes({} as Record<RegionId, string>);
    setCurrentStep(CHECKIN_STEPS.ARRIVAL);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const completeFlow = useCallback(() => {
    setCurrentStep(CHECKIN_STEPS.REFLECTION);
  }, []);

  // Persist to localStorage on meaningful state changes
  useMemo(() => {
    persist({ arrivalAnswers, bodyMarks, bodyNotes, currentStep });
  }, [arrivalAnswers, bodyMarks, bodyNotes, currentStep]);

  const markedRegions = useMemo<MarkedRegion[]>(() => {
    const result: MarkedRegion[] = [];
    for (const regionId of Object.keys(bodyMarks) as RegionId[]) {
      const sensation = bodyMarks[regionId];
      if (sensation) {
        const regionInfo = getRegion(regionId);
        result.push({
          region: regionId,
          sensation,
          regionLabel: regionInfo.label,
        });
      }
    }
    return result;
  }, [bodyMarks]);

  const hasContent = useMemo(() => {
    const hasText = arrivalAnswers.some((a) => a.trim().length > 0);
    const hasMarks = Object.values(bodyMarks).some(Boolean);
    const hasBodyNote = Object.values(bodyNotes).some(
      (n) => n.trim().length > 0,
    );
    return hasText || hasMarks || hasBodyNote;
  }, [arrivalAnswers, bodyMarks, bodyNotes]);

  const totalSteps = CHECKIN_STEPS.COMPLETED;

  return [
    {
      arrivalAnswers,
      bodyMarks,
      bodyNotes,
      currentStep,
    },
    {
      advanceStep,
      goBackStep,
      setArrivalAnswer,
      handleBodyMark,
      setBodyNote,
      resetAll,
      completeFlow,
    },
    { markedRegions, hasContent, totalSteps },
  ];
}
