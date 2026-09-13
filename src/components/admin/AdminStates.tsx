"use client";

import { AlertCircle, CheckCircle2, Inbox, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

export function AdminLoadingState({ rows = 3 }: { rows?: number }) {
  return <div aria-busy="true" className="space-y-2 rounded-xl border border-stone-100 bg-white p-4">{Array.from({ length: rows }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-lg bg-stone-100" />)}</div>;
}

export function AdminEmptyState({ title = "Nada para exibir", description }: { title?: string; description?: string }) {
  return <div role="status" className="rounded-xl border border-dashed border-stone-200 bg-white px-4 py-10 text-center"><Inbox className="mx-auto mb-2 text-stone-300" size={28} /><h2 className="text-sm font-semibold text-stone-700">{title}</h2>{description && <p className="mt-1 text-sm text-stone-500">{description}</p>}</div>;
}

export function AdminErrorState({ title = "Não foi possível carregar esta seção", retry }: { title?: string; retry?: () => void }) {
  return <div role="alert" className="rounded-xl border border-red-100 bg-red-50/60 px-4 py-5 text-center"><AlertCircle className="mx-auto mb-2 text-red-500" size={26} /><p className="text-sm font-medium text-red-800">{title}</p>{retry && <Button variant="outline" size="sm" onClick={retry} className="mt-3"><RefreshCw size={14} />Tentar novamente</Button>}</div>;
}

export function AdminSuccessState({ children }: { children: React.ReactNode }) { return <div role="status" className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-sm text-green-800"><CheckCircle2 size={16} />{children}</div>; }
