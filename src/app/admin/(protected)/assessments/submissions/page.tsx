"use client";

import {
  useAdminSubmissionsPaginated,
  useAdminAssessments,
  useSubmissionsMetrics,
} from "@/hooks/useAdminAssessments";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { UserData } from "@/types/user";
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  User as UserIcon,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import Link from "next/link";

export default function SubmissionsPage() {
  const [pageSize] = useState(20);
  const [pageStack, setPageStack] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const lastDoc =
    pageStack.length > 0 ? pageStack[pageStack.length - 1] : undefined;

  const { data: submissionsData, isLoading: submissionsLoading } =
    useAdminSubmissionsPaginated(undefined, pageSize, lastDoc);
  const { data: metrics, isLoading: metricsLoading } = useSubmissionsMetrics();
  const { data: assessments, isLoading: assessmentsLoading } =
    useAdminAssessments();

  // Local user cache for displayed submissions
  const [usersMap, setUsersMap] = useState<Record<string, UserData>>({});
  const [usersLoadingState, setUsersLoadingState] = useState(false);

  const { addToast } = useToast();
  const router = useRouter();

  const submissions = submissionsData?.submissions || [];
  const hasMore = submissionsData?.hasMore || false;
  const isLoading =
    submissionsLoading || assessmentsLoading || usersLoadingState;

  // Fetch users for visible submissions
  useEffect(() => {
    async function fetchUsers() {
      if (!submissions.length) return;

      const userIds = Array.from(new Set(submissions.map((s) => s.userId)));
      const missingIds = userIds.filter((id) => !usersMap[id]);

      if (missingIds.length === 0) return;

      setUsersLoadingState(true);
      try {
        // Fetch in batches or Promise.all
        const newUsers: Record<string, UserData> = {};
        await Promise.all(
          missingIds.map(async (uid) => {
            try {
              const snap = await getDoc(doc(db, "users", uid));
              if (snap.exists()) {
                newUsers[uid] = { uid: snap.id, ...snap.data() } as UserData;
              }
            } catch (e) {
              console.error(`Error fetching user ${uid}`, e);
            }
          }),
        );
        setUsersMap((prev) => ({ ...prev, ...newUsers }));
      } finally {
        setUsersLoadingState(false);
      }
    }
    fetchUsers();
  }, [submissions]);

  const handleNextPage = () => {
    if (submissionsData?.lastVisible) {
      setPageStack((prev) => [...prev, submissionsData.lastVisible]);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (pageStack.length > 0) {
      setPageStack((prev) => prev.slice(0, -1));
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Joined Data
  const joinedData = submissions.map((sub) => {
    const user = usersMap[sub.userId];
    const assessment = assessments?.find((a) => a.id === sub.assessmentId);
    return {
      ...sub,
      userDisplayName: user?.displayName || "Desconhecido",
      userEmail: user?.email || "Carregando...",
      userPhoto: user?.photoURL,
      assessmentTitle: assessment?.title || sub.assessmentId,
    };
  });

  const columns: Column<any>[] = [
    {
      key: "user",
      label: "Aluno",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={row.userPhoto} />
            <AvatarFallback>{row.userDisplayName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-stone-800 text-xs">
              {row.userDisplayName}
            </span>
            <span className="text-[10px] text-stone-400 font-mono truncate max-w-[100px]">
              {row.userEmail}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "assessment",
      label: "Avaliação",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-stone-600 truncate max-w-[150px]">
            {row.assessmentTitle}
          </span>
          <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
            Curso ID: {row.courseId}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const statusMap: Record<
          string,
          { label: string; variant: any; icon: any; color: string }
        > = {
          submitted: {
            label: "Aguardando",
            variant: "warning",
            icon: Clock,
            color: "text-amber-500",
          },
          graded: {
            label: "Corrigida",
            variant: "success",
            icon: CheckCircle,
            color: "text-green-500",
          },
          failed: {
            label: "Reprovado",
            variant: "destructive",
            icon: XCircle,
            color: "text-red-500",
          },
          passed: {
            label: "Aprovado",
            variant: "success",
            icon: CheckCircle,
            color: "text-green-500",
          },
          default: {
            label: row.status,
            variant: "secondary",
            icon: Clock,
            color: "text-stone-400",
          },
        };
        const s = statusMap[row.status] || statusMap.default;
        const Icon = s.icon;
        return (
          <Badge variant={s.variant} className="gap-1.5">
            <Icon size={12} />
            {s.label}
          </Badge>
        );
      },
    },
    {
      key: "score",
      label: "Nota",
      render: (row) => (
        <div className="flex flex-col">
          <span
            className={cn(
              "font-bold text-sm",
              row.passed ? "text-green-600" : "text-stone-400",
            )}
          >
            {row.percentage?.toFixed(1)}%
          </span>
          <span className="text-[10px] text-stone-300">
            {row.score} / {row.totalScore || "?"} pts
          </span>
        </div>
      ),
    },
    {
      key: "date",
      label: "Data",
      render: (row) => {
        const date = row.submittedAt?.toDate?.() || new Date(row.submittedAt);
        return (
          <div className="text-xs text-stone-500">
            {date.toLocaleDateString("pt-BR")}
            <div className="opacity-50 text-[10px]">
              {date.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <AdminPageShell
      title="Correções & Submissões"
      description="Analise as respostas dos alunos e atribua notas para questões dissertativas."
      breadcrumbs={[
        { label: "Avaliações", href: "/admin/assessments" },
        { label: "Correções" },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
              Pendentes
            </span>
            <Clock size={18} className="text-amber-400" />
          </div>
          <div className="text-3xl font-serif font-bold text-amber-900">
            {metricsLoading ? "..." : metrics?.pending || 0}
          </div>
        </div>
        <div className="bg-stone-50 border border-stone-200 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Total
            </span>
            <ClipboardList size={18} className="text-stone-300" />
          </div>
          <div className="text-3xl font-serif font-bold text-stone-800">
            {metricsLoading ? "..." : metrics?.total || 0}
          </div>
        </div>
      </div>

      <DataTable
        data={joinedData}
        columns={columns}
        isLoading={isLoading}
        searchKey="userEmail"
        searchPlaceholder="Buscar por e-mail do aluno..."
        pageSize={pageSize}
        manualPagination={true}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        hasMore={hasMore}
        isFirstPage={currentPage === 1}
        actions={(row) => (
          <div className="flex items-center justify-end">
            <Link
              href={`/admin/assessments/submissions/${row.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-primary hover:text-white text-stone-600 rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
            >
              Avaliar <ArrowRight size={14} />
            </Link>
          </div>
        )}
      />
    </AdminPageShell>
  );
}
