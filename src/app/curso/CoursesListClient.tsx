"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CourseCover } from "@/components/courses/CourseCover";

const CalendarModal = dynamic(() => import("@/components/CalendarModal"), {
  ssr: false,
});

const FILTERS = [
  "Todos",
  "Formação",
  "Grupo de estudos",
  "Vivência",
  "Online",
  "Presencial",
] as const;

type Filter = (typeof FILTERS)[number];

function matchesFilter(course: any, filter: Filter): boolean {
  if (filter === "Todos") return true;
  const haystack = [
    course.category,
    course.type,
    course.level,
    ...(Array.isArray(course.tags) ? course.tags : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(filter.toLowerCase());
}

function EnrollmentBadge() {
  return (
    <div className="absolute left-4 top-4 rounded-full border border-igarape/30 bg-areia px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-igarape">
      Matrículas abertas
    </div>
  );
}

function CourseMeta({ course }: { course: any }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-widest text-primary/45">
      {course.date && (
        <span className="flex items-center gap-1.5">
          <Calendar size={12} /> {course.date}
        </span>
      )}
      {course.durationLabel && (
        <span className="flex items-center gap-1.5">
          <Clock size={12} /> {course.durationLabel}
        </span>
      )}
    </div>
  );
}

export default function CoursesListClient({ courses }: { courses: any[] }) {
  const [filter, setFilter] = useState<Filter>("Todos");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [featured, ...rest] = courses;
  const filtered = useMemo(
    () => rest.filter((course) => matchesFilter(course, filter)),
    [rest, filter],
  );

  return (
    <div className="min-h-screen bg-paper pb-20">
      <div className="mx-auto max-w-7xl px-6 pt-12 md:px-12">
        {featured && (
          <Link
            href={`/curso/${featured.slug || featured.id}`}
            className="group mb-10 block max-w-4xl mx-auto"
          >
            <Card className="grid overflow-hidden md:grid-cols-[280px_1fr] border border-[#D8CFBE]/60 bg-white/70">
              <div className="relative h-48 bg-stone-100 md:h-full min-h-[200px]">
                <CourseCover src={featured.image} alt={featured.title} />
                {featured.enrollmentOpen && <EnrollmentBadge />}
              </div>
              <div className="flex flex-col justify-center p-5 md:p-7">
                {featured.category && (
                  <p className="text-xs font-bold uppercase tracking-widest text-[#96551F]">
                    {featured.category}
                  </p>
                )}
                <h2 className="mt-2 font-serif text-2xl leading-tight text-primary group-hover:text-[#005A1F] transition-colors md:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 line-clamp-2 text-xs md:text-sm font-light text-stone-600">
                  {featured.description}
                </p>
                <CourseMeta course={featured} />
                <div className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:translate-x-1 transition-transform">
                  Saiba mais <ArrowRight size={14} />
                </div>
              </div>
            </Card>
          </Link>
        )}

        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`rounded-full border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  filter === option
                    ? "border-[#005A1F] bg-[#005A1F] text-[#FDFAF4]"
                    : "border-[#D8CFBE] text-[#262B22]/70 hover:border-[#005A1F]/50 bg-white/50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsCalendarOpen(true)}
            className="inline-flex items-center gap-2 self-start md:self-auto rounded-full border border-[#005A1F]/30 bg-[#005A1F]/10 hover:bg-[#005A1F]/15 px-4 py-2 text-xs font-semibold text-[#005A1F] transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
          >
            <Calendar size={14} className="text-[#07614C]" />
            <span>Ver Calendário de Atividades</span>
          </button>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <Link
              key={course.id}
              href={`/curso/${course.slug || course.id}`}
              className="group block h-full"
            >
              <Card className="flex h-full flex-col overflow-hidden">
                <div className="relative h-64 bg-stone-100">
                  <CourseCover src={course.image} alt={course.title} />
                  {course.enrollmentOpen && <EnrollmentBadge />}
                </div>
                <div className="flex flex-1 flex-col p-8">
                  {course.category && (
                    <p className="text-xs font-bold uppercase tracking-widest text-gold">
                      {course.category}
                    </p>
                  )}
                  <h2 className="mt-2 font-serif text-2xl leading-tight text-primary group-hover:text-gold transition-colors">
                    {course.title}
                  </h2>
                  <p className="mb-6 mt-3 line-clamp-3 flex-1 text-sm font-light text-stone-500">
                    {course.description}
                  </p>
                  <div className="mt-auto border-t border-stone-100 pt-5">
                    <CourseMeta course={course} />
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:translate-x-1 transition-transform">
                      Saiba mais <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-light text-stone-400">
              Nenhum curso encontrado para este filtro.
            </p>
          </div>
        )}
      </div>

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        courses={courses}
      />
    </div>
  );
}
