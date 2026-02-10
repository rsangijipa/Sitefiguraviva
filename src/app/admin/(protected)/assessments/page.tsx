"use client";

import { useAdminAssessments } from "@/hooks/useAdminAssessments";
import { useAllCourses } from "@/hooks/useCourses";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { FileText, Plus, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import Button from "@/components/ui/Button";
import { AssessmentDoc } from "@/types/assessment";
import { useTransition, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { deleteAssessment } from "@/actions/assessment";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@/components/ui/Modal";
import QuizBuilder from "@/components/admin/assessment/QuizBuilder";

export default function AdminAssessmentsPage() {
  const {
    data: assessments,
    isLoading: assessmentsLoading,
    refetch,
  } = useAdminAssessments();
  const { data: courses, isLoading: coursesLoading } = useAllCourses();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<
    AssessmentDoc | undefined
  >();
  const router = useRouter();

  const isLoading = assessmentsLoading || coursesLoading;

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir a avaliação "${title}"?`))
      return;

    startTransition(async () => {
      const result = await deleteAssessment(id);
      if (result.success) {
        addToast("Avaliação excluída com sucesso!", "success");
      } else {
        addToast(result.error || "Erro ao excluir avaliação", "error");
      }
    });
  };

  const columns: Column<AssessmentDoc>[] = [
    {
      key: "title",
      label: "Título",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-100 rounded-lg text-stone-400">
            <FileText size={16} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-stone-800">{item.title}</span>
            <span className="text-[10px] text-stone-400 font-mono">
              ID: {item.id}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "course",
      label: "Curso / Módulo",
      render: (item) => {
        const course = courses?.find((c) => c.id === item.courseId);
        return (
          <div className="flex flex-col">
            <span className="text-sm text-stone-600 font-medium">
              {course ? course.title : item.courseId || "Geral"}
            </span>
            {item.moduleId && (
              <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                Módulo: {item.moduleId}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "questions",
      label: "Questões",
      render: (item) => (
        <Badge variant="secondary" className="font-bold">
          {item.questions?.length || 0} QUESTÕES
        </Badge>
      ),
    },
    {
      key: "passingScore",
      label: "Média Mín.",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ring-2",
              item.passingScore >= 70
                ? "bg-green-50 text-green-600 ring-green-100"
                : "bg-amber-50 text-amber-600 ring-amber-100",
            )}
          >
            {item.passingScore}%
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => {
        const statusMap: Record<string, { label: string; variant: any }> = {
          draft: { label: "Rascunho", variant: "secondary" },
          published: { label: "Publicado", variant: "success" },
          archived: { label: "Arquivado", variant: "outline" },
        };
        const s = statusMap[item.status] || statusMap.draft;
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
  ];

  return (
    <AdminPageShell
      title="Avaliações & Provas"
      description="Crie e gerencie o conteúdo das provas, exames e quizzes dos cursos."
      breadcrumbs={[{ label: "Avaliações" }]}
      actions={
        <Button
          variant="primary"
          className="shadow-lg shadow-primary/20"
          leftIcon={<Plus size={18} />}
          onClick={() => {
            setEditingAssessment(undefined);
            setIsModalOpen(true);
          }}
        >
          Nova Avaliação
        </Button>
      }
    >
      <DataTable
        data={assessments || []}
        columns={columns}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Buscar por título da avaliação..."
        actions={(item) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => {
                setEditingAssessment(item);
                setIsModalOpen(true);
              }}
              className="p-2 text-stone-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
              title="Editar Avaliação"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => handleDelete(item.id, item.title)}
              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Excluir"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent className="max-w-4xl">
          <ModalHeader>
            <div className="flex flex-col">
              <h2 className="font-serif text-2xl font-bold text-stone-800">
                {editingAssessment ? "Editar Avaliação" : "Nova Avaliação"}
              </h2>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                Agenda Viva & Mentorias
              </p>
            </div>
          </ModalHeader>
          <ModalBody>
            <QuizBuilder
              assessment={editingAssessment}
              onSuccess={() => {
                setIsModalOpen(false);
                refetch();
              }}
              onCancel={() => setIsModalOpen(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </AdminPageShell>
  );
}
