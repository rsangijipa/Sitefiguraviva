"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Player do YouTube que só carrega o iframe quando a pessoa toca em
 * "reproduzir": a página do diário fica leve e o YouTube não é chamado
 * para quem só está rolando.
 */
export function YouTubeFacade({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        title={title || "Vídeo do YouTube"}
        className="absolute inset-0 h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Reproduzir vídeo: ${title || "vídeo do YouTube"}`}
      className="group absolute inset-0 flex h-full w-full items-center justify-center bg-black focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[-3px] focus-visible:outline-white"
    >
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
      />
      <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-primary/90 text-white shadow-[0_10px_30px_rgb(0_0_0/0.45)] transition-transform group-hover:scale-105 motion-reduce:transition-none">
        <Play
          size={26}
          aria-hidden="true"
          className="ml-1"
          fill="currentColor"
        />
      </span>
    </button>
  );
}
