"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useInstituteSettings,
  useFounderSettings,
  useTeamSettings,
} from "@/hooks/useSiteSettings";
import { ArrowRight, MapPin, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SectionShell from "../ui/SectionShell";

export default function InstituteSection({
  gallery = [],
}: {
  gallery?: any[];
}) {
  const { data: data } = useInstituteSettings();
  const { data: founderData } = useFounderSettings();
  const { data: teamSettings } = useTeamSettings();
  const teamMembers = teamSettings.members || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasInstitutoTag = (item: any) => {
    const tags = item?.tags;
    if (Array.isArray(tags)) {
      return tags.some((tag) =>
        String(tag).toLowerCase().includes("instituto"),
      );
    }
    if (typeof tags === "string") {
      return tags.toLowerCase().includes("instituto");
    }
    return false;
  };

  // Filter images for the slideshow (prefer 'Espaço' or 'Instituto')
  const instituteImages =
    gallery?.filter(
      (item: any) =>
        item.category === "Espaço" ||
        item.category === "Instituto" ||
        hasInstitutoTag(item),
    ) || [];

  const slides =
    instituteImages.length > 0
      ? instituteImages
      : gallery.length > 0
        ? gallery
        : [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000); // 6s per slide
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <SectionShell id="instituto-sobre" className="bg-white" container={false}>
      {/* Header */}
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in-up">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block">
            Sobre Nós
          </span>
          <h2 className="font-serif text-4xl md:text-6xl text-primary leading-tight mb-6">
            {data.title}
          </h2>
          <p className="text-lg md:text-xl text-primary/60 font-serif italic mb-8">
            {data.subtitle}
          </p>
          <p className="text-primary/70 leading-relaxed mb-10 max-w-2xl mx-auto">
            Aqui, Gestalt-terapia não é vitrine. É caminho. Um campo de estudo,
            prática e presença para quem quer cuidar e se formar com densidade
            teórica e sensibilidade clínica.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link
              href="/#clinica"
              className="bg-primary text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gold transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Conhecer a Clínica
            </Link>
            <Link
              href="/#instituto"
              className="bg-white border border-stone-200 text-primary px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors"
            >
              Ver Formações
            </Link>
            <a
              href={`https://wa.me/5569992481585`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest hover:text-green-600 transition-colors p-4"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div className="order-2 md:order-1 relative w-[85%] mx-auto">
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden relative z-10 bg-stone-100 shadow-xl">
              <AnimatePresence mode="popLayout">
                {slides.length > 0 ? (
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Image
                      src={
                        slides[currentIndex].src ||
                        slides[currentIndex].url ||
                        slides[currentIndex].image ||
                        "/assets/foto-grupo.jpg"
                      }
                      alt={
                        slides[currentIndex].title || "Instituto Figura Viva"
                      }
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                    {/* Optional gradient overlay for better text contrast if needed later */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60" />
                  </motion.div>
                ) : (
                  <Image
                    src="/assets/foto-grupo.jpg"
                    alt="Instituto Figura Viva"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                )}
              </AnimatePresence>
            </div>
            <div className="absolute top-10 -left-10 w-full h-full border-2 border-gold/30 rounded-[2rem] -z-0 hidden md:block" />
          </div>

          <div className="order-1 md:order-2 space-y-8">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary/40 mb-2 block">
                Manifesto
              </span>
              <h3 className="font-serif text-3xl text-primary mb-6">
                {data.manifesto_title}
              </h3>
              <p className="text-lg text-primary/70 leading-relaxed whitespace-pre-line">
                {data.manifesto_text}
              </p>
            </div>

            <blockquote className="border-l-4 border-gold pl-6 py-2 my-8 bg-stone-50 rounded-r-xl p-6">
              <p className="font-serif text-2xl text-primary italic mb-2">
                "{data.quote}"
              </p>
            </blockquote>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Rigor que acolhe",
                  text: "Densidade teórica sem rigidez.",
                },
                {
                  title: "Presença e awareness",
                  text: "Ampliar a percepção do aqui-agora.",
                },
                {
                  title: "Travessia decolonial",
                  text: "Compromisso ético-político situado.",
                },
                {
                  title: "Clínica como encontro",
                  text: "A relação é o nosso método.",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="bg-stone-50 p-4 rounded-xl border border-stone-100 hover:border-gold/30 transition-colors"
                >
                  <h4 className="font-bold text-primary text-sm mb-1">
                    {card.title}
                  </h4>
                  <p className="text-xs text-primary/60">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team / Curatorship */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h3 className="font-serif text-3xl text-primary mb-4">
              Fundação e Curadoria
            </h3>
            <p className="text-primary/60 max-w-2xl mx-auto">
              Uma equipe comprometida com a ética do cuidado e a contínua
              formação.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Founder */}
            <div className="group bg-white rounded-2xl p-6 border border-stone-100 hover:border-gold/30 shadow-sm hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold/20 relative">
                  <Image
                    src={founderData?.image || "/assets/lilian-vanessa.jpeg"}
                    alt={founderData?.name || "Lilian Vanessa"}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-primary text-lg">
                    {founderData?.name?.split(" ")[0] +
                      " " +
                      (founderData?.name?.split(" ")[1] || "")}
                  </h4>
                  <span className="text-xs font-bold text-gold uppercase tracking-wider">
                    Fundadora
                  </span>
                </div>
              </div>
              <p className="text-sm text-primary/70 leading-relaxed mb-4 line-clamp-3">
                {founderData?.bio ||
                  "Psicóloga, gestalt-terapeuta e pesquisadora. Mestre em Psicologia."}
              </p>
              <a
                href={founderData?.link || "http://lattes.cnpq.br/"}
                target="_blank"
                className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-gold flex items-center gap-2"
              >
                Ver Currículo Lattes <ArrowRight size={12} />
              </a>
            </div>

            {/* Dynamic Team Members */}
            {teamMembers.map((member: any) => (
              <div
                key={member.id}
                className="group bg-white rounded-2xl p-6 border border-stone-100 hover:border-gold/30 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-stone-100 bg-stone-50 relative">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 font-bold text-xl">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-lg">
                      {member.name}
                    </h4>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                      {member.role}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-primary/70 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="bg-paper rounded-[3rem] p-8 md:p-16 text-center border border-transparent">
          <h3 className="font-serif text-3xl text-primary mb-6">
            Presença local, campo aberto
          </h3>
          <p className="text-primary/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Estamos em Ouro Preto D'Oeste (RO), com o compromisso de construir
            um campo vivo de cuidado e formação. Um lugar para chegar com
            perguntas, ficar com presença e sair com mais mundo por dentro.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 text-sm text-primary/60 mb-10">
            <div className="flex items-center justify-center gap-3">
              <MapPin className="text-gold" size={20} />
              <span>{data.address || "Ouro Preto D'Oeste - RO"}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Phone className="text-gold" size={20} />
              <span>{data.phone}</span>
            </div>
          </div>

          <a
            href={`https://wa.me/5569992481585`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold hover:scale-105 transition-all shadow-xl"
          >
            Agendar Conversa
          </a>
        </div>
      </div>
    </SectionShell>
  );
}
