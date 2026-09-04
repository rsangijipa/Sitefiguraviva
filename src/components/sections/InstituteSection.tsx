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
import { getImageSrc } from "@/lib/imageUtils";

export default function InstituteSection({
  gallery = [],
  initialData,
  initialFounderData,
  initialTeamData,
}: {
  gallery?: any[];
  initialData?: any;
  initialFounderData?: any;
  initialTeamData?: any;
}) {
  const { data: data } = useInstituteSettings(initialData);
  const { data: founderData } = useFounderSettings(initialFounderData);
  const { data: teamSettings } = useTeamSettings(initialTeamData);
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
    <SectionShell
      id="instituto-sobre"
      className="fv-bg fv-bg-manifesto bg-paper"
      container={false}
    >
      {/* Header */}
      <div className="fv-container relative z-10 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in-up">
          <span className="fv-eyebrow mb-4">
            Sobre Nós
          </span>
          <h2 className="font-serif text-4xl md:text-6xl text-primary leading-tight mb-6">
            {data.title}
          </h2>
          <p className="mb-8 font-serif text-lg italic text-text/80 md:text-xl">
            {data.subtitle}
          </p>
          <p className="fv-lead mx-auto mb-10">
            Aqui, Gestalt-terapia não é vitrine. É caminho. Um campo de estudo,
            prática e presença para quem quer cuidar e se formar com densidade
            teórica e sensibilidade clínica.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link
              href="/#clinica"
              className="rounded-md bg-primary px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary-dark"
            >
              Conhecer a Clínica
            </Link>
            <Link
              href="/#instituto"
              className="rounded-md border border-border bg-paper px-8 py-4 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:border-igarape hover:bg-areia"
            >
              Ver Formações
            </Link>
            <a
              href={`https://wa.me/5569992481585`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-4 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:text-igarape"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div className="order-2 md:order-1 relative w-[85%] mx-auto">
            <div className="relative z-10 aspect-[4/5] overflow-hidden rounded-md bg-areia">
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
                      src={getImageSrc(
                        slides[currentIndex]?.src ||
                          slides[currentIndex]?.url ||
                          slides[currentIndex]?.image,
                        "/assets/foto-grupo.jpg",
                      )}
                      alt={
                        slides[currentIndex]?.title || "Instituto Figura Viva"
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
            <div
              className="absolute -left-10 top-10 -z-0 hidden h-full w-full rounded-md border border-terra/40 md:block"
              aria-hidden
            />
          </div>

          <div className="order-1 md:order-2 space-y-8">
            <div>
              <span className="fv-eyebrow mb-2">
                Manifesto
              </span>
              <h3 className="mb-6 font-serif text-3xl text-paper md:text-4xl">
                {data.manifesto_title}
              </h3>
              <p className="whitespace-pre-line text-lg leading-relaxed text-text/80">
                {data.manifesto_text}
              </p>
            </div>

            <blockquote className="my-8 border-l-2 border-terra bg-areia p-6 pl-6">
              <p className="mb-2 font-serif text-2xl italic text-primary">
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
                  className="rounded-md border border-border bg-areia p-4 transition-colors hover:border-igarape"
                >
                  <h4 className="font-bold text-primary text-sm mb-1">
                    {card.title}
                  </h4>
                  <p className="text-xs text-text/75">{card.text}</p>
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
            <p className="fv-lead mx-auto text-center">
              Uma equipe comprometida com a ética do cuidado e a contínua
              formação.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Founder */}
            <div className="fv-card group p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border border-terra/40">
                  <Image
                    src={getImageSrc(
                      founderData?.image,
                      "/assets/lilian-vanessa.jpeg",
                    )}
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
                  <span className="text-xs font-bold uppercase tracking-wider text-terra">
                    Fundadora
                  </span>
                </div>
              </div>
              <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-text/75">
                {founderData?.bio ||
                  "Psicóloga, gestalt-terapeuta e pesquisadora. Mestre em Psicologia."}
              </p>
              <a
                href={founderData?.link || "http://lattes.cnpq.br/"}
                target="_blank"
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary underline-offset-4 hover:underline"
              >
                Ver Currículo Lattes <ArrowRight size={12} />
              </a>
            </div>

            {/* Dynamic Team Members */}
            {teamMembers.map((member: any) => (
              <div
                key={member.id}
                className="fv-card group p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full border border-border bg-areia">
                    {member.image ? (
                      <Image
                        src={getImageSrc(
                          member.image,
                          "/assets/lilian-vanessa.jpeg",
                        )}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-bold text-muted">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-lg">
                      {member.name}
                    </h4>
                    <span className="text-xs font-bold uppercase tracking-wider text-terra">
                      {member.role}
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-text/75">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="fv-bg fv-bg-cta rounded-md bg-primary-solid p-8 text-center text-paper md:p-16">
          <h3 className="mb-6 font-serif text-3xl text-paper md:text-4xl">
            Presença local, campo aberto
          </h3>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-paper/80">
            Estamos em Ouro Preto D'Oeste (RO), com o compromisso de construir
            um campo vivo de cuidado e formação. Um lugar para chegar com
            perguntas, ficar com presença e sair com mais mundo por dentro.
          </p>

          <div className="mb-10 flex flex-col justify-center gap-8 text-sm text-paper/80 md:flex-row md:gap-16">
            <div className="flex items-center justify-center gap-3">
              <MapPin className="text-gold-light" size={20} aria-hidden />
              <span>{data.address || "Ouro Preto D'Oeste - RO"}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Phone className="text-gold-light" size={20} aria-hidden />
              <span>{data.phone}</span>
            </div>
          </div>

          <a
            href={`https://wa.me/5569992481585`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-md bg-paper px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:bg-gold-light"
          >
            Agendar Conversa
          </a>
        </div>
      </div>
    </SectionShell>
  );
}
