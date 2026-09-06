"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

export function CourseCover({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className="flex h-full w-full items-center justify-center bg-primary/5 text-gold"><BookOpen size={48} strokeWidth={1.5} /></div>;
  return <img src={src} alt={alt} onError={() => setFailed(true)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />;
}
