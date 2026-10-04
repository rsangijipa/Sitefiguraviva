export type RegionId =
  | "head"
  | "neck"
  | "chest"
  | "abdomen"
  | "left-arm"
  | "right-arm"
  | "left-leg"
  | "right-leg"
  | "feet";

export type Sensation = "tensão" | "calor" | "peso" | "formigamento" | "leveza";

export interface BodyMark {
  region: RegionId;
  sensation: Sensation;
}
