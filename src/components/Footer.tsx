"use client";

import { PUBLIC_CONTACT_EMAIL } from "@/features/public-site/content/contact";
import { usePublicContact } from "@/features/public-site/components/PublicContactProvider";
import { Instagram, Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import CookiePreferencesButton from "@/components/system/CookiePreferencesButton";
import Link from "next/link";
import { PUBLIC_NAV_ITEMS } from "@/features/public-site/content/navigation";

const explorar = PUBLIC_NAV_ITEMS.filter((item) => item.label !== "Instituto");

const institucional = [
  { label: "Instituto", href: "/instituto" },
  { label: "Fundadora", href: "/instituto/fundadora" },
  { label: "Manifesto", href: "/instituto/manifesto" },
];

export default function Footer() {
  const { address, whatsappNumber: phone } = usePublicContact();
  const mapsHref = `https://maps.google.com/?q=${encodeURIComponent(address)}`;

  return (
    <footer className="fv-bg fv-bg-footer relative overflow-hidden bg-primary-solid py-4 text-paper md:py-5">
      <div className="fv-container relative z-10">
        <div className="grid gap-x-6 gap-y-4 border-b border-paper/15 pb-3 md:grid-cols-12 lg:gap-x-8">
          <div className="min-w-0 md:col-span-4 lg:col-span-3">
            <div className="mb-1 flex items-center justify-between gap-3 md:justify-start">
              <h3 className="font-serif text-2xl">
                Figura <span className="font-light text-gold italic">Viva</span>
              </h3>
              <a
                href="https://www.instagram.com/institutofiguraviva/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram do Instituto Figura Viva"
                className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-paper/25 transition-soft hover:bg-paper hover:text-primary"
              >
                <Instagram
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
              </a>
            </div>
            <p className="max-w-sm text-sm leading-snug text-paper/70">
              Habitando a fronteira do encontro, cultivando awareness e
              transformando vidas através da Gestalt-Terapia.
            </p>
          </div>

          <nav
            aria-label="Explorar o site"
            className="min-w-0 md:col-span-5 lg:col-span-4"
          >
            <h4 className="mb-1 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gold-light">
              Explorar
            </h4>
            <ul className="grid grid-cols-2 gap-x-3 text-sm text-paper/75">
              {explorar.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-8 items-center py-1 transition-soft hover:text-gold-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-label="Informações institucionais"
            className="min-w-0 md:col-span-3 lg:col-span-2"
          >
            <h4 className="mb-1 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gold-light">
              Institucional
            </h4>
            <ul className="flex flex-wrap gap-x-5 text-sm text-paper/75 md:block">
              {institucional.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-8 items-center py-1 transition-soft hover:text-gold-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 md:col-span-12 lg:col-span-3">
            <h4 className="mb-1 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gold-light">
              Contato
            </h4>
            <div className="grid items-start gap-x-6 gap-y-1 text-sm text-paper/75 sm:grid-cols-2 lg:grid-cols-1">
              <p className="flex items-start gap-2 whitespace-pre-line leading-snug sm:row-span-2 lg:row-span-1">
                <MapPin size={16} className="mt-1 shrink-0 text-gold-light" />
                <span className="min-w-0 break-words">{address}</span>
              </p>
              <a
                href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
                className="flex min-h-8 items-center gap-2 transition-soft hover:text-gold-light"
              >
                <Mail size={16} className="shrink-0 text-gold-light" />
                <span className="min-w-0 break-all">
                  {PUBLIC_CONTACT_EMAIL}
                </span>
              </a>
              {phone && (
                <a
                  href={`https://wa.me/${phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-8 items-center gap-2 transition-soft hover:text-gold-light"
                >
                  <Phone size={16} className="shrink-0 text-gold-light" />
                  WhatsApp do Instituto
                </a>
              )}
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-8 w-fit items-center gap-2 rounded-md border border-paper/25 px-3 py-1 text-xs font-bold uppercase tracking-wider transition-soft hover:border-paper hover:bg-paper hover:text-primary"
              >
                Traçar Rota <ArrowRight size={14} aria-hidden />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-x-6 gap-y-1 pt-2 text-xs text-paper/70 md:flex-row md:items-center md:justify-between">
          <p className="leading-relaxed">
            &copy; {new Date().getFullYear()} Instituto Figura Viva &bull; Todos
            os direitos reservados
          </p>
          <nav
            aria-label="Informações legais"
            className="flex flex-wrap items-center gap-x-4"
          >
            <Link
              href="/privacidade"
              className="flex min-h-8 items-center transition-soft hover:text-gold-light"
            >
              Privacidade
            </Link>
            <Link
              href="/termos"
              className="flex min-h-8 items-center transition-soft hover:text-gold-light"
            >
              Termos
            </Link>
            <CookiePreferencesButton />
          </nav>
        </div>
      </div>
    </footer>
  );
}
