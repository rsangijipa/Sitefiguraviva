import { ClientThought } from "../types";
import { ThoughtLeaf } from "./ThoughtLeaf";

interface GardenStageProps {
  leaves: ClientThought[];
  onSaveLeaf: (id: string) => void;
  onRemoveLeaf: (id: string) => void;
  onFloatLeaf: (id: string) => void;
  emptyMessage?: string;
}

export function GardenStage({
  leaves,
  onSaveLeaf,
  onRemoveLeaf,
  onFloatLeaf,
  emptyMessage = "O jardim est\u00e1 aberto.",
}: GardenStageProps) {
  const placedLeaves = leaves.filter(
    (l) => l.status === "placed" || l.status === "floating",
  );

  if (placedLeaves.length === 0 && leaves.length === 0) {
    return (
      <div className="relative min-h-[240px] sm:min-h-[320px] rounded-[24px] border-2 border-[#D8CFBE] bg-[#FDFAF4] p-6 flex items-center justify-center">
        <div className="absolute bottom-5 left-5 right-5 h-0.5 rounded-full bg-[#07614C]/20" />
        <p className="font-serif text-xl italic text-[#005A1F]/55 py-20 text-center">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[240px] sm:min-h-[320px] rounded-[24px] border-2 border-[#D8CFBE] bg-[#FDFAF4] p-6 overflow-hidden">
      <div className="absolute bottom-5 left-5 right-5 h-0.5 rounded-full bg-[#07614C]/20" />
      <div className="flex flex-wrap items-end gap-4 relative z-10">
        {placedLeaves.map((leaf) => (
          <ThoughtLeaf
            key={leaf.id}
            leaf={leaf}
            isSaved={leaf.savedRecordId != null}
            onRemove={() => onRemoveLeaf(leaf.id)}
            onSave={() => onSaveLeaf(leaf.id)}
            onFloat={() => onFloatLeaf(leaf.id)}
          />
        ))}
      </div>
    </div>
  );
}
