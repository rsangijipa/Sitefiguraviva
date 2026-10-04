"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Clock3, RefreshCw } from "lucide-react";
import {
  getSupabaseSyncHealthAction,
  type SyncHealthItem,
} from "@/app/actions/admin/supabase-health";

const appearance = {
  healthy: {
    icon: CheckCircle2,
    label: "Saudável",
    className: "text-emerald-700 bg-emerald-50",
  },
  pending: {
    icon: Clock3,
    label: "Pendente",
    className: "text-amber-700 bg-amber-50",
  },
  error: {
    icon: AlertTriangle,
    label: "Erro",
    className: "text-red-700 bg-red-50",
  },
};

export function SupabaseSyncHealth() {
  const [items, setItems] = useState<SyncHealthItem[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      setItems(await getSupabaseSyncHealthAction());
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  return (
    <section
      className="rounded-2xl border border-stone-200 bg-white p-5"
      aria-labelledby="supabase-health-title"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 id="supabase-health-title" className="font-semibold text-primary">
            Saúde de publicação
          </h2>
          <p className="text-xs text-stone-500">
            Estado somente-leitura da fonte canônica.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2" aria-live="polite">
        {loading && items.length === 0 ? (
          <li className="text-sm text-stone-500">Consultando Supabase…</li>
        ) : (
          items.map((item) => {
            const view = appearance[item.status];
            const Icon = view.icon;
            return (
              <li
                key={item.key}
                className="flex items-start gap-2 rounded-lg border border-stone-100 p-3"
              >
                <Icon
                  size={17}
                  className={
                    view.className + " mt-0.5 shrink-0 rounded-full p-0.5"
                  }
                />
                <div className="min-w-0">
                  <div className="flex gap-2 text-sm font-medium text-stone-800">
                    {item.label}
                    <span className="text-xs font-normal text-stone-500">
                      {view.label}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">{item.detail}</p>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
