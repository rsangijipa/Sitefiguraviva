"use client";

import { useState, useTransition, useCallback } from "react";
import { useToast } from "@/context/ToastContext";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  Save,
  X,
  Settings,
  FileText,
  Clock,
  Play,
  AudioWaveform,
  Move,
  Minimize,
  Loader2,
} from "lucide-react";

interface PracticeData {
  id: string;
  title: string;
  description: string;
  content_text: string;
  sort_order: number;
  available: boolean;
  durations: number[];
  capabilities: { audio: boolean; motion: boolean; static: boolean };
  content_version: number;
  status: string;
}

interface Props {
  practice: PracticeData | null;
  practiceId: string;
}

const DURATION_OPTIONS = [120, 180, 300];
const DURATION_LABELS: Record<number, string> = {
  120: "2 min",
  180: "3 min",
  300: "5 min",
};

export function PauseRoomEditorClient({ practice, practiceId }: Props) {
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<PracticeData>({
    id: practiceId,
    title: practice?.title ?? "",
    description: practice?.description ?? "",
    content_text: practice?.content_text ?? "",
    sort_order: practice?.sort_order ?? 0,
    available: practice?.available ?? true,
    durations: practice?.durations ?? [120, 180, 300],
    capabilities: practice?.capabilities ?? {
      audio: false,
      motion: true,
      static: true,
    },
    content_version: practice?.content_version ?? 1,
    status: practice?.status ?? "published",
  });

  const [localVersion, setLocalVersion] = useState(
    practice?.content_version ?? 1,
  );

  const handleTitleChange = useCallback((val: string) => {
    setForm((prev) => ({ ...prev, title: val }));
  }, []);

  const handleDescriptionChange = useCallback((val: string) => {
    setForm((prev) => ({ ...prev, description: val }));
  }, []);

  const handleContentChange = useCallback((val: string) => {
    setForm((prev) => ({ ...prev, content_text: val }));
  }, []);

  const handleOrderChange = useCallback((val: string) => {
    const num = parseInt(val, 10);
    setForm((prev) => ({
      ...prev,
      sort_order: isNaN(num) ? 0 : Math.max(0, num),
    }));
  }, []);

  const toggleDuration = useCallback((dur: number) => {
    setForm((prev) => {
      const exists = prev.durations.includes(dur);
      if (exists && prev.durations.length <= 1) return prev;
      return {
        ...prev,
        durations: prev.durations.filter((d) => d !== dur),
      };
    });
  }, []);

  const toggleCapability = useCallback(
    (key: keyof typeof form.capabilities) => {
      setForm((prev) => ({
        ...prev,
        capabilities: { ...prev.capabilities, [key]: !prev.capabilities[key] },
      }));
    },
    [form.capabilities],
  );

  const handleSave = useCallback(() => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/pause-practices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: form.id,
            title: form.title,
            description: form.description,
            order: form.sort_order,
            available: form.available,
            content_text: form.content_text,
            durations: form.durations,
            capabilities: form.capabilities,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          addToast(
            data.error || "Não foi possível atualizar. Tente novamente.",
            "error",
          );
          return;
        }

        setLocalVersion(data.practice?.content_version ?? localVersion + 1);
        addToast("Salvo com sucesso", "success");
      } catch {
        addToast("Não foi possível atualizar. Tente novamente.", "error");
      }
    });
  }, [form, localVersion, addToast]);

  const charCount = (text: string, max: number) => ({
    current: text.length,
    max,
    remaining: max - text.length,
  });

  const titleCount = charCount(form.title, 100);
  const descCount = charCount(form.description, 200);
  const contentCount = charCount(form.content_text, 1000);

  return (
    <AdminPageShell
      title={`Editar: ${form.title || form.id}`}
      description={`Configuração da prática "${form.title}" na Sala de Pausa.`}
      breadcrumbs={[
        { label: "Recursos Interativos", href: "/admin" },
        { label: "Sala de Pausa", href: "/admin/pause-rooms" },
        { label: form.id },
      ]}
      backLink="/admin/pause-rooms"
      actions={
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          Salvar
        </button>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Editor Form */}
        <div className="xl:col-span-2 space-y-6">
          {/* Identity */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
              <Settings size={12} /> Identidade
            </h3>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1.5">
                Título
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                maxLength={100}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-stone-400 font-medium">
                  ID: {form.id}
                </span>
                <span
                  className={`text-[9px] font-bold ${titleCount.remaining < 0 ? "text-red-500" : titleCount.remaining < 20 ? "text-amber-500" : "text-stone-400"}`}
                >
                  {titleCount.current}/{titleCount.max}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1.5">
                Descrição
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                maxLength={200}
                rows={2}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all resize-none"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-stone-400 font-medium">
                  Preview curto na lista
                </span>
                <span
                  className={`text-[9px] font-bold ${descCount.remaining < 0 ? "text-red-500" : descCount.remaining < 20 ? "text-amber-500" : "text-stone-400"}`}
                >
                  {descCount.current}/{descCount.max}
                </span>
              </div>
            </div>
          </div>

          {/* Content Text */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
              <FileText size={12} /> Texto do Conteúdo
            </h3>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1.5">
                Roteiro / Instrução
              </label>
              <textarea
                value={form.content_text}
                onChange={(e) => handleContentChange(e.target.value)}
                maxLength={1000}
                rows={8}
                placeholder="Texto que será apresentado ao usuário durante a prática..."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all resize-y font-serif leading-relaxed"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-stone-400 font-medium">
                  Versão atual:{" "}
                  <span className="font-mono">v{localVersion}</span>
                </span>
                <span
                  className={`text-[9px] font-bold ${contentCount.remaining < 0 ? "text-red-500" : contentCount.remaining < 100 ? "text-amber-500" : "text-stone-400"}`}
                >
                  {contentCount.current}/{contentCount.max} ·{" "}
                  {contentCount.remaining} restantes
                </span>
              </div>
            </div>
          </div>

          {/* Duration & Capabilities */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
              <Clock size={12} /> Durações & Capacidades
            </h3>

            {/* Duration chips */}
            <div>
              <span className="block text-xs font-bold text-stone-600 mb-2">
                Durações disponíveis
              </span>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map((dur) => {
                  const isSelected = form.durations.includes(dur);
                  return (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => toggleDuration(dur)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-white text-stone-400 border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <Play size={12} />
                      {DURATION_LABELS[dur]} ({dur}s)
                      {isSelected && (
                        <X size={10} className="ml-0.5 opacity-70" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Capabilities toggles */}
            <div>
              <span className="block text-xs font-bold text-stone-600 mb-2">
                Capacidades
              </span>
              <div className="space-y-3">
                {[
                  {
                    key: "audio" as const,
                    icon: AudioWaveform,
                    label: "Áudio habilitado",
                  },
                  {
                    key: "motion" as const,
                    icon: Move,
                    label: "Movimento habilitado",
                  },
                  {
                    key: "static" as const,
                    icon: Minimize,
                    label: "Fallback estático",
                  },
                ].map(({ key, icon: Icon, label }) => (
                  <label
                    key={key}
                    className="flex items-center justify-between p-3 rounded-xl border border-stone-100 bg-stone-50 cursor-pointer hover:bg-stone-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className="text-stone-400" />
                      <span className="text-xs font-bold text-stone-600">
                        {label}
                      </span>
                    </div>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={form.capabilities[key]}
                      onClick={() => toggleCapability(key)}
                      className={`relative w-10 h-6 rounded-full transition-colors ${
                        form.capabilities[key] ? "bg-primary" : "bg-stone-200"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          form.capabilities[key] ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order & Availability */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
              <Settings size={12} /> Ordem & Disponibilidade
            </h3>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-xs font-bold text-stone-600 mb-1.5">
                  Posição na Lista
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={(e) => handleOrderChange(e.target.value)}
                  className="w-full max-w-[120px] px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 bg-stone-50 cursor-pointer hover:bg-stone-100/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        available: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <span className="text-xs font-bold text-stone-600">
                    Disponível na interface
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="bg-paper/50 rounded-2xl border border-stone-200 p-5 sticky top-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
              <Play size={12} /> Pré-visualização
            </h3>

            {/* Rendered preview */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                    <Settings size={14} />
                  </div>
                  <span className="font-serif text-lg font-semibold text-primary">
                    {form.title || "Sem título"}
                  </span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed pl-10">
                  {form.description || "Sem descrição."}
                </p>
              </div>

              {form.content_text && (
                <div className="pt-3 border-t border-stone-200">
                  <p className="text-xs text-stone-600 leading-relaxed font-serif italic pl-10">
                    "{form.content_text}"
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-stone-200 space-y-2">
                <div className="flex items-center gap-2 text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                  <Clock size={10} /> Durações
                </div>
                <div className="flex flex-wrap gap-1.5 pl-10">
                  {form.durations.map((dur) => (
                    <span
                      key={dur}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-stone-500 border border-stone-100"
                    >
                      {DURATION_LABELS[dur] || `${dur}s`}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 space-y-1.5">
                <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                  Status
                </div>
                <div className="flex flex-wrap gap-2 pl-10">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      form.available
                        ? "bg-green-50 text-green-600"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {form.available ? "Disponível" : "Indisponível"}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">
                    v{localVersion}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">
                    Ordem: {form.sort_order}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info card */}
          <div className="bg-amber-50/50 rounded-2xl border border-amber-200/60 p-5 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
              Aviso de Versionamento
            </h4>
            <p className="text-[11px] text-amber-700/80 leading-relaxed">
              Cada save incrementa a versão do conteúdo (v{localVersion} → v
              {localVersion + 1}). Sessões já completadas mantêm a versão usada
              no momento da finalização.
            </p>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
