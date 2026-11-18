"use client";

import { useEffect, useState } from "react";
import { CalendarClock, ListOrdered, Unlock, Save, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";
import {
  getCourseReleaseAction,
  updateCourseReleaseAction,
} from "@/app/actions/admin/course-learning";
import type { ContentRelease } from "@/features/courses/domain/content-release";

type ModuleRow = { id: string; title: string; isPublished: boolean };

const MODES: {
  id: ContentRelease["mode"];
  title: string;
  description: string;
  icon: typeof Unlock;
}[] = [
  {
    id: "free",
    title: "Livre",
    description: "O aluno abre qualquer aula publicada, na ordem que quiser.",
    icon: Unlock,
  },
  {
    id: "sequential",
    title: "Sequencial",
    description:
      "Cada aula é liberada quando o aluno conclui a anterior. Aulas já concluídas continuam abertas.",
    icon: ListOrdered,
  },
];

export default function CourseReleaseTab({ courseId }: { courseId: string }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [mode, setMode] = useState<ContentRelease["mode"]>("free");
  const [dates, setDates] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    getCourseReleaseAction(courseId).then((result) => {
      if (!active) return;
      if (result.success) {
        setModules(result.data.modules);
        setMode(result.data.release.mode);
        setDates(result.data.release.moduleDates);
      } else setError(result.message);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [courseId]);

  const save = async () => {
    setSaving(true);
    const moduleDates = Object.fromEntries(
      Object.entries(dates).filter(([, value]) => !!value),
    );
    const result = await updateCourseReleaseAction(courseId, { mode, moduleDates });
    setSaving(false);
    if (result.success) {
      setDates(result.data.moduleDates);
      addToast("Regras de liberação salvas", "success");
    } else addToast(result.message, "error");
  };

  if (loading)
    return (
      <div className="flex items-center gap-2 p-8 text-stone-500">
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        Carregando regras de liberação…
      </div>
    );
  if (error)
    return (
      <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
        {error}
      </p>
    );

  return (
    <div className="space-y-8 max-w-3xl">
      <section aria-labelledby="release-mode-title" className="space-y-3">
        <div>
          <h2 id="release-mode-title" className="font-bold text-stone-800">
            Como as aulas são liberadas
          </h2>
          <p className="text-sm text-stone-500">
            Vale para alunos. A equipe e a administração veem todo o conteúdo.
          </p>
        </div>
        <div role="radiogroup" aria-labelledby="release-mode-title" className="grid gap-3 sm:grid-cols-2">
          {MODES.map((option) => {
            const Icon = option.icon;
            const checked = mode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => setMode(option.id)}
                className={cn(
                  "flex gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  checked
                    ? "border-primary bg-primary/5"
                    : "border-stone-200 bg-white hover:border-primary/40",
                )}
              >
                <Icon size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
                <span>
                  <span className="block font-bold text-stone-800">{option.title}</span>
                  <span className="block text-sm text-stone-500">{option.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="release-dates-title" className="space-y-3">
        <div className="flex items-start gap-2">
          <CalendarClock size={20} aria-hidden="true" className="mt-0.5 text-primary" />
          <div>
            <h2 id="release-dates-title" className="font-bold text-stone-800">
              Datas de abertura dos módulos
            </h2>
            <p className="text-sm text-stone-500">
              Opcional. O módulo abre à meia-noite (horário de Brasília) da data
              escolhida e combina com o modo acima.
            </p>
          </div>
        </div>
        {modules.length === 0 ? (
          <p className="rounded-xl bg-stone-50 p-4 text-sm text-stone-500">
            Este curso ainda não tem módulos. Crie-os na aba Curriculum.
          </p>
        ) : (
          <ul className="divide-y divide-stone-100 rounded-xl border border-stone-100 bg-white">
            {modules.map((courseModule) => (
              <li
                key={courseModule.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <label
                  htmlFor={`release-${courseModule.id}`}
                  className="text-sm font-medium text-stone-700"
                >
                  {courseModule.title}
                  {!courseModule.isPublished && (
                    <span className="ml-2 text-xs text-stone-400">(não publicado)</span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={`release-${courseModule.id}`}
                    type="date"
                    value={dates[courseModule.id] ?? ""}
                    onChange={(e) =>
                      setDates((prev) => ({ ...prev, [courseModule.id]: e.target.value }))
                    }
                    className="rounded-lg border border-stone-200 px-3 py-2 text-sm"
                  />
                  {dates[courseModule.id] && (
                    <button
                      type="button"
                      onClick={() =>
                        setDates((prev) => ({ ...prev, [courseModule.id]: "" }))
                      }
                      className="text-xs font-bold text-stone-500 underline"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button onClick={save} isLoading={saving} leftIcon={<Save size={16} aria-hidden="true" />}>
        Salvar regras de liberação
      </Button>
    </div>
  );
}
