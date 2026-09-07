"use client";

import { motion } from "framer-motion";
import { useFounderSettings } from "@/hooks/useSiteSettings";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

import SectionShell from "../ui/SectionShell";

export default function FounderSection({ initialData }: { initialData?: any }) {
  const { data } = useFounderSettings(initialData);

  return (
    <SectionShell
      id="fundadora"
      className="bg-areia border-t border-border"
      containerClassName="max-w-5xl"
    >
      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
        {/* Image - Compact */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0">
          <div
            className="absolute inset-0 scale-105 rounded-full border border-terra/40"
            aria-hidden
          />
          <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-paper bg-nevoa">
            <Image
              src={data.image}
              alt={data.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 192px, 256px"
              priority
            />
          </div>
        </div>

        {/* Content - Compact */}
        <div className="text-center md:text-left flex-1">
          <span className="fv-eyebrow mb-2">Curadoria</span>
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-2">
            {data.name}
          </h2>
          <p className="mb-6 text-sm font-bold uppercase tracking-wider text-terra">
            {data.role}
          </p>
          <p className="fv-lead mb-6">{data.bio}</p>

          <div className="flex justify-center md:justify-start">
            <a
              href={data.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary hover:text-gold transition-colors"
            >
              Ver Currículo Lattes
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
