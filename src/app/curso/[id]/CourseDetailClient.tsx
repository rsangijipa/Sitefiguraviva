"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  ExternalLink,
  X,
  Pointer,
  Clock,
} from "lucide-react";
import { getMediatorDetails } from "@/utils/mediators";
import { getImageSrc } from "@/lib/imageUtils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MediatorDialog from "@/components/MediatorDialog";
import { usePublicContact } from "@/features/public-site/components/PublicContactProvider";

export default function CourseDetailClient({ course }: { course: any }) {
  const config = usePublicContact();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Derive Mediator State from URL
  const mediatorParam = searchParams.get("mediator");
  let selectedMediator: any = null;

  if (mediatorParam && course) {
    if (course.mediators && Array.isArray(course.mediators)) {
      const foundInCourse = course.mediators.find((m: any) => {
        if (typeof m === "string") return m === mediatorParam;
        return m?.name === mediatorParam;
      });
      if (foundInCourse) {
        selectedMediator = getMediatorDetails(foundInCourse);
      }
    }
  }

  const closeMediator = () => {
    const current = new URLSearchParams(searchParams.toString());
    current.delete("mediator");
    window.history.replaceState(
      null,
      "",
      `${pathname}${current.size ? `?${current.toString()}` : ""}${window.location.hash}`,
    );
  };

  const getCoverImage = () => {
    if (!course) return "";
    if (course.images && course.images.length > 0)
      return getImageSrc(course.images[0]);
    return getImageSrc(course.image);
  };

  const getGalleryImages = () => {
    if (!course || !course.images || course.images.length <= 1) return [];
    return course.images.slice(1);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const galleryImages = getGalleryImages();
  const allImages = (
    course.images && course.images.length > 0 ? course.images : [course.image]
  ).map((image: string) => getImageSrc(image));

  return (
    <div className="bg-paper min-h-screen">
      <Navbar />
      <div className="pt-32 pb-20 md:pt-40 outline-none">
        <div className="container mx-auto px-6 max-w-6xl relative">
          <button
            onClick={() => router.push("/curso")}
            className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary/20 bg-paper px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:border-gold hover:bg-areia focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold md:mb-12 md:px-4"
            aria-label="Voltar para Formações"
          >
            <ArrowLeft size={16} /> Voltar para Formações
          </button>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start mb-12 md:mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <span className="bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
                {course.enrollmentOpen
                  ? "Matrículas Abertas"
                  : "Inscrições encerradas"}
              </span>

              <div>
                <h1 className="font-serif text-4xl md:text-6xl text-primary leading-tight mb-4">
                  {course.title}
                </h1>
                {course.subtitle && (
                  <p className="text-xl md:text-2xl font-serif italic text-gold/80 leading-snug">
                    {course.subtitle}
                  </p>
                )}
              </div>

              {course.mediators &&
                Array.isArray(course.mediators) &&
                course.mediators.length > 0 && (
                  <div className="border-l-4 border-accent/20 pl-6 py-2">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-accent mb-3">
                      Mediadoras
                    </h2>
                    <p className="mb-4 text-sm text-primary/70">
                      Toque no nome para ver a foto e o currículo.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {course.mediators.map((mediator: any, index: number) => {
                        const details = getMediatorDetails(mediator);
                        if (!details) return null;
                        const avatarSrc = getImageSrc(details.image, "");
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              const name =
                                typeof mediator === "string"
                                  ? mediator
                                  : mediator.name;
                              const current = new URLSearchParams(
                                Array.from(searchParams.entries()),
                              );
                              current.set("mediator", name);
                              window.history.pushState(
                                null,
                                "",
                                `${pathname}?${current.toString()}${window.location.hash}`,
                              );
                            }}
                            aria-haspopup="dialog"
                            aria-label={`Ver currículo de ${details.name}`}
                            className="flex min-h-12 max-w-full items-center gap-3 bg-white p-2 pr-4 rounded-2xl shadow-sm transition-colors border border-primary/20 hover:border-gold group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                          >
                            <div className="w-10 h-10 rounded-full bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                              {avatarSrc ? (
                                <img
                                  src={avatarSrc}
                                  alt={details.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs font-bold">
                                  {details.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <span className="text-left text-sm font-bold text-primary group-hover:text-gold transition-colors">
                              {details.name}
                            </span>
                            <Pointer
                              size={18}
                              className="shrink-0 text-gold"
                              aria-hidden="true"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              <div className="space-y-4 rounded-2xl border border-primary/15 bg-white p-5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-primary/70">
                  Informações do curso
                </h2>
                <dl className="grid gap-4 sm:grid-cols-2">
                  {course.date && (
                    <div>
                      <dt className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Calendar size={17} className="text-gold" /> Período
                      </dt>
                      <dd className="mt-1 text-base text-primary/75">
                        {course.date}
                      </dd>
                    </div>
                  )}
                  {course.durationLabel &&
                    course.durationLabel !== course.date && (
                      <div>
                        <dt className="flex items-center gap-2 text-sm font-semibold text-primary">
                          <Clock size={17} className="text-gold" /> Duração
                        </dt>
                        <dd className="mt-1 text-base text-primary/75">
                          {course.durationLabel}
                        </dd>
                      </div>
                    )}
                  {course.details?.location && (
                    <div>
                      <dt className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <MapPin size={17} className="text-gold" /> Local /
                        modalidade
                      </dt>
                      <dd className="mt-1 text-base text-primary/75">
                        {course.details.location}
                      </dd>
                    </div>
                  )}
                </dl>
                {course.tags && Array.isArray(course.tags) && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {(Array.isArray(course.tags)
                      ? course.tags
                      : typeof course.tags === "string"
                        ? course.tags.split(",")
                        : []
                    ).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white border border-gray-100 rounded text-[10px] uppercase font-bold text-gray-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {(course.totalPriceCents != null || course.pixPriceCents > 0) && (
                <section className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
                  <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary/70">
                    Investimento
                  </h2>
                  {course.totalPriceCents != null && (
                    <div className="mb-3">
                      <p className="text-sm text-primary/70">
                        Valor integral do curso
                      </p>
                      <p className="font-serif text-3xl text-primary">
                        {course.totalPriceCents === 0
                          ? "Gratuito"
                          : (course.totalPriceCents / 100).toLocaleString(
                              "pt-BR",
                              { style: "currency", currency: "BRL" },
                            )}
                      </p>
                    </div>
                  )}
                  {course.installments > 1 && (
                    <p className="mb-3 text-sm leading-relaxed text-primary/75">
                      Até {course.installments} parcelas. Confirme as condições
                      com o instituto.
                    </p>
                  )}
                  {course.pixPriceCents > 0 && (
                    <div className="border-t border-primary/15 pt-3">
                      <p className="text-sm font-semibold text-primary">
                        Pix na inscrição:{" "}
                        {(course.pixPriceCents / 100).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-primary/70">
                        Corresponde à matrícula ou à primeira parcela. As
                        parcelas seguintes são combinadas com o instituto.
                      </p>
                    </div>
                  )}
                </section>
              )}
              {course.enrollmentOpen ? (
                <button
                  onClick={() =>
                    router.push(`/inscricao/${encodeURIComponent(course.id)}`)
                  }
                  className="w-full md:w-auto px-8 py-4 bg-primary text-paper rounded-xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-gold hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3"
                >
                  Fazer Inscrição <ExternalLink size={14} />
                </button>
              ) : (
                <p
                  role="status"
                  className="rounded-xl border border-primary/15 bg-white p-4 text-sm leading-relaxed text-primary/75"
                >
                  Novas inscrições estão encerradas. Alunos matriculados podem
                  acompanhar sua inscrição e acessar o portal.
                </p>
              )}
            </motion.div>

            <motion.button
              type="button"
              aria-label="Ampliar capa do curso"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative cursor-pointer group w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-[3rem]"
              onClick={() => openLightbox(0)}
            >
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border-8 border-white bg-white">
                <img
                  src={getCoverImage()}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </motion.button>
          </div>

          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-8 space-y-16">
              <section>
                <h2 className="font-serif text-3xl text-primary mb-6">
                  O que você vai vivenciar
                </h2>
                <p className="text-lg text-primary/70 font-light leading-relaxed whitespace-pre-line">
                  {course.details?.intro || course.description}
                </p>
              </section>

              {course.details?.format && (
                <section className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm">
                  <h2 className="font-serif text-2xl text-primary mb-6">
                    Como funciona
                  </h2>
                  <div className="text-primary/70 leading-relaxed space-y-4">
                    {Array.isArray(course.details.format) ? (
                      <ul className="space-y-4">
                        {course.details.format.map(
                          (item: string, i: number) => (
                            <li key={i} className="flex items-start gap-4">
                              <span className="w-1.5 h-1.5 mt-2.5 rounded-full bg-accent shrink-0" />
                              <span>{item}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    ) : (
                      <p className="whitespace-pre-line">
                        {course.details.format}
                      </p>
                    )}
                  </div>
                </section>
              )}

              {Array.isArray((course as any).syllabus) &&
                (course as any).syllabus.length > 0 && (
                  <section className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm">
                    <h2 className="font-serif text-2xl text-primary mb-6">
                      Ementa
                    </h2>
                    <ul className="space-y-4">
                      {(course as any).syllabus.map(
                        (topic: string, i: number) => (
                          <li key={i} className="flex items-start gap-4">
                            <span className="w-1.5 h-1.5 mt-2.5 rounded-full bg-accent shrink-0" />
                            <span className="text-primary/70 leading-relaxed">
                              {topic}
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  </section>
                )}
            </div>

            <div className="md:col-span-4 space-y-8">
              {(course as any).frequency && (
                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-xs uppercase tracking-wider">
                      Frequência
                    </h4>
                    <p className="text-sm text-primary/70">
                      {(course as any).frequency}
                    </p>
                  </div>
                </div>
              )}
              {course.details?.schedule && (
                <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 sticky top-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary text-sm uppercase tracking-wider">
                        Cronograma
                      </h4>
                      {Array.isArray(course.details.schedule) && (
                        <p className="text-xs text-primary/50">
                          {course.details.schedule.length} Encontros
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3 mb-8">
                    {Array.isArray(course.details.schedule) ? (
                      <div className="grid grid-cols-2 gap-3">
                        {course.details.schedule.map(
                          (date: string, i: number) => (
                            <div
                              key={i}
                              className="bg-white px-3 py-2 rounded border border-stone-100 text-center"
                            >
                              <span className="text-sm font-bold text-primary/80">
                                {date}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-primary/70 whitespace-pre-line">
                        {course.details.schedule}
                      </p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-primary/50 mb-4">
                      Tem alguma dúvida?
                    </p>
                    <a
                      href={`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(config.whatsappMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 border border-green-200 bg-green-50 text-green-700 font-bold uppercase tracking-widest text-[10px] rounded-lg hover:bg-green-100 transition-colors"
                    >
                      Falar no WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
              aria-label="Fechar galeria"
            >
              <X size={32} />
            </button>
            <div className="max-w-5xl max-h-screen">
              <img
                src={allImages[lightboxIndex]}
                alt={`Imagem ${lightboxIndex + 1} da galeria do curso`}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MediatorDialog mediator={selectedMediator} onClose={closeMediator} />
    </div>
  );
}
