"use client";

import { useState, useEffect } from "react";
import { getAuditLogs } from "@/actions/audit";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { RefreshCw, Terminal, User as UserIcon } from "lucide-react";
import Button from "@/components/ui/Button";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await getAuditLogs(100);
    if (res.success) {
      setLogs(res.logs || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns: Column<any>[] = [
    {
      key: "timestamp",
      label: "Data/Hora",
      render: (log) => (
        <div className="text-xs font-mono text-stone-500 whitespace-nowrap">
          {log.timestamp
            ? new Date(log.timestamp).toLocaleString("pt-BR")
            : "-"}
        </div>
      ),
    },
    {
      key: "eventType",
      label: "Evento",
      render: (log) => (
        <Badge variant="outline" className="bg-stone-50 text-[10px] font-mono">
          {log.eventType}
        </Badge>
      ),
    },
    {
      key: "actor",
      label: "Autor",
      render: (log) => (
        <div className="flex items-center gap-2">
          <UserIcon size={12} className="text-stone-400" />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-stone-700">
              {log.actor?.email || "Sistema"}
            </span>
            <span className="text-[10px] text-stone-400 font-mono truncate max-w-[80px]">
              {log.actor?.uid}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "target",
      label: "Alvo",
      render: (log) => (
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">
            {log.target?.collection}
          </span>
          <span className="text-[10px] font-mono text-stone-400 truncate max-w-[100px]">
            {log.target?.id}
          </span>
        </div>
      ),
    },
    {
      key: "details",
      label: "Dados",
      render: (log) => (
        <div className="flex gap-2">
          {(log.diff || log.payload) && (
            <details className="cursor-pointer">
              <summary className="text-[10px] text-primary hover:underline font-bold uppercase">
                Detalhes
              </summary>
              <div className="mt-2 p-2 bg-stone-900 text-green-400 rounded text-[9px] font-mono whitespace-pre-wrap max-w-sm overflow-auto max-h-40 border border-stone-800">
                {JSON.stringify(
                  { diff: log.diff, payload: log.payload },
                  null,
                  2,
                )}
              </div>
            </details>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Logs de Auditoria"
      description="Histórico imutável de todas as ações administrativas realizadas no sistema."
      breadcrumbs={[{ label: "Logs" }]}
      actions={
        <Button
          onClick={fetchLogs}
          size="sm"
          variant="outline"
          isLoading={loading}
          leftIcon={
            <RefreshCw size={14} className={cn(loading && "animate-spin")} />
          }
        >
          Atualizar
        </Button>
      }
    >
      <DataTable
        data={logs}
        columns={columns}
        isLoading={loading}
        searchKey="eventType"
        searchPlaceholder="Filtrar por tipo de evento..."
      />
    </AdminPageShell>
  );
}
