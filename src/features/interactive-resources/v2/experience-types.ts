import { useEffect } from "react";
import type { EditorialItem, EditorialVersion } from "./editorial-schema";
export interface ExperienceProps {
  mode: string; version: EditorialVersion | null; concepts: EditorialItem[];
  emotions: EditorialItem[]; needs: EditorialItem[]; cases: EditorialItem[];
  onDraft: (payload: unknown) => void; onComplete: (payload: unknown) => void;
}
// Reporting is in-memory only. No storage, telemetry or request is performed.
export function useExperienceDraft(payload: unknown, report: ExperienceProps["onDraft"]) {
  const serialized = JSON.stringify(payload);
  useEffect(() => { report(JSON.parse(serialized)); }, [serialized, report]);
}
