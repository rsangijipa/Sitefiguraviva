"use client";

import { BookOpen } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

export function CourseCover({ src, alt }: { src?: string; alt: string }) {
  if (!src)
    return (
      <div className="flex h-full w-full items-center justify-center bg-primary/5 text-gold">
        <BookOpen size={48} strokeWidth={1.5} />
      </div>
    );
  return (
    <SafeImage
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 33vw"
      className="object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
}
