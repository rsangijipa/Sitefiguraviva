"use client";

import { Instagram, Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useInstituteSettings } from "@/hooks/useSiteSettings";

export default function Footer() {
  const { data } = useInstituteSettings();
  const mapsHref = `https://maps.google.com/?q=${encodeURIComponent(data.address || "Instituto Figura Viva")}`;

  return (
    <footer className="bg-[#4a3b32] text-[#F8F1E5] pt-16 pb-10 md:pt-24 md:pb-12 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] translate-y-1/4 translate-x-1/4" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-12 gap-10 md:gap-20 mb-12 md:mb-16 pb-12 border-b border-paper/10">
          <div className="md:col-span-4 lg:col-span-5">
            <h3 className="font-serif text-5xl mb-8">
              Figura <span className="font-light text-gold italic">Viva</span>
            </h3>
            <p className="text-paper/60 font-light text-lg leading-relaxed max-w-sm mb-10">
              {data.quote ||
                "Habitando a fronteira do encontro, cultivando awareness e transformando vidas através da Gestalt-Terapia."}
            </p>
            <div className="flex items-center gap-4 mb-6">
              <a
                href="https://www.instagram.com/institutofiguraviva/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-paper/10 flex items-center justify-center hover:bg-paper hover:text-primary transition-soft group"
              >
                <Instagram
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
              </a>
            </div>

            <div className="space-y-3 text-sm text-paper/70">
              <a
                href="mailto:contato@figuraviva.com.br"
                className="inline-flex items-center gap-2 hover:text-gold transition-colors"
              >
                <Mail size={16} className="text-gold" />{" "}
                contato@figuraviva.com.br
              </a>
              {data.phone && (
                <a
                  href={`https://wa.me/55${String(data.phone).replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-gold transition-colors"
                >
                  <Phone size={16} className="text-gold" /> {data.phone}
                </a>
              )}
            </div>
          </div>

          <div className="md:col-span-3 lg:col-span-2">
            <h4 className="font-sans font-bold uppercase tracking-[0.3em] text-[10px] mb-10 text-gold">
              Explorar
            </h4>
            <ul className="space-y-6 font-light text-sm text-paper/70">
              <li>
                <a
                  href="#instituto"
                  className="hover:text-gold transition-soft py-2 block min-h-[44px] flex items-center"
                >
                  Formações
                </a>
              </li>
              <li>
                <a
                  href="#clinica"
                  className="hover:text-gold transition-soft py-2 block min-h-[44px] flex items-center"
                >
                  Clínica
                </a>
              </li>
              <li>
                <a
                  href="/portal"
                  className="hover:text-gold transition-soft py-2 block min-h-[44px] flex items-center"
                >
                  Portal do Aluno
                </a>
              </li>
              <li>
                <a
                  href="/public-library"
                  className="hover:text-gold transition-soft py-2 block min-h-[44px] flex items-center"
                >
                  Biblioteca
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-5">
            <h4 className="font-sans font-bold uppercase tracking-[0.3em] text-[10px] mb-10 text-gold">
              Localização
            </h4>
            <div className="bg-white/5 border border-paper/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <MapPin size={18} className="text-gold shrink-0 mt-1" />
                <p className="font-light text-sm text-paper/70 leading-relaxed whitespace-pre-line">
                  {data.address ||
                    "Rua Santos Dumont, 156 - Ouro Preto D'Oeste - RO"}
                </p>
              </div>

              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-white border border-transparent px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all text-xs font-bold uppercase tracking-widest"
              >
                Traçar Rota <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-paper/30 font-bold tracking-[0.2em] uppercase">
          <p>
            &copy; {new Date().getFullYear()} Instituto Figura Viva • Todos os
            direitos reservados
          </p>
          <div className="flex gap-10">
            <Link
              href="/?modal=privacy"
              className="hover:text-paper transition-soft min-h-[44px] flex items-center"
            >
              Privacidade
            </Link>
            <Link
              href="/?modal=terms"
              className="hover:text-paper transition-soft min-h-[44px] flex items-center"
            >
              Termos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
