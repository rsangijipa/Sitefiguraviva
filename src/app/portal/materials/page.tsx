"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { BookOpen, FileText, Download, ExternalLink, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { enrollmentService } from "@/services/enrollmentService";
import { courseService } from "@/services/courseService";
import Loading from "../loading";

export default function MaterialsPage() {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [loading, setLoading] = useState(true);
  const [materialsByCourse, setMaterialsByCourse] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    async function loadMaterials() {
      if (!user?.uid) { setLoading(false); return; }
      setLoading(true);
      setError("");
      setMaterialsByCourse([]);
      try {
        // 1. Get Enrollments to know which courses user can access
        const enrollments = await enrollmentService.getActiveEnrollments(
          user.uid,
        );

        if (enrollments.length > 0) {
          const courseIds = enrollments.map((e) => e.courseId);

          // 2. Fetch Course Details (for titles)
          const courses = await courseService.getCoursesByIds(courseIds);

          // 3. Fetch Materials for each course
          const results = await Promise.all(
            courses.map(async (course) => {
              const materials = await courseService.getCourseMaterials(
                course.id,
              );
              return {
                courseTitle: course.title,
                courseId: course.id,
                materials: materials,
              };
            }),
          );

          // Filter out courses with no materials to keep UI clean
          if (active) setMaterialsByCourse(
            results.filter((r) => r.materials && r.materials.length > 0),
          );
        }
      } catch (error) {
        console.error("Error loading materials:", error);
        if (active) setError("Não foi possível carregar os materiais. Verifique sua conexão e tente novamente.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadMaterials();
    return () => { active = false; };
  }, [user?.uid, retry]);

  if (loading) return <Loading />;

  if (error) return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><h1 className="text-2xl font-serif text-amber-950">Materiais complementares</h1><p role="alert" className="mt-3 text-amber-900">{error}</p><button type="button" className="mt-3 min-h-12 rounded-xl border border-amber-300 px-4 font-semibold text-amber-950" onClick={() => setRetry(value => value + 1)}>Tentar novamente</button></section>;

  if (materialsByCourse.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <header className="mb-8">
          <h1 className="font-serif text-3xl text-stone-800">
            Materiais Complementares
          </h1>
          <p className="text-stone-500 mt-1">
            Biblioteca de recursos e leituras.
          </p>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={BookOpen}
            title="Biblioteca Vazia"
            description="Seus cursos atuais não possuem materiais complementares disponíveis no momento."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-stone-800">
          Materiais Complementares
        </h1>
        <p className="text-stone-500 mt-1">
          Biblioteca de recursos e leituras dos seus cursos.
        </p>
      </header>

      <div className="space-y-8 pb-12">
        {materialsByCourse.map((group) => (
          <section
            key={group.courseId}
            className="bg-white rounded-xl border border-stone-100 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-stone-50 bg-stone-50/50">
              <h2 className="font-bold text-stone-800">{group.courseTitle}</h2>
            </div>
            <div className="divide-y divide-stone-50">
              {group.materials.map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between hover:bg-stone-50 transition-colors group"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-stone-800 group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {item.description || "Material de apoio"}
                      </p>
                    </div>
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 min-w-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-emerald-200 px-3 text-sm font-semibold text-primary hover:bg-emerald-50 transition-colors"
                    aria-label={`Abrir ${item.title} (nova aba)`}
                    title="Abrir material em nova aba"
                  >
                    {item.type === "link" ? (
                      <ExternalLink size={18} />
                    ) : (
                      <Download size={18} />
                    )}
                    <span>Abrir material</span>
                  </a>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
