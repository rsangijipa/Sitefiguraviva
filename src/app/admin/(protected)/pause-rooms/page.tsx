"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useToast } from "@/context/ToastContext";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Settings, Eye, Globe, FileText, Clock } from "lucide-react";
import Link from "next/link";

interface PracticeRow {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  available: boolean;
  content_version: number;
  durations: number[];
  capabilities: { audio: boolean; motion: boolean; static: boolean };
  status: string;
  content_text: string;
  updated_at: string;
}

export default function PauseRoomsPage() {
  const { addToast } = useToast();
  const [practices, setPractices] = useState<PracticeRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load practices on mount
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetch("/api/admin/pause-practices")
      .then(async (res) => {
        if (cancelled) return res;
        const data = await res.json();
        if (!res.ok) {
          addToast(data.error || "Erro ao carregar práticas.", "error");
          return data;
        }
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        if (data?.practices === undefined) return;
        setPractices(data.practices ?? []);
      })
      .catch(() => {
        if (!cancelled)
          addToast("Não foi possível conectar ao servidor.", "error");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [addToast]);

  const columns: Column<PracticeRow>[] = [
    {
      key: "name",
      label: "Prática",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
            <Settings size={16} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-stone-800 text-sm">
              {row.title}
            </span>
            <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">
              {row.id}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Descrição",
      render: (row) => (
        <span className="text-xs text-stone-500 max-w-[280px] truncate block">
          {row.description}
        </span>
      ),
    },
    {
      key: "available",
      label: "Disponível",
      render: (row) => (
        <Badge
          variant={row.available ? "success" : "outline"}
          className="font-bold"
        >
          {row.available ? "SIM" : "NÃO"}
        </Badge>
      ),
    },
    {
      key: "order",
      label: "Ordem",
      render: (row) => (
        <span className="text-sm font-mono text-stone-600">
          {row.sort_order}
        </span>
      ),
    },
    {
      key: "version",
      label: "Versão",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <FileText size={12} />
          <span className="font-mono">v{row.content_version}</span>
        </div>
      ),
    },
    {
      key: "durations",
      label: "Durações",
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.durations.map((d) => (
            <span
              key={d}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500"
            >
              {Math.floor(d / 60)}min
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Sala de Pausa"
      description="Gerencie os conteúdos das práticas da Sala de Pausa: títulos, descrições, ordem, disponibilidade e versões de conteúdo."
      breadcrumbs={[
        { label: "Recursos Interativos" },
        { label: "Sala de Pausa" },
      ]}
    >
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/50 backdrop-blur-md p-5 rounded-2xl border border-stone-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
              Total Práticas
            </span>
            <Globe size={16} className="text-primary/40" />
          </div>
          <div className="text-2xl font-serif font-bold text-primary">
            {practices.length}
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-md p-5 rounded-2xl border border-stone-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
              Disponíveis
            </span>
            <Eye size={16} className="text-green-500/40" />
          </div>
          <div className="text-2xl font-serif font-bold text-green-600">
            {practices.filter((p) => p.available).length}
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-md p-5 rounded-2xl border border-stone-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
              Rascunhos
            </span>
            <FileText size={16} className="text-stone-300/40" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-600">
            {practices.filter((p) => p.status === "draft").length}
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-md p-5 rounded-2xl border border-stone-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
              Versão Padrão
            </span>
            <Clock size={16} className="text-gold/40" />
          </div>
          <div className="text-2xl font-serif font-bold text-gold">
            v{Math.max(...practices.map((p) => p.content_version), 0)}
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={practices}
        columns={columns}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Buscar prática..."
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <Link
              href={`/admin/pause-rooms/${row.id}`}
              className="p-2 text-stone-400 hover:text-gold hover:bg-gold/5 rounded-xl transition-all"
              title="Editar"
            >
              <Settings size={18} />
            </Link>
          </div>
        )}
        emptyMessage="Nenhuma prática encontrada. Execute o script de seed para popular."
      />
    </AdminPageShell>
  );
}
