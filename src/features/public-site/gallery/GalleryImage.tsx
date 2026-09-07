"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export interface GalleryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  fit?: "cover" | "contain";
  priority?: boolean;
}

export function GalleryImage({
  src,
  alt,
  width = 1200,
  height = 900,
  className,
  imageClassName,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
  fit = "cover",
  priority = false,
}: GalleryImageProps) {
  const [failed, setFailed] = useState(false);
  const aspectRatio = `${width} / ${height}`;

  return (
    <div
      className={cn("relative w-full overflow-hidden bg-areia", className)}
      style={{ aspectRatio }}
    >
      {failed ? (
        <div
          role="status"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-areia to-gold/15 p-6 text-center text-primary"
        >
          <ImageOff size={30} strokeWidth={1.5} aria-hidden="true" />
          <span className="text-sm font-semibold">
            Imagem indisponível: {alt}
          </span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          priority={priority}
          sizes={sizes}
          onError={() => setFailed(true)}
          className={cn(
            fit === "contain" ? "object-contain" : "object-cover",
            imageClassName,
          )}
        />
      )}
    </div>
  );
}
