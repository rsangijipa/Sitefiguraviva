export type BodyPartId = 'head' | 'neck' | 'chest' | 'stomach' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg' | 'feet';

export type SensationType = 'tension' | 'heat' | 'weight' | 'neutral' | 'tingling' | 'numbness';

export interface BodyLog {
  id: BodyPartId;
  label: string;
  sensation: SensationType;
  intensity: number; // 1-5
}

export type BodyData = Partial<Record<BodyPartId, BodyLog>>;

export type AppState = 'intro' | 'scanning' | 'results';

export interface RecommendationResponse {
  summary: string;
  recommendation: string;
}