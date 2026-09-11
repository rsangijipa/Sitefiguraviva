"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { getImageSrc } from "@/lib/imageUtils";

export interface SafeImageProps extends Omit<
  ImageProps,
  "src" | "alt" | "onError"
> {
  src: string | null | undefined;
  alt: string;
  fallbackSrc?: string;
  onLoadError?: (src: string | null | undefined) => void;
}

export function SafeImage({
  src,
  alt,
  fallbackSrc = "/assets/foto-grupo.jpg",
  onLoadError,
  ...props
}: SafeImageProps) {
  const normalized = getImageSrc(src, fallbackSrc);
  const [currentSrc, setCurrentSrc] = useState(normalized);

  useEffect(() => setCurrentSrc(normalized), [normalized]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc === fallbackSrc) return;
        if (process.env.NODE_ENV === "development") {
          console.warn("[SafeImage] imagem indisponível", { src });
        }
        onLoadError?.(src);
        setCurrentSrc(fallbackSrc);
      }}
    />
  );
}
