import { useCallback, useMemo, useState } from "react";

import type { BodyMark, RegionId, Sensation } from "../types";
import { getRegion, regions } from "../data/regions";
import { sensations } from "../data/sensations";

interface UseBodyMapReturn {
  selectedRegion: RegionId;
  marks: Record<RegionId, Sensation | undefined>;
  note: string;
  completed: boolean;
  selectedInfo: ReturnType<typeof getRegion>;
  markedCount: number;
  progressPercentage: number;
  markedRegions: BodyMark[];
  selectRegion: (id: RegionId) => void;
  markSensation: (sensation: Sensation) => void;
  clearMark: () => void;
  setNote: (note: string) => void;
  complete: () => void;
  reset: () => void;
}

export function useBodyMap(): UseBodyMapReturn {
  const [selectedRegion, setSelectedRegion] = useState<RegionId>("chest");
  const [marks, setMarks] = useState<Record<RegionId, Sensation | undefined>>(
    {} as Record<RegionId, Sensation | undefined>,
  );
  const [note, setNote] = useState("");
  const [completed, setCompleted] = useState(false);

  const selectedInfo = useMemo(
    () => getRegion(selectedRegion),
    [selectedRegion],
  );

  const markedCount = useMemo(
    () => Object.values(marks).filter(Boolean).length,
    [marks],
  );

  const progressPercentage = useMemo(
    () => Math.round((markedCount / regions.length) * 100),
    [markedCount],
  );

  const markedRegions = useMemo(() => {
    return regions
      .map((r) => {
        const sensation = marks[r.id];
        return sensation ? { region: r.id, sensation } : null;
      })
      .filter(Boolean) as BodyMark[];
  }, [marks]);

  const selectRegion = useCallback((id: RegionId) => {
    setSelectedRegion(id);
  }, []);

  const markSensation = useCallback(
    (sensation: Sensation) => {
      setMarks((prev) => ({ ...prev, [selectedRegion]: sensation }));
    },
    [selectedRegion],
  );

  const clearMark = useCallback(() => {
    setMarks((prev) => ({ ...prev, [selectedRegion]: undefined }));
  }, [selectedRegion]);

  const complete = useCallback(() => {
    setCompleted(true);
  }, []);

  const reset = useCallback(() => {
    setSelectedRegion("chest");
    setMarks({} as Record<RegionId, Sensation | undefined>);
    setNote("");
    setCompleted(false);
  }, []);

  return {
    selectedRegion,
    marks,
    note,
    completed,
    selectedInfo,
    markedCount,
    progressPercentage,
    markedRegions,
    selectRegion,
    markSensation,
    clearMark,
    setNote,
    complete,
    reset,
  };
}
