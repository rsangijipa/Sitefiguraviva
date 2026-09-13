import type { RegionId, Sensation } from "../types";
import { regions } from "../data/regions";

interface RegionListProps {
  selectedRegion: RegionId;
  marks: Record<RegionId, Sensation | undefined>;
  onSelect: (id: RegionId) => void;
}

export function RegionList({
  selectedRegion,
  marks,
  onSelect,
}: RegionListProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
      {regions.map((region) => {
        const active = region.id === selectedRegion;
        const hasMark = marks[region.id];

        return (
          <button
            key={region.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(region.id)}
            className={`flex min-h-11 flex-col justify-center rounded-lg border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
              active
                ? "border-primary bg-primary text-paper"
                : "border-primary/15 bg-surface text-primary hover:border-terra/40"
            }`}
          >
            <span>{region.label}</span>
            {hasMark ? (
              <span className="mt-0.5 block text-[11px] opacity-75 capitalize">
                {hasMark}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
