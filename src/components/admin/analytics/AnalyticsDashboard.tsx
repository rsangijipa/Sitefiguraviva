"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { getStudentAnalytics, getCourseAnalytics } from "@/actions/analytics";
import type { StudentAnalytics, CourseAnalytics } from "@/types/analytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  Award,
  BookOpen,
  Loader2,
  Download,
} from "@/components/icons";
import { cn } from "@/lib/utils";

interface AnalyticsDashboardProps {
  courseId: string;
}

export default function AnalyticsDashboard({
  courseId,
}: AnalyticsDashboardProps) {
  const { addToast } = useToast();

  const [students, setStudents] = useState<StudentAnalytics[]>([]);
  const [courseAnalytics, setCourseAnalytics] =
    useState<CourseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [courseId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [studentsResult, courseResult] = await Promise.all([
        getStudentAnalytics(courseId),
        getCourseAnalytics(courseId),
      ]);

      if (studentsResult.error) {
        addToast(studentsResult.error, "error");
        return;
      }

      if (courseResult.error) {
        addToast(courseResult.error, "error");
        return;
      }

      setStudents(studentsResult.students || []);
      setCourseAnalytics(courseResult.analytics || null);
    } catch (error) {
      console.error("Load Analytics Error:", error);
      addToast("Erro ao carregar analytics", "error");
    } finally {
      setLoading(false);
    }
  };

  const exportToCsv = () => {
    setExporting(true);
    try {
      const headers = [
        "Nome",
        "Email",
        "Progresso (%)",
        "Aulas Completas",
        "Avaliacoes Completas",
        "Nota Media",
        "Aprovadas",
        "Reprovadas",
        "Certificado",
        "Matricula",
      ];

      const rows = students.map((s) => [
        s.userName,
        s.userEmail,
        s.progressPercentage.toFixed(1),
        `${s.completedLessons}/${s.totalLessons}`,
        `${s.completedAssessments}/${s.totalAssessments}`,
        s.averageScore.toFixed(1),
        s.passedAssessments,
        s.failedAssessments,
        s.certificateIssued ? "Sim" : "Nao",
        s.enrolledAt?.toDate?.().toLocaleDateString("pt-BR") || "",
      ]);

      const escapeCsv = (value: unknown) => {
        const stringValue = String(value ?? "");
        const escaped = stringValue.replace(/"/g, '""');
        return `"${escaped}"`;
      };

      const csvContent = [
        headers.map(escapeCsv).join(";"),
        ...rows.map((row) => row.map(escapeCsv).join(";")),
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `analytics-${courseAnalytics?.courseName || "curso"}-${Date.now()}.csv`;

      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      addToast("Relatorio CSV exportado com sucesso!", "success");
    } catch (error) {
      console.error("Export Error:", error);
      addToast("Erro ao exportar relatorio", "error");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const COLORS = ["#3B7F6D", "#C8A870", "#6B7280", "#EF4444"];

  // Prepare chart data
  const progressData = [
    {
      name: "0-25%",
      count: students.filter((s) => s.progressPercentage < 25).length,
    },
    {
      name: "25-50%",
      count: students.filter(
        (s) => s.progressPercentage >= 25 && s.progressPercentage < 50,
      ).length,
    },
    {
      name: "50-75%",
      count: students.filter(
        (s) => s.progressPercentage >= 50 && s.progressPercentage < 75,
      ).length,
    },
    {
      name: "75-100%",
      count: students.filter((s) => s.progressPercentage >= 75).length,
    },
  ];

  const assessmentData = [
    {
      name: "Aprovados",
      value: students.reduce((sum, s) => sum + s.passedAssessments, 0),
    },
    {
      name: "Reprovados",
      value: students.reduce((sum, s) => sum + s.failedAssessments, 0),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-800">
                {courseAnalytics?.totalEnrollments || 0}
              </div>
              <div className="text-sm text-stone-600">Alunos Matriculados</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-800">
                {courseAnalytics?.completionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-stone-600">Taxa de Conclusão</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-800">
                {courseAnalytics?.averageAssessmentScore.toFixed(1)}%
              </div>
              <div className="text-sm text-stone-600">Nota Média</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-800">
                {courseAnalytics?.certificatesIssued || 0}
              </div>
              <div className="text-sm text-stone-600">
                Certificados Emitidos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Distribution */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <h3 className="font-bold text-stone-800 mb-4">
            Distribuição de Progresso
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B7F6D" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Assessment Results */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <h3 className="font-bold text-stone-800 mb-4">
            Resultados de Avaliações
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={assessmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {assessmentData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <h3 className="font-bold text-stone-800">Desempenho por Aluno</h3>
          <button
            onClick={exportToCsv}
            disabled={exporting}
            className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Download size={16} />
            )}
            Exportar CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Aluno
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Progresso
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Nota Média
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Avaliações
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Certificado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {students.map((student) => (
                <tr
                  key={student.userId}
                  className="hover:bg-stone-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-stone-800">
                      {student.userName}
                    </div>
                    <div className="text-xs text-stone-500">
                      {student.userEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div
                      className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold",
                        student.progressPercentage >= 100
                          ? "bg-green-100 text-green-700"
                          : student.progressPercentage >= 50
                            ? "bg-amber-100 text-amber-700"
                            : "bg-stone-100 text-stone-700",
                      )}
                    >
                      {student.progressPercentage.toFixed(0)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-stone-800">
                    {student.averageScore.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm">
                      <span className="text-green-600 font-bold">
                        {student.passedAssessments}
                      </span>
                      {" / "}
                      <span className="text-red-600">
                        {student.failedAssessments}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {student.certificateIssued ? (
                      <Award className="inline text-primary" size={20} />
                    ) : (
                      <span className="text-stone-400 text-sm">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
