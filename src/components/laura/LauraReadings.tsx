import { BookOpen } from "lucide-react";
import { lauraPerlsContent } from "@/content/laura-perls";

export function LauraReadings() {
  return (
    <section className="bg-[#F1E9DB]/60 py-12 md:py-16 border-t border-[#D8CFBE]">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#96551F]">
              Referências
            </p>
            <h3 className="mt-1 font-serif text-3xl md:text-4xl font-bold text-[#005A1F]">
              Fontes & Leituras Sugeridas
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#005A1F]/10 border border-[#005A1F]/20 flex items-center justify-center shrink-0">
            <BookOpen className="text-[#005A1F]" size={18} aria-hidden="true" />
          </div>
        </div>
        <ol className="grid gap-4 md:grid-cols-2">
          {lauraPerlsContent.readings.map((reading, index) => (
            <li
              key={reading.title}
              className="rounded-2xl border border-[#D8CFBE] bg-white p-5 shadow-xs transition-all hover:border-[#005A1F]/40"
            >
              <p className="text-[10px] font-bold tracking-widest text-[#96551F]">
                {String(index + 1).padStart(2, "0")} · {reading.year}
              </p>
              <h4 className="mt-1 font-serif text-lg font-bold text-[#005A1F]">
                {reading.title}
              </h4>
              <p className="mt-1 text-xs font-semibold text-[#262B22]">
                {reading.author}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#6B6B63] font-serif italic">
                {reading.note}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
