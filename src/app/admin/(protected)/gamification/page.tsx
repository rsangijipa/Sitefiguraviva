"use client";

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable, Column } from "@/components/admin/DataTable";
import { useAllGamificationProfiles } from "@/hooks/useAdminGamification";
import { useAllUsers } from "@/hooks/useUsers";
import { Trophy, Award, Coins } from "lucide-react";
import { useTransition } from "react";
import { useToast } from "@/context/ToastContext";
import {
  awardManualXp,
  awardManualBadge,
} from "@/app/actions/gamification-admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { BADGE_DEFINITIONS } from "@/lib/gamification";
import { cn } from "@/lib/utils";

export default function GamificationAdminPage() {
  const {
    data: profiles,
    isLoading: profilesLoading,
    refetch,
  } = useAllGamificationProfiles();
  const { data: users, isLoading: usersLoading } = useAllUsers();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const isLoading = profilesLoading || usersLoading;

  // Join data: profile + user info
  const joinedData =
    profiles?.map((profile) => {
      const user = users?.find((u) => u.uid === profile.uid);
      return {
        ...profile,
        displayName: user?.displayName || "Sem nome",
        email: user?.email || "-",
        photoURL: user?.photoURL,
      };
    }) || [];

  const handleAwardXp = (userId: string) => {
    const amount = prompt("Quantidade de XP (ex: 100):");
    if (!amount || isNaN(Number(amount))) return;

    const reason = prompt("Motivo da premiação:");
    if (!reason) return;

    startTransition(async () => {
      const result = await awardManualXp(userId, Number(amount), reason);
      if (result.success) {
        addToast("XP concedido com sucesso!", "success");
        refetch();
      } else {
        addToast(result.error || "Erro ao conceder XP", "error");
      }
    });
  };

  const handleAwardBadge = (userId: string) => {
    // Simple badge selection
    const badgeId = prompt(
      `ID da conquista (${BADGE_DEFINITIONS.map((b) => b.id).join(", ")}):`,
    );
    if (!badgeId || !BADGE_DEFINITIONS.find((b) => b.id === badgeId)) {
      addToast("ID de conquista inválido", "error");
      return;
    }

    startTransition(async () => {
      const result = await awardManualBadge(userId, badgeId);
      if (result.success) {
        addToast("Conquista concedida com sucesso!", "success");
        refetch();
      } else {
        addToast(result.error || "Erro ao conceder conquista", "error");
      }
    });
  };

  const columns: Column<any>[] = [
    {
      key: "user",
      label: "Usuário",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={row.photoURL} alt={row.displayName} />
            <AvatarFallback>{row.displayName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold text-stone-800 text-sm">
              {row.displayName}
            </div>
            <div className="text-[10px] text-stone-400">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "level",
      label: "Nível",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-xs ring-2 ring-gold/5">
            {row.level}
          </div>
          <span className="text-xs font-medium text-stone-500">
            {row.totalXp} XP
          </span>
        </div>
      ),
    },
    {
      key: "streak",
      label: "Ofensiva",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-orange-500">
          <span className="font-bold text-sm">{row.currentStreak || 0}</span>
          <span className="text-[10px] uppercase font-bold tracking-tighter">
            Dias
          </span>
        </div>
      ),
    },
    {
      key: "badges",
      label: "Conquistas",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {(row.badges as string[])?.map((badgeId: string) => {
            const def = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
            return (
              <div
                key={badgeId}
                className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center"
                title={def?.title || badgeId}
              >
                <Award size={14} className="text-primary/60" />
              </div>
            );
          })}
          {(!row.badges || row.badges.length === 0) && (
            <span className="text-[10px] text-stone-300 italic">Nenhuma</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Gamificação & Recompensas"
      description="Visualize o engajamento dos alunos e conceda bônus de XP ou conquistas manuais."
      breadcrumbs={[{ label: "Gamificação" }]}
    >
      <DataTable
        data={joinedData}
        columns={columns}
        isLoading={isLoading}
        searchKey="email"
        searchPlaceholder="Buscar por e-mail..."
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => handleAwardXp(row.uid)}
              disabled={isPending}
              className="p-2 text-stone-400 hover:text-gold hover:bg-gold/5 rounded-xl transition-all"
              title="Conceder XP Bonus"
            >
              <Coins size={18} />
            </button>
            <button
              onClick={() => handleAwardBadge(row.uid)}
              disabled={isPending}
              className="p-2 text-stone-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
              title="Conceder Conquista"
            >
              <Trophy size={18} />
            </button>
          </div>
        )}
      />
    </AdminPageShell>
  );
}
