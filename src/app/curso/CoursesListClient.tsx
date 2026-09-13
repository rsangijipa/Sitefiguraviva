"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CourseCover } from "@/components/courses/CourseCover";

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
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-widest text-primary/45">
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

  const [featured, ...rest] = courses;
  const filtered = useMemo(
    () => rest.filter((course) => matchesFilter(course, filter)),
    [rest, filter],
  );

  return (
    <div className="min-h-screen bg-[#FDFCF9] pb-20">
      <div className="mx-auto max-w-7xl px-6 pt-16 md:px-12">
        {featured && (
          <Link
            href={`/curso/${featured.slug || featured.id}`}
            className="group mb-14 block"
          >
            <Card className="grid overflow-hidden md:grid-cols-[1.1fr_1fr]">
              <div className="relative h-64 bg-stone-100 md:h-full">
                <CourseCover src={featured.image} alt={featured.title} />
                {featured.enrollmentOpen && <EnrollmentBadge />}
              </div>
              <div className="flex flex-col justify-center p-8 md:p-12">
                {featured.category && (
                  <p className="text-xs font-bold uppercase tracking-widest text-gold">
                    {featured.category}
                  </p>
                )}
                <h2 className="mt-3 font-serif text-3xl leading-tight text-primary group-hover:text-gold transition-colors md:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-4 line-clamp-3 text-sm font-light text-stone-500">
                  {featured.description}
                </p>
                <CourseMeta course={featured} />
                <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:translate-x-1 transition-transform">
                  Saiba mais <ArrowRight size={14} />
                </div>
              </div>
            </Card>
          </Link>
        )}

        <div className="mb-10 flex flex-wrap gap-2">
          {FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                filter === option
                  ? "border-primary bg-primary text-white"
                  : "border-stone-200 text-primary/60 hover:border-primary/40"
              }`}
            >
              {option}
            </button>
          ))}
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
    </div>
  );
}
