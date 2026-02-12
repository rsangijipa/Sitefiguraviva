"use client";

import { useState, useEffect } from "react";
import {
  Search,
  User,
  Shield,
  UserCheck,
  UserMinus,
  ChevronRight,
  RefreshCcw,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  toggleUserStatus as toggleUserStatusAction,
  updateUserRole,
  listUsersForAdmin,
} from "@/app/actions/user-management";
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
  createdAt?: { seconds?: number };
  profileCompletion?: number;
  phoneNumber?: string | null;
};

const isUserActive = (user: AdminUser) => {
  if (typeof user.isActive === "boolean") return user.isActive;
  if (user.status === "disabled") return false;
  return true;
};

export default function UsersManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { addToast } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    setLoadingError(null);
    const all: AdminUser[] = [];
    let token: string | undefined;

    for (let i = 0; i < 10; i++) {
      const res = await listUsersForAdmin(token, 100);
      if (!res.success) {
        const msg = res.error || "Erro ao listar usuários.";
        setLoadingError(msg);
        addToast(msg, "error");
        break;
      }

      all.push(...(res.users as AdminUser[]));
      token = (res.nextPageToken || undefined) as string | undefined;
      if (!token) break;
    }

    setUsers(all);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.uid?.includes(searchTerm);

    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const active = isUserActive(u);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && active) ||
      (statusFilter === "inactive" && !active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeCount = users.filter((u) => isUserActive(u)).length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const profileReadyCount = users.filter(
    (u) => (u.profileCompletion || 0) >= 100,
  ).length;

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const next = currentStatus ? "disabled" : "active";
      const result = await toggleUserStatusAction(userId, next);
      if (!result.success) {
        addToast(result.error || "Erro ao atualizar status.", "error");
        return;
      }
      addToast(
        `Usuário ${!currentStatus ? "ativado" : "desativado"} com sucesso.`,
        "success",
      );
    } catch (error) {
      console.error(error);
      addToast("Erro ao atualizar status.", "error");
    }
  };

  const changeUserRole = async (userId: string, currentRole?: string) => {
    const newRole = currentRole === "admin" ? "student" : "admin";
    if (!confirm(`Deseja alterar o cargo para ${newRole}?`)) return;

    try {
      const result = await updateUserRole(userId, newRole as UserRole);
      if (!result.success) {
        addToast(result.error || "Erro ao alterar cargo.", "error");
        return;
      }
      addToast(`Cargo alterado para ${newRole}.`, "success");
    } catch (error) {
      console.error(error);
      addToast("Erro ao alterar cargo.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-primary">
            Gerenciar Usuários
          </h1>
          <p className="text-stone-400 text-sm">
            Controle de acessos e perfis da plataforma
          </p>
        </div>
        <Button
          variant="outline"
          leftIcon={<RefreshCcw size={14} />}
          onClick={loadUsers}
          isLoading={loading}
        >
          Atualizar
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white border border-stone-100 rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
            Total de contas
          </p>
          <p className="text-2xl font-bold text-stone-800 mt-1">
            {users.length}
          </p>
        </div>
        <div className="bg-white border border-stone-100 rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
            Ativos / Admins
          </p>
          <p className="text-2xl font-bold text-stone-800 mt-1">
            {activeCount}{" "}
            <span className="text-sm text-stone-400">/ {adminCount}</span>
          </p>
        </div>
        <div className="bg-white border border-stone-100 rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
            Cadastros completos
          </p>
          <p className="text-2xl font-bold text-stone-800 mt-1">
            {profileReadyCount}
          </p>
        </div>
      </div>

      {loadingError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2 text-amber-800">
          <AlertTriangle size={16} className="mt-0.5" />
          <p className="text-sm">
            {loadingError}. Você pode tentar novamente pelo botão "Atualizar".
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-12 gap-6">
        {/* Filters bar */}
        <div className="md:col-span-12 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              size={18}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, email ou UID..."
              className="w-full bg-stone-50 border border-stone-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:border-gold outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl text-sm outline-none focus:border-gold"
            >
              <option value="all">Todos os Cargos</option>
              <option value="student">Aluno</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl text-sm outline-none focus:border-gold"
            >
              <option value="all">Todos Status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>

        {/* Users List */}
        <div className="md:col-span-12">
          <Card className="border-stone-100 shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-left border-b border-stone-100">
                    <th className="p-4 text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                      Usuário
                    </th>
                    <th className="p-4 text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                      Cargo
                    </th>
                    <th className="p-4 text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                      Status
                    </th>
                    <th className="p-4 text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                      Cadastro
                    </th>
                    <th className="p-4 text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                      Perfil
                    </th>
                    <th className="p-4 text-[10px] uppercase tracking-widest text-stone-400 font-bold text-right">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const active = isUserActive(user);
                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-stone-50/50 transition-colors group"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0 border border-stone-200 overflow-hidden">
                                {user.photoURL ? (
                                  <img
                                    src={user.photoURL}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User size={18} className="text-stone-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-primary truncate">
                                  {user.displayName || "Sem Nome"}
                                </p>
                                <p className="text-[10px] text-stone-400 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                user.role === "admin"
                                  ? "bg-gold/10 text-gold border border-gold/20"
                                  : "bg-stone-100 text-stone-500 border border-stone-200"
                              }`}
                            >
                              {user.role || "aluno"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${active ? "bg-green-500" : "bg-red-500"}`}
                              />
                              <span className="text-xs text-stone-600">
                                {active ? "Ativo" : "Inativo"}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-xs text-stone-500">
                              {user.createdAt?.seconds
                                ? new Date(
                                    user.createdAt.seconds * 1000,
                                  ).toLocaleDateString("pt-BR")
                                : "---"}
                            </p>
                          </td>
                          <td className="p-4">
                            {(user.profileCompletion || 0) >= 100 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 border border-green-100 px-2 py-1 rounded-md">
                                <BadgeCheck size={12} /> Completo
                              </span>
                            ) : (
                              <span className="text-xs text-stone-500">
                                {user.profileCompletion || 0}%
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  changeUserRole(user.id, user.role)
                                }
                                className="h-8 w-8 p-0"
                                title="Mudar Cargo"
                              >
                                <Shield size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  toggleUserStatus(user.id, active)
                                }
                                className={`h-8 w-8 p-0 ${active ? "text-red-500 hover:bg-red-50" : "text-green-500 hover:bg-green-50"}`}
                                title={active ? "Desativar" : "Ativar"}
                              >
                                {active ? (
                                  <UserMinus size={14} />
                                ) : (
                                  <UserCheck size={14} />
                                )}
                              </Button>
                              <ChevronRight
                                size={16}
                                className="text-stone-300 group-hover:translate-x-1 transition-transform"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-12 text-center text-stone-400 italic"
                      >
                        {loading
                          ? "Carregando usuários..."
                          : "Nenhum usuário encontrado com os filtros atuais."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
