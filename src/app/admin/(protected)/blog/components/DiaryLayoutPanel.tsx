"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, Palette, Rows3, Save } from "lucide-react";

import ImageUpload from "@/components/admin/ImageUpload";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { saveDiarySettingsAction } from "@/app/actions/blog";
import {
  DEFAULT_DIARY_SETTINGS,
  DIARY_BACKGROUNDS,
  DIARY_KIND_LABELS,
  DIARY_SETTINGS_KEY,
  DIARY_SIZE_LABELS,
  LEGACY_THEME_KEY,
  moveItem,
  orderDiaryBlocks,
  parseDiarySettings,
  toDiaryBlock,
  type DiarySettings,
} from "@/features/blog/diary-blocks";

/**
 * Painel do diário visual: fundo da página pública e ordem dos blocos.
 * A ordem é salva como lista de IDs; blocos novos entram no topo até
 * serem reordenados.
 */
export function DiaryLayoutPanel({ posts }: { posts: any[] }) {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<DiarySettings>(
    DEFAULT_DIARY_SETTINGS,
  );
  const [orderIds, setOrderIds] = useState<string[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error } = await createSupabaseBrowserClient()
          .from("public_pages")
          .select("key, content")
          .in("key", [DIARY_SETTINGS_KEY, LEGACY_THEME_KEY]);
        if (error) throw error;
        if (!active) return;
        setSettings(
          parseDiarySettings(
            data?.find((row) => row.key === DIARY_SETTINGS_KEY)?.content,
            data?.find((row) => row.key === LEGACY_THEME_KEY)?.content,
          ),
        );
      } catch (error) {
        console.error("Error loading diary settings", error);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const blocks = useMemo(
    () =>
      posts
        .filter((post) => post?.type !== "library")
        .map((post) => toDiaryBlock(post)),
    [posts],
  );
  const ordered = useMemo(() => {
    const base = orderDiaryBlocks(blocks, orderIds ?? settings.order);
    return base;
  }, [blocks, orderIds, settings.order]);

  const move = (from: number, to: number) => {
    setOrderIds(moveItem(ordered, from, to).map((block) => block.id));
    setDirty(true);
  };

  const update = (patch: Partial<DiarySettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await saveDiarySettingsAction({
        background: settings.background,
        backgroundImageUrl: settings.backgroundImageUrl,
        order: ordered.map((block) => block.id),
      });
      if (!res.success) throw new Error(res.error);
      setDirty(false);
      addToast("Diário atualizado: fundo e ordem salvos.", "success");
    } catch (error: any) {
      addToast("Não foi possível salvar: " + error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      aria-labelledby="diary-layout-title"
      className="space-y-6 rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="diary-layout-title"
            className="font-serif text-xl font-bold text-stone-800"
          >
            Montagem do diário visual
          </h2>
          <p className="text-sm text-stone-600">
            Escolha o fundo da página e a ordem em que os blocos aparecem em
            /blog.
          </p>
        </div>
        <Button
          onClick={save}
          isLoading={saving}
          disabled={saving || !dirty}
          size="sm"
        >
          <Save size={16} className="mr-1.5" aria-hidden="true" />
          Salvar fundo e ordem
        </Button>
      </div>

      <fieldset>
        <legend className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-stone-600">
          <Palette size={13} aria-hidden="true" /> Fundo da página
        </legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {DIARY_BACKGROUNDS.map((background) => {
            const selected = settings.background === background.id;
            return (
              <button
                key={background.id}
                type="button"
                aria-pressed={selected}
                onClick={() => update({ background: background.id })}
                className={`flex min-h-[88px] flex-col justify-between rounded-2xl border-2 p-3 text-left transition-colors ${
                  selected
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-stone-200 hover:border-stone-400"
                }`}
                style={{
                  backgroundColor: background.color,
                  backgroundImage: background.image,
                  backgroundSize: background.size,
                }}
              >
                <span
                  className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                    background.dark
                      ? "bg-white/90 text-stone-900"
                      : "bg-white/90 text-stone-800"
                  }`}
                >
                  {selected && <Check size={12} aria-hidden="true" />}
                  {background.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[220px_1fr] sm:items-start">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200">
            <ImageUpload
              defaultImage={settings.backgroundImageUrl ?? ""}
              onUpload={(url) => update({ backgroundImageUrl: url || null })}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-2 text-sm text-stone-600">
            <p>
              <strong className="text-stone-800">
                Imagem própria (opcional).
              </strong>{" "}
              Substitui a textura do fundo; um véu claro (ou escuro, no fundo
              Noite) mantém os textos legíveis.
            </p>
            {settings.backgroundImageUrl && (
              <button
                type="button"
                onClick={() => update({ backgroundImageUrl: null })}
                className="min-h-11 rounded-xl border border-stone-300 px-4 text-xs font-bold uppercase tracking-wider text-stone-700 hover:border-red-400 hover:text-red-700"
              >
                Remover imagem de fundo
              </button>
            )}
          </div>
        </div>
      </fieldset>

      <div>
        <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-stone-600">
          <Rows3 size={13} aria-hidden="true" /> Ordem dos blocos
        </h3>
        {ordered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-600">
            Ainda não há blocos no diário. Use “Novo bloco” para começar.
          </p>
        ) : (
          <ol
            className="space-y-2"
            aria-label="Blocos do diário na ordem de exibição"
          >
            {ordered.map((block, index) => (
              <li
                key={block.id}
                className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50/60 p-2.5"
              >
                <span className="w-7 shrink-0 text-center font-mono text-xs text-stone-500">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-stone-800">
                    {block.title || block.content.slice(0, 60) || "Sem título"}
                  </p>
                  <p className="text-xs text-stone-600">
                    {DIARY_KIND_LABELS[block.kind]} ·{" "}
                    {DIARY_SIZE_LABELS[block.size]}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Subir “${block.title || "bloco"}”`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 hover:border-primary hover:text-primary disabled:opacity-40"
                  >
                    <ArrowUp size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={index === ordered.length - 1}
                    aria-label={`Descer “${block.title || "bloco"}”`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 hover:border-primary hover:text-primary disabled:opacity-40"
                  >
                    <ArrowDown size={16} aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
        {dirty && (
          <p
            className="mt-3 text-xs font-semibold text-amber-800"
            role="status"
          >
            Há mudanças não salvas no fundo ou na ordem.
          </p>
        )}
      </div>
    </section>
  );
}
