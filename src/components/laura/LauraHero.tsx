"use client";
import { motion } from "framer-motion";
import { ArrowDown, BookOpen } from "lucide-react";
import Image from "next/image";
import { lauraPerlsContent } from "@/content/laura-perls";

export function LauraHero() {
  const { hero } = lauraPerlsContent;
  return (
    <section className="relative overflow-hidden border-b border-primary/10 bg-paper px-6 pb-16 pt-28 md:pb-20 md:pt-36">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(254,83,139,0.16),transparent_24%),radial-gradient(circle_at_70%_85%,rgba(1,201,77,0.12),transparent_25%)]"
        aria-hidden="true"
      />
      <svg
        className="pointer-events-none absolute -right-10 top-24 h-80 w-96 text-terra/30"
        viewBox="0 0 360 300"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M350 290C282 232 270 170 294 102C306 66 326 34 352 8M294 102C250 104 220 88 190 58M280 150C235 155 196 142 158 115"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="190" cy="58" r="8" fill="#FE538B" />
        <circle cx="158" cy="115" r="7" fill="#FED701" />
      </svg>
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.72fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-3 text-terra">
            <BookOpen size={18} aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-[0.22em]">
              Arquivo histórico
            </span>
          </div>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.28em] text-igarape">
            Uma vida dedicada à psicoterapia
          </p>
          <h1 className="mt-3 font-serif text-6xl leading-[0.92] text-primary md:text-8xl">
            Laura <span className="italic text-terra">Posner</span> Perls
          </h1>
          <p className="mt-8 max-w-xl border-l-2 border-terra pl-5 font-serif text-xl italic leading-relaxed text-mata">
            {hero.title}
          </p>
          <div className="mt-8 grid max-w-lg grid-cols-2 gap-5 border-t border-nevoa pt-5">
            {hero.quickFacts.map((f) => (
              <div key={f.label}>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-pedra">
                  {f.label}
                </span>
                <span className="font-serif text-lg text-primary">
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="absolute -inset-5 rounded-[32px] bg-[linear-gradient(135deg,rgba(254,83,139,.22),rgba(254,215,1,.18),rgba(1,201,77,.18))]" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] border-4 border-primary bg-areia">
            <Image
              src={hero.image}
              alt="Laura Perls"
              fill
              priority
              className="object-cover sepia-[0.18]"
              sizes="(max-width: 1024px) 90vw, 420px"
            />
          </div>
          <p className="mt-4 text-center text-xs font-bold uppercase tracking-[0.18em] text-terra">
            Acervo digital · Laura Perls
          </p>
        </motion.div>
      </div>
      <button
        type="button"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-widest text-primary"
        onClick={() =>
          document
            .getElementById("timeline")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        Explorar o arquivo{" "}
        <ArrowDown size={15} className="mx-auto mt-2" aria-hidden="true" />
      </button>
    </section>
  );
}
