import { BookOpen } from "lucide-react";
import { lauraPerlsContent } from "@/content/laura-perls";

export function LauraReadings() {
  return (
    <section className="bg-[#F1E9DB] py-7 md:py-9">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#96551F]">Referências</p>
            <h3 className="mt-1 font-serif text-3xl text-[#005A1F]">Fontes & Leituras Sugeridas</h3>
          </div>
          <BookOpen className="shrink-0 text-[#96551F]" aria-hidden="true" />
        </div>
        <ol className="grid gap-3 md:grid-cols-2">
          {lauraPerlsContent.readings.map((reading, index) => (
            <li key={reading.title} className="border border-[#005A1F]/15 bg-[#FDFAF4] p-4">
              <p className="text-[10px] font-bold tracking-widest text-[#96551F]">{String(index + 1).padStart(2, "0")} · {reading.year}</p>
              <h4 className="mt-1 font-serif text-lg text-[#005A1F]">{reading.title}</h4>
              <p className="mt-1 text-sm font-medium text-[#4B4B49]">{reading.author}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#4B4B49]">{reading.note}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
