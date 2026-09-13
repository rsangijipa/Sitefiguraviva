import { ArrowRight, Bookmark } from "lucide-react";
import { MicroCase } from "../types";

interface CaseCardProps {
  item: MicroCase;
  isSaved: boolean;
  onBookmark: () => void;
  onOpen: () => void;
}

export default function CaseCard({
  item,
  isSaved,
  onBookmark,
  onOpen,
}: CaseCardProps) {
  return (
    <article className="mc-card">
      <div className="mc-card-top">
        <small>MICROCASO · {item.level.toUpperCase()}</small>
        <button
          className="mc-card-bookmark"
          onClick={onBookmark}
          aria-label="Guardar caso"
        >
          <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
      <div className="mc-card-footer">
        <span>
          {item.theme} · ~{item.minutes} min
        </span>
        <button onClick={onOpen}>
          Explorar caso <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}
