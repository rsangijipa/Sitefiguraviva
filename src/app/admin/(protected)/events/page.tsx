"use client";

import { useTransition, useState, useEffect } from "react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable, Column } from "@/components/admin/DataTable";
import { CreateEventButton } from "@/components/admin/events/CreateEventButton";
import { LiveEvent } from "@/types/event";
import {
  Calendar,
  Video,
  MapPin,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Link as LinkIcon,
} from "lucide-react";
import { deleteEvent, updateEventStatus } from "@/actions/event";
import { useToast } from "@/context/ToastContext";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase/client";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("startsAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as LiveEvent,
      );
      setEvents(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir o evento "${title}"?`)) return;

    startTransition(async () => {
      const result = await deleteEvent(id);
      if (result.success) {
        addToast("Evento excluído com sucesso!", "success");
      } else {
        addToast(result.error || "Erro ao excluir evento", "error");
      }
    });
  };

  const handleStatusUpdate = async (
    id: string,
    status: LiveEvent["status"],
  ) => {
    startTransition(async () => {
      const result = await updateEventStatus(id, status);
      if (result.success) {
        addToast(`Status atualizado para ${status}`, "success");
      } else {
        addToast(result.error || "Erro ao atualizar status", "error");
      }
    });
  };

  const columns: Column<LiveEvent>[] = [
    {
      key: "event",
      label: "Evento",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-bold text-stone-800 text-sm">{item.title}</span>
          <span className="text-[10px] text-stone-400 font-mono">
            ID: {item.id}
          </span>
        </div>
      ),
    },
    {
      key: "schedule",
      label: "Agendamento",
      render: (item) => {
        const date = (item.startsAt as any)?.toDate
          ? (item.startsAt as any).toDate()
          : new Date(item.startsAt);
        return (
          <div className="text-xs">
            <div className="font-medium text-stone-700">
              {date.toLocaleDateString("pt-BR")}
            </div>
            <div className="text-stone-400">
              {date.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      },
    },
    {
      key: "type",
      label: "Tipo",
      render: (item) => (
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-500">
          {item.type === "in_person" ? (
            <MapPin size={12} className="text-gold" />
          ) : (
            <Video size={12} className="text-primary" />
          )}
          {item.type === "in_person" ? "Presencial" : "Online"}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => {
        const statusMap: Record<
          string,
          { label: string; variant: any; color: string }
        > = {
          live: {
            label: "AO VIVO",
            variant: "destructive",
            color: "bg-red-500",
          },
          scheduled: {
            label: "AGENDADO",
            variant: "outline",
            color: "bg-blue-500",
          },
          ended: {
            label: "CONCLUÍDO",
            variant: "success",
            color: "bg-green-500",
          },
          cancelled: {
            label: "CANCELADO",
            variant: "secondary",
            color: "bg-stone-300",
          },
        };
        const s = statusMap[item.status] || statusMap.scheduled;
        return (
          <Badge
            variant={s.variant}
            className={cn("gap-1.5", item.status === "live" && "animate-pulse")}
          >
            <span className={cn("w-1 h-1 rounded-full", s.color)} />
            {s.label}
          </Badge>
        );
      },
    },
  ];

  return (
    <AdminPageShell
      title="Eventos Ao Vivo & Híbridos"
      description="Agende webinars, aulas presenciais e mentorias para seus alunos."
      breadcrumbs={[{ label: "Eventos" }]}
      actions={<CreateEventButton />}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-stone-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Agendados
            </span>
            <Calendar size={18} className="text-primary/40" />
          </div>
          <div className="text-3xl font-serif font-bold text-primary">
            {events.filter((e) => e.status === "scheduled").length}
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-stone-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Em Fluxo
            </span>
            <Video size={18} className="text-red-400" />
          </div>
          <div className="text-3xl font-serif font-bold text-red-500 animate-pulse">
            {events.filter((e) => e.status === "live").length}
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-stone-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Realizados
            </span>
            <CheckCircle size={18} className="text-green-400" />
          </div>
          <div className="text-3xl font-serif font-bold text-stone-800">
            {events.filter((e) => e.status === "ended").length}
          </div>
        </div>
      </div>

      <DataTable
        data={events}
        columns={columns}
        isLoading={loading}
        searchKey="title"
        searchPlaceholder="Buscar por título do evento..."
        actions={(item) => (
          <div className="flex items-center justify-end gap-1">
            {item.joinUrl && (
              <a
                href={item.joinUrl}
                target="_blank"
                className="p-2 text-stone-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                title="Link da Reunião"
              >
                <LinkIcon size={18} />
              </a>
            )}

            {item.status === "scheduled" && (
              <button
                onClick={() => handleStatusUpdate(item.id, "live")}
                disabled={isPending}
                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Iniciar Ao Vivo"
              >
                <Play size={18} />
              </button>
            )}

            {item.status === "live" && (
              <button
                onClick={() => handleStatusUpdate(item.id, "ended")}
                disabled={isPending}
                className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                title="Encerrar Evento"
              >
                <CheckCircle size={18} />
              </button>
            )}

            {item.status !== "cancelled" && item.status !== "ended" && (
              <button
                onClick={() => handleStatusUpdate(item.id, "cancelled")}
                disabled={isPending}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-all"
                title="Cancelar Evento"
              >
                <XCircle size={18} />
              </button>
            )}

            <button
              onClick={() => handleDelete(item.id, item.title)}
              disabled={isPending}
              className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title="Excluir"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      />
    </AdminPageShell>
  );
}
