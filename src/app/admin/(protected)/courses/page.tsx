"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Edit,
  Calendar,
  Search,
  Pencil,
  Copy,
  History,
} from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { adminCourseService } from "@/services/adminCourseService";
import { CourseDoc } from "@/types/lms";
import { useToast } from "@/context/ToastContext";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import MediatorsRegistry from "@/components/admin/courses/MediatorsRegistry";
import { CourseOfferAlerts } from "@/components/admin/courses/CourseOfferAlerts";
import { duplicateCourseAction } from "@/app/actions/admin/course-mutations";
import {
  formatHistoryMonth,
  getCourseLastDate,
  splitCoursesByTimeline,
} from "@/features/courses/domain/course-timeline";

export default function CoursesPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [courses, setCourses] = useState<CourseDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminCourseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error(error);
      addToast("Erro ao carregar cursos", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleOpenCreate = () => {
    router.push("/admin/courses/new");
  };

  const handleOpenEdit = (e: React.MouseEvent, course: CourseDoc) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/admin/courses/${course.id}`);
  };

  const handleCardClick = (course: CourseDoc) => {
    router.push(`/admin/courses/${course.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      !confirm(
        "Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.",
      )
    )
      return;

    try {
      await adminCourseService.deleteCourse(id);
      addToast("Curso excluído", "success");
      loadCourses();
    } catch (error) {
      addToast("Erro ao excluir", "error");
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, course: CourseDoc) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      !confirm(
        `Duplicar "${course.title}"?\n\nA cópia nasce como rascunho, com o mesmo conteúdo, módulos, aulas e mediadoras. Alunos, matrículas, comunidade e materiais privados (arquivos) não são copiados.`,
      )
    )
      return;
    setDuplicatingId(course.id);
    try {
      const result = await duplicateCourseAction(course.id);
      if ("message" in result) {
        addToast(result.message, "error");
        return;
      }
      addToast(
        `Cópia criada com ${result.modules} módulo(s) e ${result.lessons} aula(s). Abrindo editor...`,
        "success",
      );
      router.push(`/admin/courses/${result.courseId}`);
    } catch {
      addToast("Não foi possível duplicar o curso.", "error");
    } finally {
      setDuplicatingId(null);
    }
  };

  const filteredCourses = courses
    .filter(
      (c) =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.status.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const dateA = (a.createdAt as any)?.seconds || 0;
      const dateB = (b.createdAt as any)?.seconds || 0;
      return dateB - dateA;
    });
  // Turmas com datas passadas ficam num histórico compacto, abaixo.
  const { current: currentCourses, past: pastCourses } =
    splitCoursesByTimeline(filteredCourses);

  return (
    <AdminPageShell
      title="Cursos & Formações"
      description="Gerencie o catálogo de ensino, turmas e conteúdos."
      breadcrumbs={[{ label: "Cursos" }]}
      actions={
        <Button
          onClick={handleOpenCreate}
          leftIcon={<Plus size={18} />}
          className="shadow-xl shadow-primary/20"
        >
          Novo Curso
        </Button>
      }
    >
      {/* Filters */}
      {!loading && <CourseOfferAlerts courses={courses} />}
      <MediatorsRegistry />
      <div className="flex gap-4 items-center bg-white p-2 pl-4 rounded-xl border border-stone-100 w-full md:w-fit">
        <Search size={18} className="text-stone-400" />
        <input
          placeholder="Buscar cursos..."
          className="outline-none text-sm text-stone-600 w-full md:w-64 py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-stone-100 rounded-3xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Card */}
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleOpenCreate}
            className="min-h-[250px] border-2 border-dashed border-stone-200 hover:border-primary/40 rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer text-stone-400 hover:text-primary hover:bg-stone-50 transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-stone-100 group-hover:bg-white flex items-center justify-center transition-colors">
              <Plus size={32} />
            </div>
            <span className="font-bold text-sm">Criar Novo Curso</span>
          </motion.div>

          {/* Course Cards */}
          {currentCourses.map((course) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="group relative bg-white rounded-[2rem] border border-stone-100 hover:border-gold/50 hover:shadow-xl hover:shadow-gold/5 transition-all overflow-hidden h-full flex flex-col"
            >
              {/* Status Badge */}
              <div
                className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ${
                  course.status === "open"
                    ? "bg-green-500/10 text-green-700"
                    : course.status === "draft"
                      ? "bg-stone-500/10 text-stone-600"
                      : "bg-red-500/10 text-red-700"
                }`}
              >
                {course.status === "open"
                  ? "Publicado"
                  : course.status === "draft"
                    ? "Rascunho"
                    : course.status}
              </div>

              {/* Quick Edit Button */}
              <button
                onClick={(e) => handleOpenEdit(e, course)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm text-stone-600 hover:bg-primary hover:text-white transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                title="Abrir Construtor de Curso"
              >
                <Pencil size={16} />
              </button>

              {/* Aspect Ratio Image */}
              <div
                className="aspect-video bg-stone-100 relative overflow-hidden cursor-pointer"
                onClick={() => handleCardClick(course)}
              >
                {course.coverImage || course.thumbnail ? (
                  <img
                    src={course.coverImage || course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <Calendar size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3
                  className="font-serif text-xl text-stone-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors cursor-pointer"
                  onClick={(e) => handleOpenEdit(e, course)}
                >
                  {course.title}
                </h3>
                <p className="text-sm text-stone-500 line-clamp-2 mb-4 flex-1">
                  {course.subtitle || course.description || "Sem descrição."}
                </p>

                <div className="flex items-center justify-between text-xs font-medium text-stone-400 border-t border-stone-50 pt-4 mt-auto">
                  <span>
                    {course.duration ||
                      (course.createdAt
                        ? (course.createdAt as any).toDate
                          ? (course.createdAt as any)
                              .toDate()
                              .toLocaleDateString()
                          : new Date(
                              (course.createdAt as any).seconds * 1000,
                            ).toLocaleDateString()
                        : "Sem data")}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleDuplicate(e, course)}
                      disabled={duplicatingId !== null}
                      className="p-2 hover:bg-stone-100 hover:text-primary rounded-lg transition-colors z-20 disabled:opacity-50"
                      title="Duplicar curso"
                      aria-label={`Duplicar ${course.title}`}
                    >
                      <Copy size={16} aria-hidden="true" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, course.id)}
                      className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors z-20"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={(e) => handleOpenEdit(e, course)}
                      className="p-2 bg-stone-50 text-stone-600 rounded-lg hover:bg-primary hover:text-white transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && pastCourses.length > 0 && (
        <section
          aria-labelledby="admin-course-history"
          className="border-t border-stone-200 pt-8"
        >
          <h2
            id="admin-course-history"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500"
          >
            <History size={14} aria-hidden="true" />
            Histórico de turmas ({pastCourses.length})
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Cursos cujas datas já passaram. No site eles aparecem no histórico,
            sem botão de inscrição. Para uma nova turma, use Duplicar e ajuste
            datas e valores.
          </p>
          <ul className="mt-4 divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
            {pastCourses.map((course) => {
              const lastDate = getCourseLastDate(course);
              return (
                <li
                  key={course.id}
                  className="flex items-center gap-3 px-4 py-3 grayscale"
                >
                  <div className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-stone-100 text-stone-400">
                    {course.coverImage || course.thumbnail ? (
                      <img
                        src={course.coverImage || course.thumbnail}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <History size={14} aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-700">
                      {course.title}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] uppercase tracking-widest text-stone-500">
                      <Calendar size={11} aria-hidden="true" />
                      {lastDate
                        ? `Realizado em ${formatHistoryMonth(lastDate)}`
                        : "Encerrado"}
                      {course.status === "open" && " · ainda aberto"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDuplicate(e, course)}
                    disabled={duplicatingId !== null}
                    aria-label={`Duplicar ${course.title}`}
                    title="Duplicar para nova turma"
                    className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800 disabled:opacity-50"
                  >
                    <Copy size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(e, course)}
                    aria-label={`Editar ${course.title}`}
                    title="Editar"
                    className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                  >
                    <Edit size={14} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </AdminPageShell>
  );
}
