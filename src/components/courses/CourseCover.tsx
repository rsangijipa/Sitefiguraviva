"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen } from "lucide-react";

export function CourseCover({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Safety net for a hydration race: the server-rendered <img> can start
  // loading (and fail) before React finishes hydrating and attaches the
  // onError listener to this specific node, silently losing the error and
  // leaving a permanently broken image with no fallback.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true);
    }
  }, [src]);

  if (!src || failed)
    return (
      <div className="flex h-full w-full items-center justify-center bg-primary/5 text-gold">
        <BookOpen size={48} strokeWidth={1.5} />
      </div>
    );
  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
}
