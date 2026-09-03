import Link from "next/link";
import { Calendar, FileText, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LEGAL_ROUTES, type LegalDocumentContent } from "@/lib/legal";

interface LegalDocumentProps {
  doc: LegalDocumentContent;
  type: "privacy" | "terms";
}

export default function LegalDocument({ doc, type }: LegalDocumentProps) {
  const Icon = type === "privacy" ? ShieldCheck : FileText;
  const other =
    type === "privacy"
      ? { href: LEGAL_ROUTES.terms, label: "Termos de Uso" }
      : { href: LEGAL_ROUTES.privacy, label: "Política de Privacidade" };

  return (
    <main className="min-h-screen bg-paper">
      <Navbar />

      <article className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <header className="border-b border-stone-200 pb-8 mb-12">
          <div className="w-14 h-14 rounded-2xl bg-white border border-stone-100 shadow-sm flex items-center justify-center text-gold mb-6">
            <Icon size={26} aria-hidden="true" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-primary font-bold mb-4 text-balance">
            {doc.title}
          </h1>
          <p className="flex items-center gap-2 text-[11px] uppercase font-bold tracking-widest text-primary/40">
            <Calendar size={12} aria-hidden="true" />
            <span>Atualizado em {doc.lastUpdated}</span>
          </p>
        </header>

        <div className="space-y-10">
          {doc.content.map((section) => (
            <section key={section.heading}>
              <h2 className="font-serif text-xl text-primary font-bold mb-3">
                {section.heading}
              </h2>
              <p className="text-primary/70 leading-relaxed font-light">
                {section.text}
              </p>
            </section>
          ))}
        </div>

        <footer className="mt-16 pt-8 border-t border-stone-200 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <p className="text-xs text-primary/40 italic">
            Instituto Figura Viva — Todos os direitos reservados.
          </p>
          <Link
            href={other.href}
            className="text-xs font-bold uppercase tracking-widest text-primary hover:text-gold transition-colors min-h-[44px] flex items-center"
          >
            Ler também: {other.label}
          </Link>
        </footer>
      </article>

      <Footer />
    </main>
  );
}
