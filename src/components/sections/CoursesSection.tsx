"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "../ui/Skeleton";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Calendar } from "lucide-react";
import { getImageSrc } from "@/lib/imageUtils";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
} as const;

interface Course {
  id: string | number;
  title: string;
  subtitle?: string;
  date: string;
  status: string;
  image?: string;
  images?: string[];
  description?: string;
  details?: { intro: string };
  category?: string;
  slug?: string;
}

interface CoursesSectionProps {
  courses: Course[];
  onOpenCalendar: () => void;
  onSelectCourse: (course: Course) => void;
  loading?: boolean;
}

import SectionShell from "../ui/SectionShell";

export default function CoursesSection({
  courses = [],
  onOpenCalendar,
  onSelectCourse,
  loading = false,
}: CoursesSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <SectionShell id="instituto" className="fv-bg fv-bg-formations bg-areia">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="mb-12 md:flex justify-between items-end"
      >
        <div className="max-w-2xl">
          <span className="fv-eyebrow mb-4">Formação & Estudos</span>
          <h2 className="heading-section text-primary">
            Ciclos de{" "}
            <span className="italic text-gold font-light">Aprendizagem</span>
          </h2>
          <p className="text-lg text-primary/70 leading-relaxed font-light text-balance">
            Nossos percursos formativos são convites para habitar a
            Gestalt-terapia com rigor ético, densidade teórica e sensibilidade
            clínica.
          </p>
        </div>
      </motion.div>

      <div className="relative group/scroll">
        <div
          ref={scrollContainerRef}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-6 pb-8 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
        >
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-80 md:w-96 snap-center">
                <div className="flex h-full flex-col rounded-md border border-border bg-paper p-4">
                  <Skeleton className="mb-6 aspect-[4/3] w-full rounded-md bg-areia" />
                  <div className="space-y-4 flex-1">
                    <Skeleton className="h-6 w-3/4 rounded bg-areia" />
                    <Skeleton className="h-4 w-1/4 rounded bg-areia" />
                  </div>
                </div>
              </div>
            ))
          ) : courses.length === 0 ? (
            <div className="w-full">
              <EmptyState
                title="Nenhuma formação aberta"
                description="No momento não temos inscrições abertas, mas você pode consultar nosso calendário para ver as próximas datas."
                icon={Calendar}
                action={
                  <button
                    onClick={onOpenCalendar}
                    className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-1 hover:text-gold hover:border-gold transition-colors"
                  >
                    Ver Calendário
                  </button>
                }
              />
            </div>
          ) : (
            courses.map((course, index) => {
              const isClosed =
                course.status === "Encerrado" || course.status === "Esgotado";
              const courseUrl = `/curso/${course.slug || course.id}`;

              return (
                <motion.article
                  key={course.id || index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-72 md:w-auto snap-center group h-full"
                >
                  <Link
                    href={courseUrl}
                    className="block h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
                  >
                    <Card className="h-full p-3.5 flex flex-col transition-all hover:border-primary/40 hover:shadow-sm">
                      <div className="relative mb-3.5 aspect-[16/10] shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={getImageSrc(
                            course.image || course.images?.[0],
                            "/assets/course-placeholder.jpg",
                          )}
                          alt={course.title || "Course Image"}
                          fill
                          priority={index === 0}
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className={`object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${isClosed ? "grayscale opacity-70" : ""}`}
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 pointer-events-none">
                          {course.category && (
                            <span className="rounded-sm border border-border bg-paper/95 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary backdrop-blur-sm">
                              {course.category === "Formacao"
                                ? "Formação"
                                : course.category === "GrupoEstudos"
                                  ? "Grupo de Estudos"
                                  : "Curso Livre"}
                            </span>
                          )}
                          {isClosed && (
                            <span className="rounded-sm bg-error/90 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                              {course.status}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col px-1">
                        <div className="mb-2.5">
                          <h3 className="text-base md:text-lg font-bold text-primary mb-1 leading-snug group-hover:text-gold transition-colors line-clamp-2">
                            {course.title}
                          </h3>
                          {course.subtitle && (
                            <p className="text-xs text-primary/60 italic mb-1 line-clamp-1">
                              {course.subtitle}
                            </p>
                          )}
                          <p className="text-[11px] font-bold uppercase tracking-wider text-fv-terra-barro">
                            {course.date || "Início em breve"}
                          </p>
                        </div>

                        <p className="text-primary/70 text-xs leading-relaxed mb-3 line-clamp-2 min-h-[2.8em]">
                          {course.description || course.details?.intro}
                        </p>

                        <div className="mt-auto border-t border-border/70 pt-2.5 flex items-center justify-between">
                          {isClosed ? (
                            <span className="inline-flex cursor-not-allowed items-center gap-1.5 py-1 text-[11px] font-bold uppercase tracking-widest text-muted">
                              Inscrições Encerradas
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-primary group-hover:text-fv-verde-raiz transition-colors"
                              aria-label={`Saiba mais sobre ${course.title}`}
                            >
                              Saiba Mais{" "}
                              <span className="text-gold group-hover:translate-x-1 transition-transform">
                                →
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.article>
              );
            })
          )}
          <div className="w-6 md:hidden flex-shrink-0" />
        </div>

        <div className="flex md:hidden items-center justify-center gap-6 mt-6 opacity-70 hover:opacity-100 transition-opacity">
          <button
            onClick={() => scroll("left")}
            className="min-h-11 min-w-11 rounded-full border border-transparent p-3 text-muted transition-colors hover:border-border hover:bg-areia hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Formação anterior"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="h-px w-32 bg-border" aria-hidden />

          <button
            onClick={() => scroll("right")}
            className="min-h-11 min-w-11 rounded-full border border-transparent p-3 text-muted transition-colors hover:border-border hover:bg-areia hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Próxima formação"
          >
            <ArrowRight size={24} />
          </button>
        </div>

        {/* Sincronização de início dos cursos e calendário */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4">
          {courses.some((c) => Boolean(c.date)) && (
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl px-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-fv-terra-barro">
                Próximos Inícios:
              </span>
              {courses
                .filter((c) => Boolean(c.date))
                .map((c, i) => (
                  <span
                    key={c.id || i}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-paper px-3 py-1 text-[11px] font-medium text-primary shadow-xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-fv-terra-barro" />
                    <span className="font-bold text-primary truncate max-w-[160px]">
                      {c.title}:
                    </span>
                    <span className="text-primary/70">{c.date}</span>
                  </span>
                ))}
            </div>
          )}

          <button
            onClick={onOpenCalendar}
            className="inline-flex items-center gap-2 rounded-full border border-fv-verde-raiz/40 bg-paper px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-fv-verde-raiz transition-all hover:bg-fv-verde-raiz hover:text-white active:scale-95"
          >
            <Calendar size={14} />
            Ver Calendário Completo
          </button>
        </div>
      </div>
    </SectionShell>
  );
}
