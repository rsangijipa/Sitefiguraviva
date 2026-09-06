"use client";

import { ArrowRight, Instagram, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useInstituteSettings } from "@/hooks/useSiteSettings";
import { PUBLIC_NAV_ITEMS } from "@/features/public-site/content/navigation";

export default function Footer() {
  const { data } = useInstituteSettings();
  const address = data.address || "Ouro Preto D'Oeste, Rondônia";
  const phone = data.phone ? String(data.phone).replace(/\D/g, "") : "";

  return (
    <footer className="relative overflow-hidden bg-[#3e332c] px-6 pb-8 pt-16 text-paper md:pt-20">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="container relative z-10 mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-paper/10 pb-12 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr]">
          <div>
            <p className="font-serif text-4xl text-paper">
              Figura <span className="italic text-gold">Viva</span>
            </p>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-paper/65">
              {data.quote ||
                "Presença, encontro e formação em Gestalt-terapia."}
            </p>
            <a
              href="https://www.instagram.com/institutofiguraviva/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 items-center gap-3 text-sm text-paper/70 transition hover:text-gold"
            >
              <Instagram size={18} /> Instagram
            </a>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
              Explorar
            </h2>
            <ul className="mt-5 space-y-1">
              {PUBLIC_NAV_ITEMS.slice(2).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-11 items-center text-sm text-paper/65 transition hover:text-paper"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
              Institucional
            </h2>
            <ul className="mt-5 space-y-1">
              <li>
                <Link
                  href="/instituto"
                  className="flex min-h-11 items-center text-sm text-paper/65 transition hover:text-paper"
                >
                  Sobre o Instituto
                </Link>
              </li>
              <li>
                <Link
                  href="/instituto/fundadora"
                  className="flex min-h-11 items-center text-sm text-paper/65 transition hover:text-paper"
                >
                  Fundadora
                </Link>
              </li>
              <li>
                <Link
                  href="/portal"
                  className="flex min-h-11 items-center text-sm text-paper/65 transition hover:text-paper"
                >
                  Portal do Aluno
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="flex min-h-11 items-center text-sm text-paper/65 transition hover:text-paper"
                >
                  Clínica
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
              Contato
            </h2>
            <div className="mt-5 space-y-4 text-sm text-paper/65">
              <a
                href="mailto:contato@figuraviva.com.br"
                className="flex items-start gap-3 transition hover:text-paper"
              >
                <Mail size={17} className="mt-0.5 shrink-0 text-gold" />{" "}
                contato@figuraviva.com.br
              </a>
              {phone && (
                <a
                  href={`https://wa.me/55${phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 transition hover:text-paper"
                >
                  <Phone size={17} className="mt-0.5 shrink-0 text-gold" />{" "}
                  {data.phone}
                </a>
              )}
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 transition hover:text-paper"
              >
                <MapPin size={17} className="mt-0.5 shrink-0 text-gold" />{" "}
                <span>{address}</span>
                <ArrowRight size={15} className="mt-0.5 shrink-0" />
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-paper/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Instituto Figura Viva</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/privacidade"
              className="min-h-11 inline-flex items-center hover:text-paper"
            >
              Privacidade
            </Link>
            <Link
              href="/termos"
              className="min-h-11 inline-flex items-center hover:text-paper"
            >
              Termos
            </Link>
            <span className="inline-flex min-h-11 items-center">
              Diversidade
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
