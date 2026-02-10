"use client";

import { useAllUsers, useAllUsersPaginated } from "@/hooks/useUsers";
import { UserRole, UserStatus } from "@/types/user";
import { CheckCircle, Ban, Eye } from "lucide-react";
import { useTransition, useState } from "react";
import { useToast } from "@/context/ToastContext";
import {
  toggleUserStatus,
  updateUserRole,
} from "@/app/actions/user-management";
import { impersonateUser } from "@/actions/authAdmin";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/components/admin/DataTable";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default function UsersPage() {
  const [pageSize] = useState(20);
  const [pageStack, setPageStack] = useState<any[]>([]); // Stack of 'lastVisible' snapshots
  const [currentPage, setCurrentPage] = useState(1);

  // The 'lastDoc' for the current query is the top of the stack (or undefined for page 1)
  const lastDoc =
    pageStack.length > 0 ? pageStack[pageStack.length - 1] : undefined;

  const { data, isLoading, refetch } = useAllUsersPaginated(pageSize, lastDoc);
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const users = data?.users || [];
  const hasMore = data?.hasMore || false;

  const handleNextPage = () => {
    if (data?.lastVisible) {
      setPageStack((prev) => [...prev, data.lastVisible]);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (pageStack.length > 0) {
      setPageStack((prev) => prev.slice(0, -1));
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleRoleChange = (uid: string, newRole: UserRole) => {
    if (
      !confirm(
        `Tem certeza que deseja alterar o papel deste usuário para ${newRole}?`,
      )
    )
      return;

    startTransition(async () => {
      const result = await updateUserRole(uid, newRole);
      if (result.success) {
        addToast("Função atualizada com sucesso!", "success");
        refetch();
      } else {
        addToast(result.error || "Erro ao atualizar função.", "error");
      }
    });
  };

  const handleStatusChange = (uid: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === "disabled" ? "active" : "disabled";
    const action = newStatus === "disabled" ? "DESATIVAR" : "REATIVAR";

    const reason =
      newStatus === "disabled"
        ? prompt("Motivo da desativação (opcional):")
        : undefined;
    if (newStatus === "disabled" && reason === null) return;

    if (!confirm(`Tem certeza que deseja ${action} este usuário?`)) return;

    startTransition(async () => {
      const result = await toggleUserStatus(
        uid,
        newStatus,
        reason || undefined,
      );
      if (result.success) {
        addToast(
          `Usuário ${newStatus === "disabled" ? "desativado" : "ativado"} com sucesso!`,
          "success",
        );
        refetch();
      } else {
        addToast(result.error || "Erro ao alterar status.", "error");
      }
    });
  };

  const handleImpersonate = (uid: string) => {
    if (
      !confirm(
        "Deseja acessar o sistema como este usuário? A ação será registrada no log de auditoria.",
      )
    )
      return;

    startTransition(async () => {
      const result = await impersonateUser(uid);
      if (result.success) {
        window.location.href = "/portal";
      } else {
        addToast(result.error || "Erro ao iniciar impersonation.", "error");
      }
    });
  };

  const columns: Column<any>[] = [
    {
      key: "user",
      label: "Usuário",
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 border border-stone-100">
            <AvatarImage src={user.photoURL} alt={user.displayName} />
            <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold text-stone-800">
              {user.displayName || "Sem nome"}
            </div>
            <div className="text-xs text-stone-400">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Papel",
      render: (user) => (
        <select
          value={user.role || "student"}
          onChange={(e) =>
            handleRoleChange(user.uid, e.target.value as UserRole)
          }
          disabled={isPending}
          className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold border-none cursor-pointer focus:ring-2 focus:ring-primary/20 transition-all uppercase tracking-wider",
            user.role === "admin"
              ? "bg-purple-100 text-purple-700"
              : user.role === "tutor"
                ? "bg-blue-100 text-blue-700"
                : "bg-stone-100 text-stone-600",
          )}
        >
          <option value="student">ALUNO</option>
          <option value="tutor">TUTOR</option>
          <option value="admin">ADMIN</option>
        </select>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (user) => (
        <Badge
          variant={user.status === "disabled" ? "destructive" : "success"}
          className="gap-1.5"
        >
          <span
            className={cn(
              "w-1 h-1 rounded-full",
              user.status === "disabled" ? "bg-red-500" : "bg-green-500",
            )}
          />
          {user.status === "disabled" ? "Bloqueado" : "Ativo"}
        </Badge>
      ),
    },
    {
      key: "lastLogin",
      label: "Acesso",
      render: (user) => (
        <div className="text-xs">
          <p className="text-stone-600 font-medium">
            {user.lastLogin
              ? new Date(user.lastLogin.seconds * 1000).toLocaleDateString()
              : "Nunca"}
          </p>
          <p className="text-[10px] text-stone-400 uppercase">Último Login</p>
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Gestão de Usuários"
      description="Controle de acesso, funções e status dos usuários. Todas as ações são auditadas."
      breadcrumbs={[{ label: "Usuários" }]}
    >
      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        searchKey="email"
        searchPlaceholder="Buscar por e-mail..."
        pageSize={pageSize}
        manualPagination={true}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        hasMore={hasMore}
        isFirstPage={currentPage === 1}
        actions={(user) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() =>
                handleStatusChange(user.uid, user.status || "active")
              }
              disabled={isPending}
              className={cn(
                "p-2 rounded-xl transition-all",
                user.status === "disabled"
                  ? "text-green-600 hover:bg-green-50"
                  : "text-stone-400 hover:text-red-500 hover:bg-red-50",
              )}
              title={
                user.status === "disabled"
                  ? "Reativar Usuário"
                  : "Bloquear Usuário"
              }
            >
              {user.status === "disabled" ? (
                <CheckCircle size={18} />
              ) : (
                <Ban size={18} />
              )}
            </button>

            {user.role !== "admin" && (
              <button
                onClick={() => handleImpersonate(user.uid)}
                disabled={isPending || user.status === "disabled"}
                className="p-2 text-stone-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                title="Ver como este usuário"
              >
                <Eye size={18} />
              </button>
            )}
          </div>
        )}
      />
    </AdminPageShell>
  );
}
