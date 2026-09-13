import type {
  BodyMark as BaseBodyMark,
  RegionId,
  Sensation,
} from "../body-map/types";

export const checkinPrompts = [
  "Uma palavra ou sensação que aparece",
  "A energia que percebo",
  "No meu corpo",
  "Algo que precisa de atenção",
] as const;

export const CHECKIN_STEPS = {
  ARRIVAL: 0,
  BODY_MAPPING: 1,
  REFLECTION: 2,
  COMPLETED: 3,
} as const;

export interface CheckInState {
  arrivalAnswers: string[];
  bodyMarks: Record<RegionId, Sensation | undefined>;
  bodyNotes: Record<RegionId, string>;
  currentStep: number;
}

export interface CheckInActions {
  advanceStep: () => void;
  goBackStep: () => void;
  setArrivalAnswer: (index: number, value: string) => void;
  handleBodyMark: (region: RegionId, sensation: Sensation | undefined) => void;
  setBodyNote: (region: RegionId, note: string) => void;
  resetAll: () => void;
  completeFlow: () => void;
}

export type MarkedRegion = BaseBodyMark & { regionLabel: string };
