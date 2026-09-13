"use client";

import { ArrivalStep } from "./components/ArrivalStep";
import { BodyMappingStep } from "./components/BodyMappingStep";
import { ReflectionStep } from "./components/ReflectionStep";
import { useCheckInState } from "./use-checkin-state";
import { CHECKIN_STEPS } from "./types";

export default function CheckInApp() {
  const [state, actions, meta] = useCheckInState();

  if (state.currentStep === CHECKIN_STEPS.BODY_MAPPING) {
    return (
      <BodyMappingStep
        state={state}
        actions={actions}
        totalSteps={meta.totalSteps}
      />
    );
  }

  if (state.currentStep >= CHECKIN_STEPS.REFLECTION) {
    return (
      <ReflectionStep
        state={state}
        actions={{ ...actions, markedRegions: meta.markedRegions }}
      />
    );
  }

  return (
    <ArrivalStep
      state={state}
      actions={{ ...actions, hasContent: meta.hasContent }}
      totalSteps={meta.totalSteps}
    />
  );
}
