import { db } from "@/lib/firebase/admin";
import { AssessmentDoc } from "@/types/assessment";
import { FileText, Plus, Search, MoreVertical } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default async function AdminAssessmentsPage() {
  // Fetch Assessments
  const assessmentsSnap = await db
    .collection("assessments")
    .orderBy("title")
    .get();
  const assessments = assessmentsSnap.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as AssessmentDoc,
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            Avaliações & Provas
          </h1>
          <p className="text-stone-500 text-sm">
            Gerencie o conteúdo das provas de todos os cursos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            className="shadow-lg shadow-primary/20"
            leftIcon={<Plus size={18} />}
          >
            Nova Avaliação
          </Button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex bg-white p-4 rounded-xl border border-stone-200 shadow-sm gap-4 items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            size={16}
          />
          <input
            placeholder="Buscar por título ou curso..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:border-primary outline-none"
          />
        </div>
        <select className="bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 text-sm outline-none">
          <option>Todos os Cursos</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Título
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Curso / Módulo
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Questões
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Média Mín.
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {assessments.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-stone-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-stone-100 rounded-lg text-stone-400">
                      <FileText size={16} />
                    </div>
                    <span className="font-bold text-stone-800">
                      {item.title}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-stone-500">
                  {item.courseId ? `Curso: ${item.courseId}` : "Geral"}
                </td>
                <td className="px-6 py-4 text-sm text-stone-600 font-medium">
                  {item.questions?.length || 0} questões
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="bg-stone-100 px-2 py-1 rounded font-bold text-stone-500">
                    {item.passingScore}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 hover:bg-stone-200 rounded-lg transition-colors text-stone-400">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {assessments.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-20 text-center text-stone-400 italic"
                >
                  Nenhuma avaliação encontrada. Clique em "Nova Avaliação" para
                  começar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
