"use client";

import { Instagram, Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import CookiePreferencesButton from "@/components/system/CookiePreferencesButton";
import Link from "next/link";
import { useInstituteSettings } from "@/hooks/useSiteSettings";
import { PUBLIC_NAV_ITEMS } from "@/features/public-site/content/navigation";

const explorar = PUBLIC_NAV_ITEMS.filter((item) => item.label !== "Instituto");

const institucional = [
  { label: "Instituto", href: "/instituto" },
  { label: "Fundadora", href: "/instituto/fundadora" },
  { label: "Manifesto", href: "/instituto/manifesto" },
  { label: "Privacidade", href: "/privacidade" },
  { label: "Termos", href: "/termos" },
];

export default function Footer() {
  const { data } = useInstituteSettings();
  const mapsHref = `https://maps.google.com/?q=${encodeURIComponent(data.address || "Instituto Figura Viva")}`;

  return (
    <footer className="fv-bg fv-bg-footer relative overflow-hidden bg-primary-solid pb-10 pt-16 text-paper md:pb-12 md:pt-24">
      <div className="fv-container relative z-10">
        <div className="mb-12 grid gap-10 border-b border-paper/15 pb-12 md:mb-16 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5 lg:col-span-5">
            <h3 className="mb-8 font-serif text-4xl md:text-5xl">
              Figura <span className="font-light text-gold italic">Viva</span>
            </h3>
            <p className="mb-10 max-w-sm text-lg leading-relaxed text-paper/70">
              {data.quote ||
                "Habitando a fronteira do encontro, cultivando awareness e transformando vidas através da Gestalt-Terapia."}
            </p>
            <div className="flex items-center gap-4 mb-6">
              <a
                href="https://www.instagram.com/institutofiguraviva/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-paper/25 transition-soft hover:bg-paper hover:text-primary"
              >
                <Instagram
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
              </a>
            </div>

          </div>

          <nav
            aria-label="Explorar o site"
            className="md:col-span-3 lg:col-span-2"
          >
            <h4 className="mb-8 font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-gold-light">
              Explorar
            </h4>
            <ul className="space-y-2 text-sm text-paper/75">
              {explorar.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-[44px] items-center py-1 transition-soft hover:text-gold-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-label="Informações institucionais"
            className="md:col-span-4 lg:col-span-2"
          >
            <h4 className="mb-8 font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-gold-light">
              Institucional
            </h4>
            <ul className="space-y-2 text-sm text-paper/75">
              {institucional.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-[44px] items-center py-1 transition-soft hover:text-gold-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="flex min-h-[44px] items-center">
                <CookiePreferencesButton />
              </li>
            </ul>
          </nav>

          <div className="md:col-span-12 lg:col-span-3">
            <h4 className="mb-8 font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-gold-light">
              Contato
            </h4>
            <div className="space-y-4 text-sm text-paper/75">
              <p className="flex items-start gap-3 whitespace-pre-line leading-relaxed">
                <MapPin size={16} className="mt-1 shrink-0 text-gold-light" />
                {data.address ||
                  "Rua Santos Dumont, 156 - Ouro Preto D'Oeste - RO"}
              </p>
              <a
                href="mailto:contato@figuraviva.com.br"
                className="flex items-center gap-3 transition-soft hover:text-gold-light"
              >
                <Mail size={16} className="shrink-0 text-gold-light" />
                contato@figuraviva.com.br
              </a>
              {data.phone && (
                <a
                  href={`https://wa.me/55${String(data.phone).replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 transition-soft hover:text-gold-light"
                >
                  <Phone size={16} className="shrink-0 text-gold-light" />
                  {data.phone}
                </a>
              )}
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-paper/25 px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-soft hover:border-paper hover:bg-paper hover:text-primary"
              >
                Traçar Rota <ArrowRight size={14} aria-hidden />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/45 md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Instituto Figura Viva &bull; Todos
            os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}
