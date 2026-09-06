import { ArrowUpRight, MessageCircle } from "lucide-react";

export const CONSULTATION_WHATSAPP_URL =
  "https://wa.me/5569992481585?text=Olá!%20Gostaria%20de%20conhecer%20as%20formações%20do%20Instituto%20Figura%20Viva.";

export function ConsultationCta() {
  return (
    <section className="fv-bg fv-bg-cta bg-primary-solid py-20 text-paper md:py-28">
      <div className="fv-container grid items-end gap-10 lg:grid-cols-[1fr_auto]">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gold-light">
            Uma conversa pode ser o começo
          </p>
          <h2 className="text-balance font-serif text-4xl leading-tight md:text-6xl">
            Encontre a formação que conversa com o seu momento.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-paper/70">
            Nossa equipe acolhe suas dúvidas sobre percursos, calendário e formas de participação.
          </p>
        </div>
        <a
          href={CONSULTATION_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-gold-light px-7 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark transition-colors hover:bg-paper"
        >
          <MessageCircle size={18} aria-hidden="true" />
          Falar com a equipe
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
