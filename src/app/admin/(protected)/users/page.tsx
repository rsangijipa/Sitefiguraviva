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
} from "firebase/firestore";
import {
  Search,
  User,
  Shield,
  MoreVertical,
  UserCheck,
  UserMinus,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function UsersManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { addToast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(docs);
    });
    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.uid?.includes(searchTerm);

    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.isActive !== false) ||
      (statusFilter === "inactive" && u.isActive === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isActive: !currentStatus,
        updatedAt: serverTimestamp(),
      });
      addToast(
        `Usuário ${!currentStatus ? "ativado" : "desativado"} com sucesso.`,
        "success",
      );
    } catch (error) {
      console.error(error);
      addToast("Erro ao atualizar status.", "error");
    }
  };

  const changeUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "student" : "admin";
    if (!confirm(`Deseja alterar o cargo para ${newRole}?`)) return;

    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
        updatedAt: serverTimestamp(),
      });
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
      </header>

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
                    <th className="p-4 text-[10px] uppercase tracking-widest text-stone-400 font-bold text-right">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
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
                              className={`w-2 h-2 rounded-full ${user.isActive !== false ? "bg-green-500" : "bg-red-500"}`}
                            />
                            <span className="text-xs text-stone-600">
                              {user.isActive !== false ? "Ativo" : "Inativo"}
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
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => changeUserRole(user.id, user.role)}
                              className="h-8 w-8 p-0"
                              title="Mudar Cargo"
                            >
                              <Shield size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                toggleUserStatus(
                                  user.id,
                                  user.isActive !== false,
                                )
                              }
                              className={`h-8 w-8 p-0 ${user.isActive !== false ? "text-red-500 hover:bg-red-50" : "text-green-500 hover:bg-green-50"}`}
                              title={
                                user.isActive !== false ? "Desativar" : "Ativar"
                              }
                            >
                              {user.isActive !== false ? (
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
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-12 text-center text-stone-400 italic"
                      >
                        Nenhum usuário encontrado com os filtros atuais.
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
