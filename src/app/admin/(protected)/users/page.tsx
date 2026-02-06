"use client";

import { useAllUsers } from '@/hooks/useUsers';
import { UserRole, UserStatus } from '@/types/user';
import { Loader2, Search, User as UserIcon, Shield, Ban, CheckCircle, Filter } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useToast } from '@/context/ToastContext';
import { toggleUserStatus, updateUserRole } from '@/app/actions/user-management';
import { impersonateUser } from '@/actions/authAdmin';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
    const { data: users, isLoading, refetch } = useAllUsers();
    const { addToast } = useToast();
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'All' | UserRole>('All');
    const [statusFilter, setStatusFilter] = useState<'All' | UserStatus>('All');

    const handleRoleChange = (uid: string, newRole: UserRole) => {
        if (!confirm(`Tem certeza que deseja alterar o papel deste usuário para ${newRole}?`)) return;

        startTransition(async () => {
            const result = await updateUserRole(uid, newRole);
            if (result.success) {
                addToast('Função atualizada com sucesso!', 'success');
                refetch();
            } else {
                addToast(result.error || 'Erro ao atualizar função.', 'error');
            }
        });
    };

    const handleStatusChange = (uid: string, currentStatus: UserStatus) => {
        const newStatus = currentStatus === 'disabled' ? 'active' : 'disabled';
        const action = newStatus === 'disabled' ? 'DESATIVAR' : 'REATIVAR';

        const reason = newStatus === 'disabled' ? prompt("Motivo da desativação (opcional):") : undefined;
        if (newStatus === 'disabled' && reason === null) return; // Cancelled

        if (!confirm(`Tem certeza que deseja ${action} este usuário?`)) return;

        startTransition(async () => {
            const result = await toggleUserStatus(uid, newStatus, reason || undefined);
            if (result.success) {
                addToast(`Usuário ${newStatus === 'disabled' ? 'desativado' : 'ativado'} com sucesso!`, 'success');
                refetch();
            } else {
                addToast(result.error || 'Erro ao alterar status.', 'error');
            }
        });
    };

    const handleImpersonate = (uid: string) => {
        if (!confirm('Deseja acessar o sistema como este usuário? A ação será registrada no log de auditoria.')) return;

        startTransition(async () => {
            const result = await impersonateUser(uid);
            if (result.success) {
                // Force full reload to apply new cookie
                window.location.href = '/portal';
            } else {
                addToast(result.error || 'Erro ao iniciar impersonation.', 'error');
            }
        });
    };

    const filteredUsers = users?.filter(user => {
        const matchesSearch = (user.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        // Default status is active if undefined
        const userStatus = user.status || 'active';
        const matchesStatus = statusFilter === 'All' || userStatus === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    }) || [];

    // Sort: Created Desc (Newest first)
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        // Handle potentially missing createdAt
        const tA = a.createdAt?.seconds || 0;
        const tB = b.createdAt?.seconds || 0;
        return tB - tA;
    });

    return (
        <div className="space-y-8 pb-20">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="text-gold" size={32} />
                    <h3 className="font-serif text-3xl text-primary">Gestão de Usuários</h3>
                </div>
                <p className="text-primary/40 text-sm max-w-lg">
                    Controle de acesso, funções e status dos usuários. Todas as ações são auditadas.
                </p>
            </header>

            {/* Filters & Search */}
            <div className="bg-white/40 backdrop-blur-md p-4 md:p-6 rounded-[2rem] border border-stone-200/60 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-stone-200 focus-within:ring-2 focus-within:ring-gold/20 transition-all">
                        <Search className="text-stone-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou e-mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder-stone-400 text-primary"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as any)}
                            className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-600 focus:outline-none focus:border-gold cursor-pointer w-full"
                        >
                            <option value="All">Todos os Papéis</option>
                            <option value="student">Aluno</option>
                            <option value="tutor">Tutor</option>
                            <option value="admin">Admin</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-600 focus:outline-none focus:border-gold cursor-pointer w-full"
                        >
                            <option value="All">Todos os Status</option>
                            <option value="active">Ativo</option>
                            <option value="disabled">Desativado</option>
                        </select>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-gold" size={40} />
                </div>
            ) : (
                <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-stone-50/50 border-b border-stone-100">
                                <tr>
                                    <th className="text-left py-4 px-6 text-[10px] uppercase tracking-widest text-primary/40 font-bold">Usuário</th>
                                    <th className="text-left py-4 px-6 text-[10px] uppercase tracking-widest text-primary/40 font-bold">Papel</th>
                                    <th className="text-left py-4 px-6 text-[10px] uppercase tracking-widest text-primary/40 font-bold">Status</th>
                                    <th className="text-left py-4 px-6 text-[10px] uppercase tracking-widest text-primary/40 font-bold">Acesso</th>
                                    <th className="text-right py-4 px-6 text-[10px] uppercase tracking-widest text-primary/40 font-bold">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {sortedUsers.map((user) => (
                                    <tr key={user.uid} className={`hover:bg-white/50 transition-colors ${user.status === 'disabled' ? 'bg-red-50/30' : ''}`}>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                {user.photoURL ? (
                                                    <img src={user.photoURL} alt={user.displayName || ''} className="w-9 h-9 rounded-full object-cover border border-stone-100" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                                                        <UserIcon size={16} />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-sm text-primary">{user.displayName || 'Sem nome'}</div>
                                                    <div className="text-xs text-stone-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <select
                                                value={user.role || 'student'}
                                                onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                                                disabled={isPending}
                                                className={`
                                                    px-3 py-1 rounded-full text-[10px] font-bold border-none cursor-pointer focus:ring-2 focus:ring-gold/20 transition-all uppercase tracking-wider
                                                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                        user.role === 'tutor' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-stone-100 text-stone-600'}
                                                `}
                                            >
                                                <option value="student">ALUNO</option>
                                                <option value="tutor">TUTOR</option>
                                                <option value="admin">ADMIN</option>
                                            </select>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`
                                                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                ${user.status === 'disabled' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}
                                            `}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'disabled' ? 'bg-red-600' : 'bg-green-600'}`} />
                                                {user.status === 'disabled' ? 'Bloqueado' : 'Ativo'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-xs text-stone-500">
                                                {user.lastLogin ? new Date(user.lastLogin.seconds * 1000).toLocaleDateString() : 'Nunca'}
                                                <div className="text-[10px] text-stone-400">Último Login</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleStatusChange(user.uid, user.status || 'active')}
                                                disabled={isPending}
                                                className={`
                                                    p-2 rounded-lg transition-colors
                                                    ${user.status === 'disabled'
                                                        ? 'text-green-600 hover:bg-green-50'
                                                        : 'text-stone-400 hover:text-red-500 hover:bg-red-50'}
                                                `}
                                                title={user.status === 'disabled' ? 'Reativar Usuário' : 'Bloquear Usuário'}
                                            >
                                                {user.status === 'disabled' ? <CheckCircle size={18} /> : <Ban size={18} />}
                                            </button>

                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleImpersonate(user.uid)}
                                                    disabled={isPending || user.status === 'disabled'}
                                                    className="p-2 text-stone-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Ver como este usuário"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredUsers.length === 0 && (
                            <div className="py-12 text-center text-stone-400 text-sm">
                                Nenhum usuário encontrado com os filtros atuais.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
