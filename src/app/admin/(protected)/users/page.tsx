"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useTransition,
  Suspense,
  useMemo,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  User,
  Shield,
  UserCheck,
  UserMinus,
  ChevronRight,
  RefreshCcw,
  Trash2,
  Pencil,
  X,
  KeyRound,
  Eye,
  EyeOff,
  MessageCircle,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Mail,
  Check,
  Trophy,
  Award,
  Coins,
  GraduationCap,
  ExternalLink,
  Users,
  UserPlus,
  Loader2,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import styles from "./UserSheet.module.css";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  toggleUserStatus as toggleUserStatusAction,
  updateUserRole,
  listUsersForAdmin,
  deleteUser,
  sendUserAccessEmail,
  adminUpdateUser,
} from "@/app/actions/user-management";
import {
  listApplicationsForAdmin,
  markApplicationContacted,
  deleteApplication,
} from "@/app/actions/admin/applications";
import {
  enrollLead,
  enrollLeadWithExternalPix,
} from "@/actions/adminEnrollment";
import {
  enrollUser,
  approveEnrollment,
  updateEnrollmentStatus,
  revokeAccess,
} from "@/app/actions/admin/enrollment";
import {
  awardManualXp,
  awardManualBadge,
} from "@/app/actions/gamification-admin";
import { useAllGamificationProfiles } from "@/hooks/useAdminGamification";
import { BADGE_DEFINITIONS } from "@/lib/gamification";
import { useCourses } from "@/hooks/useContent";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { EnrollmentCard } from "../enrollments/EnrollmentCard";
import BatchEnrollModal from "../enrollments/BatchEnrollModal";
import PixReviewPanel from "@/components/admin/PixReviewPanel";
import { getImageSrc } from "@/lib/imageUtils";
import type { UserRole } from "@/types/user";

type AdminUser = {
  id: string;
  uid?: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role?: string;
  isActive?: boolean;
  status?: string;
  createdAt?: string | null;
  profileCompletion?: number;
  phoneNumber?: string | null;
};

const isUserActive = (user: AdminUser) => {
  if (typeof user.isActive === "boolean") return user.isActive;
  if (user.status === "disabled") return false;
  return true;
};

function UsersManagerClient() {
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") || searchParams.get("view") || "users";

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    "users" | "applications" | "enrollments" | "gamification"
  >(
    ["users", "applications", "enrollments", "gamification"].includes(
      initialTab,
    )
      ? (initialTab as any)
      : "users",
  );

  const { addToast } = useToast();
  const { data: coursesData } = useCourses(true);
  const coursesList = useMemo(
    () => (coursesData as any[]) || [],
    [coursesData],
  );
  const [isPending, startTransition] = useTransition();

  // Users Data
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Applications Data
  const [applications, setApplications] = useState<any[]>([]);
  const [coursesMap, setCoursesMap] = useState<Record<string, any>>({});
  const [loadingApps, setLoadingApps] = useState(false);
  const [enrollingAppId, setEnrollingAppId] = useState<string | null>(null);

  // Global Enrollments Data
  const [allEnrollments, setAllEnrollments] = useState<any[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);

  // Gamification Data
  const {
    data: gamificationProfiles,
    isLoading: loadingGamification,
    refetch: refetchGamification,
  } = useAllGamificationProfiles();

  // Ficha 360 State
  const [selectedUser360, setSelectedUser360] = useState<AdminUser | null>(
    null,
  );
  const [tab360, setTab360] = useState<
    "access" | "enrollments" | "applications" | "gamification"
  >("access");
  const [userEnrollments, setUserEnrollments] = useState<any[]>([]);
  const [loadingUserEnrollments, setLoadingUserEnrollments] = useState(false);
  const [selectedNewCourse, setSelectedNewCourse] = useState("");
  const [enrollingNewCourse, setEnrollingNewCourse] = useState(false);

  // Pix Review Panel State
  const [pixReview, setPixReview] = useState<{
    userId: string;
    courseId: string;
  } | null>(null);
  const [externalPixApplication, setExternalPixApplication] = useState<{
    id: string;
    courseTitle: string;
  } | null>(null);
  const [externalPixConfirmed, setExternalPixConfirmed] = useState(false);
  const [externalPixError, setExternalPixError] = useState<string | null>(null);

  // Direct User Edit in 360
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Gamification Award State inside 360
  const [manualXpAmount, setManualXpAmount] = useState("");
  const [manualXpReason, setManualXpReason] = useState("");
  const [manualBadgeId, setManualBadgeId] = useState(
    BADGE_DEFINITIONS[0]?.id || "",
  );
  const [awardingXp, setAwardingXp] = useState(false);
  const [awardingBadge, setAwardingBadge] = useState(false);

  // 1. Load Users
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const all: AdminUser[] = [];
      let token: string | undefined;
      for (let i = 0; i < 10; i++) {
        const res = await listUsersForAdmin(token, 100);
        if (!res.success) {
          setUsersError(res.error || "Erro ao carregar usuários.");
          break;
        }
        all.push(...((res.users as AdminUser[]) || []));
        token = (res.nextPageToken as string | undefined) || undefined;
        if (!token) break;
      }
      setUsers(all);
    } catch (e: any) {
      setUsersError(e?.message || "Erro inesperado.");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // 2. Load Applications
  const loadApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const res = await listApplicationsForAdmin();
      setApplications(res.applications);
      setCoursesMap(res.courses);
    } catch {
      // Ignored
    } finally {
      setLoadingApps(false);
    }
  }, []);

  // 3. Load Global Enrollments
  const loadEnrollments = useCallback(async () => {
    setLoadingEnrollments(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAllEnrollments(
          data.map((row: any) => ({
            ...row,
            userId: row.user_id,
            courseId: row.course_id,
            paymentMethod: row.payment_method,
            enrolledAt: row.enrolled_at || row.created_at,
            progressSummary: row.progress_summary,
          })),
        );
      }
    } catch {
      // Ignored
    } finally {
      setLoadingEnrollments(false);
    }
  }, []);

  // Initial Data Load
  useEffect(() => {
    void loadUsers();
    void loadApplications();
    void loadEnrollments();
  }, [loadUsers, loadApplications, loadEnrollments]);

  // Load Enrollments for Selected User in 360
  const loadSelectedUserEnrollments = useCallback(async (userId: string) => {
    setLoadingUserEnrollments(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setUserEnrollments(
          data.map((row: any) => ({
            ...row,
            userId: row.user_id,
            courseId: row.course_id,
            paymentMethod: row.payment_method,
            enrolledAt: row.enrolled_at || row.created_at,
            progressSummary: row.progress_summary,
          })),
        );
      }
    } catch {
      setUserEnrollments([]);
    } finally {
      setLoadingUserEnrollments(false);
    }
  }, []);

  // Open User 360
  const openUser360 = (
    user: AdminUser,
    tab: "access" | "enrollments" | "applications" | "gamification" = "access",
  ) => {
    setSelectedUser360(user);
    setTab360(tab);
    setEditDisplayName(user.displayName || "");
    setEditPhoneNumber(user.phoneNumber || "");
    setEditEmail(user.email || "");
    setEditPassword("");
    setShowEditPassword(false);
    setEditError(null);
    void loadSelectedUserEnrollments(user.id);
  };

  const closeUser360 = () => {
    setSelectedUser360(null);
  };

  // WhatsApp helper
  const openWhatsApp = (
    phone?: string | null,
    name?: string | null,
    courseTitle?: string | null,
  ) => {
    if (!phone) {
      addToast("Telefone não informado.", "error");
      return;
    }
    const clean = phone.replace(/\D/g, "");
    const formatted = clean.startsWith("55") ? clean : `55${clean}`;
    const msg = encodeURIComponent(
      `Olá ${name || ""}! Aqui é da equipe do Instituto Figura Viva sobre o curso ${courseTitle || ""}. Como podemos te ajudar?`,
    );
    window.open(`https://wa.me/${formatted}?text=${msg}`, "_blank");
  };

  // User Actions
  const handleToggleStatus = async (user: AdminUser) => {
    try {
      const willBeActive = !isUserActive(user);
      const newStatus = willBeActive ? "active" : "disabled";
      const res = await toggleUserStatusAction(user.id, newStatus);
      if (res.success) {
        addToast(
          `Conta ${willBeActive ? "ativada" : "desativada"} com sucesso.`,
          "success",
        );
        await loadUsers();
        if (selectedUser360?.id === user.id) {
          setSelectedUser360({
            ...selectedUser360,
            isActive: willBeActive,
            status: newStatus,
          });
        }
      } else {
        addToast(res.error || "Erro ao alternar status.", "error");
      }
    } catch {
      addToast("Erro ao alternar status.", "error");
    }
  };

  const handleRoleChange = async (user: AdminUser, newRole: UserRole) => {
    try {
      const res = await updateUserRole(user.id, newRole);
      if (res.success) {
        addToast(`Papel alterado para ${newRole}.`, "success");
        await loadUsers();
        if (selectedUser360?.id === user.id) {
          setSelectedUser360({ ...selectedUser360, role: newRole });
        }
      } else {
        addToast(res.error || "Erro ao alterar papel.", "error");
      }
    } catch {
      addToast("Erro ao alterar papel.", "error");
    }
  };

  const handleSendAccessEmail = async (user: AdminUser) => {
    try {
      const res = await sendUserAccessEmail(user.id);
      if (res.success) {
        addToast("E-mail de acesso enviado com sucesso.", "success");
      } else {
        addToast(res.error || "Falha ao enviar e-mail de acesso.", "error");
      }
    } catch {
      addToast("Falha ao enviar e-mail de acesso.", "error");
    }
  };

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser360) return;
    setEditLoading(true);
    setEditError(null);

    try {
      const res = await adminUpdateUser(selectedUser360.id, {
        displayName: editDisplayName.trim() || undefined,
        phoneNumber: editPhoneNumber.trim() || undefined,
        email: editEmail.trim() || undefined,
        password: editPassword.trim() || undefined,
      });

      if (!res.success) {
        setEditError(res.error || "Erro ao atualizar dados.");
        return;
      }

      addToast("Cadastro atualizado com sucesso.", "success");
      setEditPassword("");
      await loadUsers();
      setSelectedUser360({
        ...selectedUser360,
        displayName: editDisplayName.trim() || selectedUser360.displayName,
        phoneNumber: editPhoneNumber.trim() || selectedUser360.phoneNumber,
        email: editEmail.trim() || selectedUser360.email,
      });
    } catch (err: any) {
      setEditError(err?.message || "Erro ao atualizar.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir a conta de ${user.displayName || user.email}? Esta ação é irreversível.`,
      )
    )
      return;

    try {
      const res = await deleteUser(user.id);
      if (res.success) {
        addToast("Usuário excluído com sucesso.", "success");
        closeUser360();
        await loadUsers();
      } else {
        addToast(res.error || "Erro ao excluir usuário.", "error");
      }
    } catch {
      addToast("Erro ao excluir usuário.", "error");
    }
  };

  // Enrollment Actions
  const handleEnrollInCourse = async () => {
    if (!selectedUser360 || !selectedNewCourse) return;
    if (!selectedUser360.email) {
      addToast("Cadastre um e-mail para matricular este usuário.", "error");
      return;
    }
    setEnrollingNewCourse(true);
    try {
      const res = await enrollUser(selectedUser360.email, selectedNewCourse);
      if (res.success) {
        addToast("Aluno matriculado com sucesso!", "success");
        setSelectedNewCourse("");
        await loadSelectedUserEnrollments(selectedUser360.id);
        await loadEnrollments();
      } else {
        addToast(res.error || "Erro ao realizar matrícula.", "error");
      }
    } catch {
      addToast("Erro ao matricular aluno.", "error");
    } finally {
      setEnrollingNewCourse(false);
    }
  };

  // Lead / Application Actions
  const handleContactApp = async (appId: string) => {
    try {
      const res = await markApplicationContacted(appId);
      if (res.success) {
        addToast("Contato registrado.", "success");
        await loadApplications();
      } else {
        addToast(res.error || "Erro ao registrar contato.", "error");
      }
    } catch {
      addToast("Erro ao registrar contato.", "error");
    }
  };

  const handleEnrollLead = async (app: any) => {
    setEnrollingAppId(app.id);
    try {
      const res = await enrollLead(app.id);
      if (!res.success) {
        addToast(res.error || "Falha ao preparar matrícula/Pix.", "error");
        return;
      }
      if (res.alreadyEnrolled) {
        addToast("Esta conta já possui acesso ao curso.", "success");
        return;
      }
      addToast("Matrícula preparada. Verifique o comprovante Pix.", "success");
      setPixReview({ userId: res.userId!, courseId: res.courseId! });
      await loadApplications();
      await loadEnrollments();
    } catch {
      addToast("Erro ao preparar cobrança/matrícula.", "error");
    } finally {
      setEnrollingAppId(null);
    }
  };

  const handleExternalPixEnrollment = async () => {
    if (!externalPixApplication || !externalPixConfirmed || enrollingAppId)
      return;
    setEnrollingAppId(externalPixApplication.id);
    setExternalPixError(null);
    try {
      const result = await enrollLeadWithExternalPix(
        externalPixApplication.id,
        externalPixConfirmed,
      );
      if (result.success === false) {
        setExternalPixError(
          result.error || "Não foi possível concluir a matrícula.",
        );
        return;
      }
      setExternalPixApplication(null);
      setExternalPixConfirmed(false);
      addToast(
        result.alreadyProcessed
          ? "Este usuário já possui acesso ao curso."
          : "Pix externo confirmado. Matrícula concluída e acesso liberado.",
        "success",
      );
      await Promise.all([
        loadApplications(),
        loadEnrollments(),
        ...(result.userId ? [loadSelectedUserEnrollments(result.userId)] : []),
      ]);
    } catch {
      setExternalPixError(
        "Não foi possível concluir a matrícula. Tente novamente.",
      );
    } finally {
      setEnrollingAppId(null);
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!confirm("Excluir esta intenção de inscrição?")) return;
    try {
      const res = await deleteApplication(appId);
      if (res.success) {
        addToast("Inscrição removida.", "success");
        await loadApplications();
      } else {
        addToast(res.error || "Erro ao remover.", "error");
      }
    } catch {
      addToast("Erro ao remover inscrição.", "error");
    }
  };

  // Gamification Actions
  const handleAwardXpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser360 || !manualXpAmount || isNaN(Number(manualXpAmount))) {
      addToast("Informe uma quantidade válida de XP.", "error");
      return;
    }
    setAwardingXp(true);
    try {
      const res = await awardManualXp(
        selectedUser360.id,
        Number(manualXpAmount),
        manualXpReason || "Concessão administrativa",
      );
      if (res.success) {
        addToast("XP concedido com sucesso!", "success");
        setManualXpAmount("");
        setManualXpReason("");
        refetchGamification();
      } else {
        addToast(res.error || "Erro ao conceder XP.", "error");
      }
    } catch {
      addToast("Erro ao conceder XP.", "error");
    } finally {
      setAwardingXp(false);
    }
  };

  const handleAwardBadgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser360 || !manualBadgeId) return;
    setAwardingBadge(true);
    try {
      const res = await awardManualBadge(selectedUser360.id, manualBadgeId);
      if (res.success) {
        addToast("Conquista atribuída com sucesso!", "success");
        refetchGamification();
      } else {
        addToast(res.error || "Erro ao atribuir conquista.", "error");
      }
    } catch {
      addToast("Erro ao atribuir conquista.", "error");
    } finally {
      setAwardingBadge(false);
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        u.email?.toLowerCase().includes(q) ||
        u.displayName?.toLowerCase().includes(q) ||
        u.phoneNumber?.toLowerCase().includes(q) ||
        u.id.includes(q);

      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const active = isUserActive(u);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && active) ||
        (statusFilter === "disabled" && !active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Filtered Applications List
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const q = searchTerm.toLowerCase();
      if (!q) return true;
      return (
        app.userName?.toLowerCase().includes(q) ||
        app.userEmail?.toLowerCase().includes(q) ||
        app.userPhone?.toLowerCase().includes(q) ||
        coursesMap[app.courseId]?.title?.toLowerCase().includes(q)
      );
    });
  }, [applications, searchTerm, coursesMap]);

  // Filtered Enrollments List
  const filteredEnrollments = useMemo(() => {
    return allEnrollments.filter((enr) => {
      const q = searchTerm.toLowerCase();
      if (!q) return true;
      const user = users.find((u) => u.id === enr.userId);
      const course = coursesList.find((c) => c.id === enr.courseId);
      return (
        user?.displayName?.toLowerCase().includes(q) ||
        user?.email?.toLowerCase().includes(q) ||
        course?.title?.toLowerCase().includes(q) ||
        enr.status?.toLowerCase().includes(q)
      );
    });
  }, [allEnrollments, searchTerm, users, coursesList]);

  // Joined Gamification Data
  const joinedGamification = useMemo(() => {
    return (
      gamificationProfiles?.map((profile) => {
        const user = users.find((u) => u.id === profile.uid);
        return {
          ...profile,
          displayName: user?.displayName || "Aluno(a)",
          email: user?.email || "-",
          photoURL: user?.photoURL,
          userObj: user,
        };
      }) || []
    ).sort((a, b) => b.totalXp - a.totalXp);
  }, [gamificationProfiles, users]);

  // Derived metrics
  const activeCount = users.filter(isUserActive).length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const leadsCount = applications.length;
  const enrollmentsCount = allEnrollments.length;

  // Selected User 360 Computations
  const user360Apps = useMemo(() => {
    if (!selectedUser360) return [];
    return applications.filter(
      (a) =>
        a.user_id === selectedUser360.id ||
        (selectedUser360.email &&
          a.userEmail?.toLowerCase() === selectedUser360.email.toLowerCase()),
    );
  }, [selectedUser360, applications]);

  const user360Gamification = useMemo(() => {
    if (!selectedUser360) return null;
    return gamificationProfiles?.find((p) => p.uid === selectedUser360.id);
  }, [selectedUser360, gamificationProfiles]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <section className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
            Gestão de Pessoas
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Central 360° de alunos, usuários, permissões, matrículas e
            gamificação.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            leftIcon={<Layers size={14} />}
            onClick={() => setIsBatchOpen(true)}
          >
            Matrícula em Lote
          </Button>
          <Button
            variant="outline"
            leftIcon={<RefreshCcw size={14} />}
            onClick={() => {
              void loadUsers();
              void loadApplications();
              void loadEnrollments();
              refetchGamification();
            }}
            isLoading={loadingUsers || loadingApps || loadingEnrollments}
          >
            Atualizar
          </Button>
        </div>
      </section>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
            Total de Pessoas
          </p>
          <p className="text-2xl font-bold text-stone-800 mt-1">
            {users.length}
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
            Alunos Ativos / Admins
          </p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {activeCount}{" "}
            <span className="text-xs font-semibold text-stone-400">
              / {adminCount} adm
            </span>
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
            Interessados (Leads)
          </p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{leadsCount}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-xs">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
            Matrículas Totais
          </p>
          <p className="text-2xl font-bold text-primary mt-1">
            {enrollmentsCount}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-1 overflow-x-auto text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition-colors ${
            activeTab === "users"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Users size={16} /> Todas as Pessoas ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("applications")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition-colors ${
            activeTab === "applications"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <UserPlus size={16} /> Interessados / Leads ({applications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("enrollments")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition-colors ${
            activeTab === "enrollments"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <GraduationCap size={16} /> Matrículas ({allEnrollments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("gamification")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition-colors ${
            activeTab === "gamification"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Trophy size={16} /> Gamificação & XP ({joinedGamification.length})
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-xl border border-stone-200">
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            placeholder={
              activeTab === "applications"
                ? "Buscar candidato, e-mail ou curso..."
                : activeTab === "enrollments"
                  ? "Buscar matrícula, aluno ou curso..."
                  : "Buscar por nome, e-mail ou ID..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {activeTab === "users" && (
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs rounded-lg border border-stone-200 p-2 bg-white"
            >
              <option value="all">Todos os papéis</option>
              <option value="student">Aluno</option>
              <option value="teacher">Professor</option>
              <option value="admin">Administrador</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded-lg border border-stone-200 p-2 bg-white"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="disabled">Inativos</option>
            </select>
          </div>
        )}
      </div>

      {/* ========================================================== */}
      {/* TAB 1: TODAS AS PESSOAS */}
      {/* ========================================================== */}
      {activeTab === "users" && (
        <Card className="overflow-hidden border border-stone-200 bg-white shadow-xs">
          {loadingUsers ? (
            <div className="p-12 text-center text-xs text-stone-400">
              <Loader2
                className="animate-spin mx-auto mb-2 text-primary"
                size={24}
              />
              Carregando lista de pessoas...
            </div>
          ) : usersError ? (
            <div className="p-8 text-center text-xs text-rose-600">
              {usersError}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-400">
              Nenhuma pessoa encontrada com os filtros selecionados.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredUsers.map((u) => {
                const active = isUserActive(u);
                const userApps = applications.filter((a) => a.user_id === u.id);
                const userEnrs = allEnrollments.filter(
                  (e) => e.userId === u.id,
                );
                const userGam = gamificationProfiles?.find(
                  (g) => g.uid === u.id,
                );

                return (
                  <div
                    key={u.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-stone-50/80 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 border border-stone-200">
                        <AvatarImage
                          src={getImageSrc(u.photoURL, "")}
                          alt={u.displayName || "Avatar"}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {u.displayName?.[0] || u.email?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-stone-800 truncate">
                            {u.displayName || "Sem nome cadastrado"}
                          </p>
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${
                              active ? "bg-emerald-500" : "bg-rose-400"
                            }`}
                            title={active ? "Conta ativa" : "Conta inativa"}
                          />
                        </div>
                        <p className="text-xs text-stone-400 truncate">
                          {u.email || "Sem e-mail"}
                          {u.phoneNumber && ` • ${u.phoneNumber}`}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-stone-100 text-stone-600">
                            {u.role || "student"}
                          </span>
                          {userEnrs.length > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700">
                              {userEnrs.length}{" "}
                              {userEnrs.length === 1 ? "curso" : "cursos"}
                            </span>
                          )}
                          {userApps.length > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700">
                              {userApps.length}{" "}
                              {userApps.length === 1
                                ? "interesse"
                                : "interesses"}
                            </span>
                          )}
                          {userGam && userGam.totalXp > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary">
                              {userGam.totalXp} XP (Nível {userGam.level})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {u.phoneNumber && (
                        <button
                          type="button"
                          onClick={() =>
                            openWhatsApp(u.phoneNumber, u.displayName)
                          }
                          className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Chamar no WhatsApp"
                        >
                          <MessageCircle size={16} />
                        </button>
                      )}
                      <Button
                        variant="primary"
                        size="sm"
                        rightIcon={<ChevronRight size={14} />}
                        onClick={() => openUser360(u)}
                      >
                        Ficha
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* ========================================================== */}
      {/* TAB 2: INTERESSADOS / LEADS */}
      {/* ========================================================== */}
      {activeTab === "applications" && (
        <Card className="overflow-hidden border border-stone-200 bg-white shadow-xs">
          {loadingApps ? (
            <div className="p-12 text-center text-xs text-stone-400">
              <Loader2
                className="animate-spin mx-auto mb-2 text-primary"
                size={24}
              />
              Carregando candidatos e interessados...
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-400">
              Nenhuma intenção de inscrição registrada.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredApplications.map((app) => {
                const courseTitle =
                  coursesMap[app.courseId]?.title || "Curso não identificado";
                const userObj = users.find((u) => u.id === app.user_id);

                return (
                  <div
                    key={app.id}
                    className="p-4 hover:bg-stone-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-800">
                          {app.userName || "Aluno interessado"}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            app.status === "contacted"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : app.status === "enrolled"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {app.status === "contacted"
                            ? "Contatado"
                            : app.status === "enrolled"
                              ? "Matriculado"
                              : "Pendente"}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">
                        {app.userEmail} {app.userPhone && `• ${app.userPhone}`}
                      </p>
                      <p className="text-xs text-primary font-medium">
                        Interesse no curso: <strong>{courseTitle}</strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {app.userPhone && (
                        <button
                          type="button"
                          onClick={() =>
                            openWhatsApp(
                              app.userPhone,
                              app.userName,
                              courseTitle,
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                        >
                          <MessageCircle size={14} /> WhatsApp
                        </button>
                      )}
                      {app.status !== "contacted" &&
                        app.status !== "enrolled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleContactApp(app.id)}
                          >
                            Marcar Contatado
                          </Button>
                        )}
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={enrollingAppId === app.id}
                        onClick={() => handleEnrollLead(app)}
                      >
                        Matricular / Pix
                      </Button>
                      {userObj && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openUser360(userObj, "applications")}
                        >
                          Ficha
                        </Button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteApp(app.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                        title="Remover interesse"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* ========================================================== */}
      {/* TAB 3: MATRÍCULAS GERAIS */}
      {/* ========================================================== */}
      {activeTab === "enrollments" && (
        <Card className="overflow-hidden border border-stone-200 bg-white shadow-xs">
          {loadingEnrollments ? (
            <div className="p-12 text-center text-xs text-stone-400">
              <Loader2
                className="animate-spin mx-auto mb-2 text-primary"
                size={24}
              />
              Carregando matrículas da plataforma...
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-400">
              Nenhuma matrícula encontrada.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredEnrollments.map((enr) => {
                const user = users.find((u) => u.id === enr.userId);
                const course = coursesList.find((c) => c.id === enr.courseId);

                return (
                  <div
                    key={`${enr.userId}-${enr.courseId}`}
                    className="p-4 hover:bg-stone-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-800">
                          {user?.displayName || user?.email || "Aluno"}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            enr.status === "active"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : enr.status === "pending_approval"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {enr.status === "active"
                            ? "Ativo"
                            : enr.status === "pending_approval"
                              ? "Aprovação Pendente"
                              : enr.status}
                        </span>
                      </div>
                      <p className="text-xs text-primary font-semibold">
                        {course?.title || enr.courseId}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Matriculado em:{" "}
                        {new Date(enr.enrolledAt).toLocaleDateString("pt-BR")}
                        {enr.paymentMethod && ` • Via ${enr.paymentMethod}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      {user && (
                        <Button
                          variant="outline"
                          size="sm"
                          rightIcon={<ChevronRight size={14} />}
                          onClick={() => openUser360(user, "enrollments")}
                        >
                          Ver na Ficha
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* ========================================================== */}
      {/* TAB 4: GAMIFICAÇÃO & XP */}
      {/* ========================================================== */}
      {activeTab === "gamification" && (
        <Card className="overflow-hidden border border-stone-200 bg-white shadow-xs">
          {loadingGamification ? (
            <div className="p-12 text-center text-xs text-stone-400">
              <Loader2
                className="animate-spin mx-auto mb-2 text-primary"
                size={24}
              />
              Carregando perfis de gamificação...
            </div>
          ) : joinedGamification.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-400">
              Nenhum perfil com atividade de gamificação registrado.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {joinedGamification.map((item, index) => (
                <div
                  key={item.uid}
                  className="p-4 hover:bg-stone-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-serif text-sm font-bold text-stone-400">
                      #{index + 1}
                    </span>
                    <Avatar className="h-10 w-10 border border-stone-200">
                      <AvatarImage
                        src={getImageSrc(item.photoURL, "")}
                        alt={item.displayName}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {item.displayName?.[0] || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-stone-800">
                        {item.displayName}
                      </p>
                      <p className="text-xs text-stone-400">{item.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                          <Coins size={12} /> {item.totalXp} XP
                        </span>
                        <span className="text-[11px] font-semibold text-stone-500">
                          • Nível {item.level}
                        </span>
                        {item.badges && item.badges.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Award size={12} /> {item.badges.length}{" "}
                            conquista(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {item.userObj && (
                      <Button
                        variant="outline"
                        size="sm"
                        rightIcon={<ChevronRight size={14} />}
                        onClick={() =>
                          openUser360(item.userObj, "gamification")
                        }
                      >
                        Gerenciar XP na Ficha
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ========================================================== */}
      {/* DRAWER / MODAL DA FICHA 360° DO USUÁRIO */}
      {/* ========================================================== */}
      {selectedUser360 && (
        <Modal
          isOpen
          onClose={() => {
            if (!pixReview && !externalPixApplication) closeUser360();
          }}
          ariaLabel={`Ficha de ${selectedUser360.displayName || selectedUser360.email || "usuário"}`}
          variant="fullscreen"
        >
          <div className={styles.sheet}>
            {/* Header da Ficha */}
            <div className={styles.header}>
              <div className="flex min-w-0 items-start gap-3">
                <Avatar className="h-11 w-11 sm:h-14 sm:w-14 shrink-0 border border-stone-200 shadow-xs">
                  <AvatarImage
                    src={getImageSrc(selectedUser360.photoURL, "")}
                    alt={selectedUser360.displayName || "Avatar"}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {selectedUser360.displayName?.[0] ||
                      selectedUser360.email?.[0] ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Ficha do usuário
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words text-lg sm:text-xl font-bold font-serif text-primary">
                      {selectedUser360.displayName || "Sem nome cadastrado"}
                    </h2>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isUserActive(selectedUser360)
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {isUserActive(selectedUser360) ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <p className="mt-1 break-words text-sm text-stone-600">
                    {selectedUser360.email}{" "}
                    {selectedUser360.phoneNumber &&
                      `• ${selectedUser360.phoneNumber}`}
                  </p>
                  <details className="mt-1 text-xs text-stone-500">
                    <summary className="cursor-pointer">
                      Identificador do usuário
                    </summary>
                    <p className="mt-1 break-all font-mono">
                      {selectedUser360.id}
                    </p>
                  </details>
                </div>
              </div>
              <button
                type="button"
                onClick={closeUser360}
                className={styles.close}
                aria-label="Fechar ficha"
              >
                <X size={20} />
              </button>
            </div>

            {/* Abas Internas da Ficha 360 */}
            <nav className={styles.tabs} aria-label="Seções da ficha">
              <button
                type="button"
                onClick={() => setTab360("access")}
                aria-pressed={tab360 === "access"}
                aria-controls="user-sheet-content"
                className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
                  tab360 === "access"
                    ? "border-primary text-primary font-bold"
                    : "border-transparent text-stone-400 hover:text-stone-700"
                }`}
              >
                <Shield size={14} /> Dados & Acesso
              </button>
              <button
                type="button"
                onClick={() => setTab360("enrollments")}
                aria-pressed={tab360 === "enrollments"}
                aria-controls="user-sheet-content"
                className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
                  tab360 === "enrollments"
                    ? "border-primary text-primary font-bold"
                    : "border-transparent text-stone-400 hover:text-stone-700"
                }`}
              >
                <GraduationCap size={14} /> Matrículas ({userEnrollments.length}
                )
              </button>
              <button
                type="button"
                onClick={() => setTab360("applications")}
                aria-pressed={tab360 === "applications"}
                aria-controls="user-sheet-content"
                className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
                  tab360 === "applications"
                    ? "border-primary text-primary font-bold"
                    : "border-transparent text-stone-400 hover:text-stone-700"
                }`}
              >
                <UserPlus size={14} /> Interesses ({user360Apps.length})
              </button>
              <button
                type="button"
                onClick={() => setTab360("gamification")}
                aria-pressed={tab360 === "gamification"}
                aria-controls="user-sheet-content"
                className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
                  tab360 === "gamification"
                    ? "border-primary text-primary font-bold"
                    : "border-transparent text-stone-400 hover:text-stone-700"
                }`}
              >
                <Trophy size={14} /> Gamificação (
                {user360Gamification?.totalXp || 0} XP)
              </button>
            </nav>

            {/* Conteúdo da Ficha 360 por Aba */}
            <div
              key={tab360}
              id="user-sheet-content"
              className={styles.body}
              data-lenis-prevent
            >
              {/* ABA 1: DADOS & ACESSO */}
              {tab360 === "access" && (
                <div className="space-y-6">
                  {/* Status e Papel */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50/60 p-4 rounded-xl border border-stone-200">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                        Status do Acesso
                      </p>
                      <Button
                        variant={
                          isUserActive(selectedUser360) ? "outline" : "primary"
                        }
                        size="sm"
                        leftIcon={
                          isUserActive(selectedUser360) ? (
                            <UserMinus size={14} />
                          ) : (
                            <UserCheck size={14} />
                          )
                        }
                        onClick={() => handleToggleStatus(selectedUser360)}
                      >
                        {isUserActive(selectedUser360)
                          ? "Desativar Acesso"
                          : "Ativar Acesso"}
                      </Button>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                        Papel no Sistema
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(["student", "tutor", "admin"] as UserRole[]).map(
                          (role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() =>
                                handleRoleChange(selectedUser360, role)
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                                selectedUser360.role === role
                                  ? "bg-primary text-white"
                                  : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-100"
                              }`}
                            >
                              {role === "student"
                                ? "Aluno"
                                : role === "tutor"
                                  ? "Tutor"
                                  : "Admin"}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Edição de Dados Cadastrais & Senha */}
                  <form onSubmit={handleSaveUserEdit} className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Editar Dados e Senha
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleSendAccessEmail(selectedUser360)}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <Mail size={13} /> Enviar link de redefinição por e-mail
                      </button>
                    </div>

                    {editError && (
                      <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                        {editError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="user-sheet-name"
                          className="block text-xs font-medium text-stone-700 mb-1"
                        >
                          Nome Completo
                        </label>
                        <input
                          type="text"
                          id="user-sheet-name"
                          value={editDisplayName}
                          onChange={(e) => setEditDisplayName(e.target.value)}
                          className="w-full rounded-lg border border-stone-200 p-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="user-sheet-phone"
                          className="block text-xs font-medium text-stone-700 mb-1"
                        >
                          Telefone (WhatsApp)
                        </label>
                        <input
                          type="tel"
                          id="user-sheet-phone"
                          value={editPhoneNumber}
                          onChange={(e) => setEditPhoneNumber(e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="w-full rounded-lg border border-stone-200 p-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="user-sheet-email"
                        className="block text-xs font-medium text-stone-700 mb-1"
                      >
                        E-mail de Acesso
                      </label>
                      <input
                        type="email"
                        id="user-sheet-email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full rounded-lg border border-stone-200 p-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="rounded-xl border border-stone-200 bg-stone-50/40 p-3.5 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label
                          htmlFor="user-sheet-password"
                          className="block text-xs font-bold text-stone-700"
                        >
                          Definir Nova Senha Direta
                        </label>
                        <span className="text-[11px] text-stone-400">
                          Opcional (mín. 8 caracteres)
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type={showEditPassword ? "text" : "password"}
                          id="user-sheet-password"
                          autoComplete="new-password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="Digite nova senha para alterar diretamente..."
                          className="w-full rounded-lg border border-stone-200 p-2.5 pr-9 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          aria-label={
                            showEditPassword ? "Ocultar senha" : "Mostrar senha"
                          }
                          aria-pressed={showEditPassword}
                          className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center text-stone-500 hover:text-stone-700"
                        >
                          {showEditPassword ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(selectedUser360)}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 size={13} /> Excluir conta
                      </button>

                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={editLoading}
                      >
                        Salvar Alterações
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* ABA 2: MATRÍCULAS DO USUÁRIO */}
              {tab360 === "enrollments" && (
                <div className="space-y-5">
                  {/* Matricular em Novo Curso */}
                  <div className="flex flex-col sm:flex-row gap-2 items-center bg-stone-50/60 p-3.5 rounded-xl border border-stone-200">
                    <select
                      aria-label="Curso para nova matrícula"
                      value={selectedNewCourse}
                      onChange={(e) => setSelectedNewCourse(e.target.value)}
                      className="w-full sm:flex-1 text-xs rounded-lg border border-stone-200 p-2.5 bg-white"
                    >
                      <option value="">
                        Selecione um curso para matricular...
                      </option>
                      {coursesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Plus size={14} />}
                      disabled={!selectedNewCourse}
                      isLoading={enrollingNewCourse}
                      onClick={handleEnrollInCourse}
                    >
                      Matricular Aluno
                    </Button>
                  </div>

                  {/* Lista de Matrículas */}
                  {loadingUserEnrollments ? (
                    <div className="p-8 text-center text-xs text-stone-400">
                      <Loader2
                        className="animate-spin mx-auto mb-2 text-primary"
                        size={20}
                      />
                      Carregando cursos matriculados...
                    </div>
                  ) : userEnrollments.length === 0 ? (
                    <div className="p-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-xl">
                      Este aluno ainda não possui matrículas ativas ou
                      pendentes.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userEnrollments.map((enr) => {
                        const course = coursesList.find(
                          (c) => c.id === enr.courseId,
                        );
                        return (
                          <EnrollmentCard
                            key={enr.courseId}
                            enrollment={enr}
                            course={course}
                            userId={selectedUser360.id}
                            onReviewed={() =>
                              void loadSelectedUserEnrollments(
                                selectedUser360.id,
                              )
                            }
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ABA 3: INTERESSES / LEADS DO USUÁRIO */}
              {tab360 === "applications" && (
                <div className="space-y-4">
                  {user360Apps.length === 0 ? (
                    <div className="p-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-xl">
                      Nenhuma intenção de inscrição registrada para este
                      usuário.
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-white">
                      {user360Apps.map((app) => {
                        const courseTitle =
                          coursesMap[app.courseId]?.title ||
                          "Curso não identificado";
                        return (
                          <div
                            key={app.id}
                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div>
                              <p className="text-sm font-bold text-stone-800">
                                {courseTitle}
                              </p>
                              <p className="text-xs text-stone-400">
                                Registrado em:{" "}
                                {new Date(app.createdAt).toLocaleDateString(
                                  "pt-BR",
                                )}
                              </p>
                              <span
                                className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                  app.status === "contacted"
                                    ? "bg-blue-50 text-blue-700"
                                    : app.status === "enrolled"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {app.status === "contacted"
                                  ? "Contatado"
                                  : app.status === "enrolled"
                                    ? "Matriculado"
                                    : "Pendente"}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {app.userPhone && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openWhatsApp(
                                      app.userPhone,
                                      selectedUser360.displayName,
                                      courseTitle,
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                                >
                                  <MessageCircle size={14} /> WhatsApp
                                </button>
                              )}
                              {app.status !== "contacted" &&
                                app.status !== "enrolled" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleContactApp(app.id)}
                                  >
                                    Marcar Contatado
                                  </Button>
                                )}
                              <Button
                                variant="primary"
                                size="sm"
                                isLoading={enrollingAppId === app.id}
                                disabled={app.status === "enrolled"}
                                onClick={() => {
                                  setExternalPixApplication({
                                    id: app.id,
                                    courseTitle,
                                  });
                                  setExternalPixConfirmed(false);
                                  setExternalPixError(null);
                                }}
                              >
                                {app.status === "enrolled"
                                  ? "Matriculado"
                                  : "Matricular · Pix externo"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ABA 4: GAMIFICAÇÃO & XP */}
              {tab360 === "gamification" && (
                <div className="space-y-5">
                  {/* Resumo */}
                  <div className="grid grid-cols-3 gap-3 bg-stone-50/60 p-4 rounded-xl border border-stone-200 text-center">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                        Nível
                      </p>
                      <p className="text-xl font-bold text-stone-800">
                        {user360Gamification?.level || 1}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                        Total de XP
                      </p>
                      <p className="text-xl font-bold text-primary">
                        {user360Gamification?.totalXp || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                        Sequência (Streak)
                      </p>
                      <p className="text-xl font-bold text-amber-600">
                        {user360Gamification?.currentStreak || 0} dias
                      </p>
                    </div>
                  </div>

                  {/* Conceder XP */}
                  <form
                    onSubmit={handleAwardXpSubmit}
                    className="p-4 rounded-xl border border-stone-200 space-y-3 bg-white"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Conceder XP Manual
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="number"
                        aria-label="Quantidade de XP"
                        placeholder="Quantidade de XP (ex: 100)"
                        value={manualXpAmount}
                        onChange={(e) => setManualXpAmount(e.target.value)}
                        className="rounded-lg border border-stone-200 p-2 text-xs focus:ring-1 focus:ring-primary"
                        required
                      />
                      <input
                        type="text"
                        aria-label="Motivo da concessão de XP"
                        placeholder="Motivo (ex: Participação especial)"
                        value={manualXpReason}
                        onChange={(e) => setManualXpReason(e.target.value)}
                        className="rounded-lg border border-stone-200 p-2 text-xs focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={awardingXp}
                    >
                      Conceder XP
                    </Button>
                  </form>

                  {/* Conceder Conquista/Medalha */}
                  <form
                    onSubmit={handleAwardBadgeSubmit}
                    className="p-4 rounded-xl border border-stone-200 space-y-3 bg-white"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Atribuir Medalha / Conquista
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        aria-label="Medalha ou conquista"
                        value={manualBadgeId}
                        onChange={(e) => setManualBadgeId(e.target.value)}
                        className="flex-1 rounded-lg border border-stone-200 p-2 text-xs bg-white"
                      >
                        {BADGE_DEFINITIONS.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.title} — {b.description} ({b.xpValue} XP)
                          </option>
                        ))}
                      </select>
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        isLoading={awardingBadge}
                      >
                        Atribuir Medalha
                      </Button>
                    </div>
                  </form>

                  {/* Medalhas Conquistadas */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Medalhas Desbloqueadas (
                      {user360Gamification?.badges?.length || 0})
                    </p>
                    {!user360Gamification?.badges ||
                    user360Gamification.badges.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">
                        Nenhuma medalha conquistada ainda.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {user360Gamification.badges.map((badgeId: string) => {
                          const def = BADGE_DEFINITIONS.find(
                            (b) => b.id === badgeId,
                          );
                          return (
                            <div
                              key={badgeId}
                              className="flex items-center gap-2.5 p-2.5 rounded-lg border border-stone-200 bg-stone-50/60"
                            >
                              <div className="p-1.5 rounded-full bg-amber-100 text-amber-800">
                                <Award size={16} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-stone-800">
                                  {def?.title || badgeId}
                                </p>
                                <p className="text-[10px] text-stone-400">
                                  {def?.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {externalPixApplication && (
        <Modal
          isOpen
          onClose={() => {
            if (!enrollingAppId) setExternalPixApplication(null);
          }}
          ariaLabel="Confirmar matrícula com Pix externo"
          variant="fullscreen"
        >
          <div className={`${styles.sheet} !max-w-lg`}>
            <div className={styles.header}>
              <h2 className="font-serif text-lg font-bold text-primary">
                Matricular com Pix externo
              </h2>
              <button
                type="button"
                className={styles.close}
                disabled={!!enrollingAppId}
                onClick={() => setExternalPixApplication(null)}
                aria-label="Fechar confirmação de Pix externo"
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.body} data-lenis-prevent>
              <p className="text-sm text-stone-600">
                Confirme o recebimento do Pix para liberar o acesso ao curso.
              </p>
              <div className="my-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
                <p className="break-words text-sm font-semibold text-stone-800">
                  {selectedUser360?.displayName ||
                    selectedUser360?.email ||
                    "Usuário"}
                </p>
                <p className="mt-1 break-words text-sm text-stone-600">
                  {externalPixApplication.courseTitle}
                </p>
              </div>
              <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3 text-sm text-stone-700">
                <input
                  type="checkbox"
                  className="mt-0.5 !min-h-0 h-5 w-5 shrink-0 accent-primary"
                  checked={externalPixConfirmed}
                  disabled={!!enrollingAppId}
                  onChange={(event) =>
                    setExternalPixConfirmed(event.target.checked)
                  }
                />
                <span>
                  Confirmo que o Pix foi recebido fora do sistema de pagamento.
                </span>
              </label>
              <p className="mt-3 text-xs text-stone-500">
                A confirmação será registrada com o administrador responsável.
                Nenhuma nova cobrança será gerada.
              </p>
              {externalPixError && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
                >
                  {externalPixError}
                </p>
              )}
              <div className="mt-5 flex flex-wrap justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!!enrollingAppId}
                  onClick={() => setExternalPixApplication(null)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  disabled={!externalPixConfirmed}
                  isLoading={!!enrollingAppId}
                  onClick={handleExternalPixEnrollment}
                >
                  Confirmar e matricular
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Pix Review Panel */}
      {pixReview && (
        <Modal
          isOpen
          onClose={() => setPixReview(null)}
          ariaLabel="Conferência de Comprovante Pix"
          variant="fullscreen"
        >
          <div className={`${styles.sheet} !max-w-lg`}>
            <div className={styles.body} data-lenis-prevent>
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-100">
                <h3 className="font-serif font-bold text-lg text-primary">
                  Conferência de Comprovante Pix
                </h3>
                <button
                  type="button"
                  onClick={() => setPixReview(null)}
                  className={styles.close}
                  aria-label="Fechar conferência Pix"
                >
                  <X size={18} />
                </button>
              </div>
              <PixReviewPanel
                userId={pixReview.userId}
                courseId={pixReview.courseId}
                onReviewed={() => {
                  setPixReview(null);
                  void loadApplications();
                  void loadEnrollments();
                }}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Batch Enroll Modal */}
      <BatchEnrollModal
        isOpen={isBatchOpen}
        onClose={() => {
          setIsBatchOpen(false);
          void loadEnrollments();
        }}
        courses={coursesList}
      />
    </div>
  );
}

export default function UsersManagerPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-stone-400">
          <Loader2
            className="animate-spin mx-auto mb-2 text-primary"
            size={24}
          />
          Carregando Gestão de Pessoas...
        </div>
      }
    >
      <UsersManagerClient />
    </Suspense>
  );
}
