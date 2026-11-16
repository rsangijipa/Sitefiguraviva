"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarX, CircleDollarSign } from "lucide-react";
import { adminCourseService } from "@/services/adminCourseService";
import {
  listCourseOfferAlerts,
  type CourseOfferIssue,
} from "@/features/courses/domain/course-alerts";
import type { CourseDoc } from "@/types/lms";

const issueIcon = (issue: CourseOfferIssue) =>
  issue.kind === "past_date" ? CalendarX : CircleDollarSign;

/**
 * Lista para a administração os cursos oferecidos que ainda precisam de
 * ajuste: sem valor, marcados como gratuitos ou com datas já passadas.
 * Sem `courses`, busca a lista por conta própria (painel inicial).
 */
export function CourseOfferAlerts({ courses }: { courses?: CourseDoc[] }) {
  const [loaded, setLoaded] = useState<CourseDoc[] | null>(courses ?? null);

  useEffect(() => {
    if (courses) {
      setLoaded(courses);
      return;
    }
    let active = true;
    adminCourseService
      .getAllCourses()
      .then((data) => active && setLoaded(data))
      .catch(() => active && setLoaded([]));
    return () => {
      active = false;
    };
  }, [courses]);

  const alerts = loaded ? listCourseOfferAlerts(loaded) : [];
  if (alerts.length === 0) return null;

  return (
    <section
      role="region"
      aria-labelledby="course-offer-alerts-title"
      className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950"
    >
      <h2
        id="course-offer-alerts-title"
        className="flex items-center gap-2 text-base font-bold"
      >
        <AlertTriangle size={18} aria-hidden="true" />
        {alerts.length === 1
          ? "1 curso precisa de ajuste antes de receber inscrições"
          : `${alerts.length} cursos precisam de ajuste antes de receber inscrições`}
      </h2>
      <p className="mt-1 text-sm text-amber-900">
        O instituto não oferece cursos gratuitos. Defina o valor e confira as
        datas; cursos com datas passadas aparecem no histórico do site.
      </p>
      <ul className="mt-4 space-y-3">
        {alerts.map(({ course, issues }) => (
          <li
            key={course.id}
            className="rounded-xl border border-amber-200 bg-white/80 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="font-serif text-lg text-stone-800">{course.title}</p>
              <Link
                href={`/admin/courses/${course.id}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-amber-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-900 focus-visible:ring-offset-2"
              >
                Corrigir agora
                <span className="sr-only">: {course.title}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <ul className="mt-2 space-y-1">
              {issues.map((issue) => {
                const Icon = issueIcon(issue);
                return (
                  <li
                    key={issue.kind}
                    className="flex items-start gap-2 text-sm text-stone-700"
                  >
                    <Icon
                      size={15}
                      className="mt-0.5 shrink-0 text-amber-700"
                      aria-hidden="true"
                    />
                    {issue.message}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
