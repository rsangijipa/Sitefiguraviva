"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit, Calendar, Search, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { adminCourseService } from "@/services/adminCourseService";
import { CourseDoc } from "@/types/lms";
import { useToast } from "@/context/ToastContext";
import CourseEditorModal from "@/components/admin/CourseEditorModal";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default function CoursesPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [courses, setCourses] = useState<CourseDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseDoc | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
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
  };

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, course: CourseDoc) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/admin/courses/${course.id}`);
  };

  const handleCardClick = (course: CourseDoc) => {
    router.push(`/admin/courses/${course.id}`);
  };

  const handleModalSuccess = (courseId: string) => {
    setIsModalOpen(false);
    setEditingCourse(null);
    // Redirect directly to the curriculum tab of the new course
    router.push(`/admin/courses/${courseId}?tab=curriculum`);
    addToast("Curso criado! Comece a adicionar módulos.", "success");
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
          {filteredCourses.map((course) => (
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

      {/* Course Editor Modal */}
      <CourseEditorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCourse(null);
        }}
        onSuccess={handleModalSuccess}
        editingCourse={editingCourse}
      />
    </AdminPageShell>
  );
}
