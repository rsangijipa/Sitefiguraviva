"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/client";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  User,
  Clock,
  Phone,
  Mail,
  GraduationCap,
  Check,
  MessageCircle,
  UserPlus,
  Trash2,
  Calendar,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { enrollLead } from "@/actions/adminEnrollment";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Record<string, any>>({});
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const q = query(
      collection(db, "applications"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const apps = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Fetch course titles if missing
      const newCourseIds = apps
        .map((a: any) => a.courseId)
        .filter((id) => id && !courses[id]);

      if (newCourseIds.length > 0) {
        const courseData = { ...courses };
        await Promise.all(
          newCourseIds.map(async (id) => {
            const snap = await getDoc(doc(db, "courses", id));
            if (snap.exists()) courseData[id] = snap.data();
          }),
        );
        setCourses(courseData);
      }

      setApplications(apps);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [courses]);

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "applications", appId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      addToast(`Status atualizado para ${newStatus}`, "success");
    } catch (error) {
      console.error(error);
      addToast("Erro ao atualizar status", "error");
    }
  };

  const handleEnroll = async (app: any) => {
    setEnrollingId(app.id);
    try {
      const courseName = courses[app.courseId]?.title || "Curso";

      const result = await enrollLead(app.id, {
        email: app.userEmail,
        name: app.answers?.fullName || app.userName || "Aluno sem nome",
        phone: app.answers?.phone || app.userPhone,
        courseId: app.courseId,
        courseName: courseName,
      });

      if (result.error) {
        addToast(`Erro: ${result.error}`, "error");
        return;
      }

      if (result.isNewUser) {
        addToast("Novo usuário criado e matriculado com sucesso!", "success");
      } else {
        addToast("Matrícula realizada com sucesso!", "success");
      }
    } catch (error) {
      console.error(error);
      addToast("Erro ao realizar matrícula", "error");
    } finally {
      setEnrollingId(null);
    }
  };

  const openWhatsApp = (phone: string, name: string, courseName: string) => {
    const cleanPhone = phone?.replace(/\D/g, "") || "";
    const message = encodeURIComponent(
      `Olá ${name}! 👋\n\nVi que você demonstrou interesse no curso "${courseName}" do Instituto Figura Viva.\n\nGostaria de saber mais sobre sua inscrição?`,
    );
    const url = `https://wa.me/55${cleanPhone}?text=${message}`;
    window.open(url, "_blank");
  };

  const handleDelete = async (appId: string, appName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o interesse de "${appName}"?`))
      return;

    setDeletingId(appId);
    try {
      await deleteDoc(doc(db, "applications", appId));
      addToast("Interesse excluído com sucesso", "success");
    } catch (error) {
      console.error(error);
      addToast("Erro ao excluir interesse", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const columns: Column<any>[] = [
    {
      key: "user",
      label: "Interessado",
      render: (app) => {
        const name = app.answers?.fullName || app.userName || "Sem nome";
        return (
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-stone-100">
              <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                {name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-stone-800">{name}</div>
              <div className="text-xs text-stone-400">{app.userEmail}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "courseId",
      label: "Curso",
      render: (app) => (
        <div className="flex items-center gap-2">
          <GraduationCap size={14} className="text-gold" />
          <span className="text-xs font-medium text-stone-600 truncate max-w-[150px]">
            {courses[app.courseId]?.title || "Curso"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (app) => {
        const statusMap: Record<
          string,
          { label: string; variant: any; color: string }
        > = {
          submitted: {
            label: "Aguardando",
            variant: "warning",
            color: "bg-yellow-500",
          },
          contacted: {
            label: "Contatado",
            variant: "secondary",
            color: "bg-blue-500",
          },
          enrolled: {
            label: "Matriculado",
            variant: "success",
            color: "bg-green-500",
          },
          default: {
            label: app.status || "Novo",
            variant: "outline",
            color: "bg-stone-300",
          },
        };
        const s = statusMap[app.status] || statusMap.default;
        return (
          <Badge variant={s.variant} className="gap-1.5">
            <span className={cn("w-1 h-1 rounded-full", s.color)} />
            {s.label}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      label: "Data",
      render: (app) => {
        const date = app.createdAt?.toDate?.();
        return (
          <div className="text-xs text-stone-500">
            <div className="font-medium text-stone-700">
              {date ? date.toLocaleDateString("pt-BR") : "Recentemente"}
            </div>
            <div className="uppercase text-[9px] opacity-60">
              {date
                ? date.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <AdminPageShell
      title="Interessados & Inscrições"
      description="Gerencie leads e solicitações de matrícula dos cursos."
      breadcrumbs={[{ label: "Inscrições" }]}
    >
      <DataTable
        data={applications}
        columns={columns}
        isLoading={loading}
        searchKey="userEmail"
        searchPlaceholder="Buscar por e-mail ou nome..."
        actions={(app) => {
          const phone = app.answers?.phone || app.userPhone;
          const name = app.answers?.fullName || app.userName || "Sem nome";
          const courseName = courses[app.courseId]?.title || "Curso";

          return (
            <div className="flex items-center justify-end gap-1">
              {phone && (
                <button
                  onClick={() => openWhatsApp(phone, name, courseName)}
                  className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                  title="Chamar no WhatsApp"
                >
                  <MessageCircle size={18} />
                </button>
              )}

              {app.status !== "enrolled" && (
                <>
                  {app.status !== "contacted" && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, "contacted")}
                      className="p-2 text-stone-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      title="Marcar como Contatado"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleEnroll(app)}
                    disabled={enrollingId === app.id}
                    className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                    title="Matricular Aluno"
                  >
                    {enrollingId === app.id ? (
                      <Clock size={18} className="animate-spin" />
                    ) : (
                      <UserPlus size={18} />
                    )}
                  </button>
                </>
              )}

              <button
                onClick={() => handleDelete(app.id, name)}
                disabled={deletingId === app.id}
                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Excluir"
              >
                {deletingId === app.id ? (
                  <Clock size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            </div>
          );
        }}
      />
    </AdminPageShell>
  );
}
