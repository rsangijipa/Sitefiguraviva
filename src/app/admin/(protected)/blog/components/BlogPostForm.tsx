"use client";

import { useId, useState } from "react";
import { useToast } from "@/context/ToastContext";
import {
  AlignLeft,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  Quote,
  Save,
  Video,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import FileUpload from "@/components/admin/FileUpload";
import { saveBlogPostAction } from "@/app/actions/blog";
import Button from "@/components/ui/Button";
import {
  DIARY_SIZES,
  DIARY_SIZE_LABELS,
  DIARY_TONES,
  DIARY_TONE_LABELS,
  toDiaryBlock,
  type DiaryKind,
} from "@/features/blog/diary-blocks";
import { getYouTubeVideoId } from "@/lib/course-content/media";

interface BlogPostFormProps {
  post?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const KIND_OPTIONS: Array<{
  id: DiaryKind;
  label: string;
  hint: string;
  icon: typeof FileText;
}> = [
  {
    id: "article",
    label: "Texto longo",
    hint: "Abre em página própria",
    icon: FileText,
  },
  {
    id: "text",
    label: "Texto curto",
    hint: "Aparece inteiro no diário",
    icon: AlignLeft,
  },
  {
    id: "quote",
    label: "Frase solta",
    hint: "Pensamento, poesia",
    icon: Quote,
  },
  {
    id: "photo",
    label: "Fotografia",
    hint: "Foto maior ou menor",
    icon: ImageIcon,
  },
  { id: "video", label: "Vídeo", hint: "Player do YouTube", icon: Video },
];

const field =
  "w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-sm text-stone-800 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15";
const labelClass =
  "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-stone-600";

export function BlogPostForm({ post, onSuccess, onCancel }: BlogPostFormProps) {
  const { addToast } = useToast();
  const id = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const block = post ? toDiaryBlock(post) : null;
  const [formData, setFormData] = useState({
    title: post?.title || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    author: post?.author || "",
    readingTime: post?.readingTime || "",
    type: post?.type === "library" ? "library" : "blog",
    pdf_url: post?.pdf_url || post?.pdfUrl || "",
    image: post?.image || "",
    post_format: (block?.kind ?? "article") as DiaryKind,
    youtube_url: block?.youtubeId
      ? `https://www.youtube.com/watch?v=${block.youtubeId}`
      : "",
    quote_author: block?.quoteAuthor ?? "",
    card_size: block?.size ?? "medium",
    tone: block?.tone ?? "paper",
  });

  const set = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K],
  ) => setFormData((prev) => ({ ...prev, [key]: value }));

  const youtubeId = getYouTubeVideoId(formData.youtube_url);
  const kind = formData.post_format;
  const isDiary = formData.type === "blog";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isUploading || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await saveBlogPostAction(post?.id || null, formData);
      if (!res.success) throw new Error(res.error);
      addToast(
        post ? "Publicação atualizada!" : "Bloco publicado no diário!",
        "success",
      );
      onSuccess();
    } catch (error: any) {
      addToast("Não foi possível salvar: " + error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="flex w-fit rounded-xl bg-stone-100 p-1">
        <legend className="sr-only">Onde publicar</legend>
        {[
          { value: "blog", label: "Diário visual" },
          { value: "library", label: "Material (PDF)" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={formData.type === option.value}
            onClick={() => set("type", option.value)}
            className={`min-h-11 rounded-lg px-5 text-xs font-bold uppercase tracking-wider transition-colors ${
              formData.type === option.value
                ? "bg-white text-primary shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {option.label}
          </button>
        ))}
      </fieldset>

      {isDiary && (
        <fieldset className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
          <legend className="px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-stone-600">
            Tipo de bloco
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {KIND_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = kind === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => set("post_format", option.id)}
                  className={`flex min-h-[72px] flex-col items-start rounded-xl border p-3 text-left transition-colors ${
                    active
                      ? "border-primary bg-primary text-white shadow-md"
                      : "border-stone-200 bg-white text-stone-700 hover:border-primary/40"
                  }`}
                >
                  <Icon
                    size={16}
                    aria-hidden="true"
                    className={active ? "text-white" : "text-primary"}
                  />
                  <span className="mt-1.5 text-xs font-bold leading-tight">
                    {option.label}
                  </span>
                  <span
                    className={`mt-0.5 text-[11px] ${active ? "text-white/80" : "text-stone-500"}`}
                  >
                    {option.hint}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${id}-size`} className={labelClass}>
                <LayoutGrid
                  size={12}
                  aria-hidden="true"
                  className="mr-1 inline"
                />{" "}
                Tamanho no diário
              </label>
              <select
                id={`${id}-size`}
                value={formData.card_size}
                onChange={(event) =>
                  set(
                    "card_size",
                    event.target.value as typeof formData.card_size,
                  )
                }
                className={field}
              >
                {DIARY_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {DIARY_SIZE_LABELS[size]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${id}-tone`} className={labelClass}>
                Fundo do bloco
              </label>
              <select
                id={`${id}-tone`}
                value={formData.tone}
                onChange={(event) =>
                  set("tone", event.target.value as typeof formData.tone)
                }
                className={field}
              >
                {DIARY_TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {DIARY_TONE_LABELS[tone]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor={`${id}-title`} className={labelClass}>
            {kind === "quote" && isDiary ? "Título (opcional)" : "Título *"}
          </label>
          <input
            id={`${id}-title`}
            required={!(kind === "quote" && isDiary)}
            value={formData.title}
            onChange={(event) => set("title", event.target.value)}
            className={field}
            placeholder={
              kind === "quote"
                ? "Ex.: Sobre o instante presente"
                : "Ex.: A arte como território de cura"
            }
          />
        </div>

        {isDiary && kind === "video" && (
          <div className="space-y-2 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <label htmlFor={`${id}-youtube`} className={labelClass}>
              Link do vídeo no YouTube *
            </label>
            <input
              id={`${id}-youtube`}
              type="url"
              inputMode="url"
              value={formData.youtube_url}
              onChange={(event) => set("youtube_url", event.target.value)}
              aria-describedby={`${id}-youtube-hint`}
              className={field}
              placeholder="https://www.youtube.com/watch?v=… ou https://youtu.be/…"
            />
            <p
              id={`${id}-youtube-hint`}
              className="text-xs text-stone-600"
              role="status"
            >
              {youtubeId
                ? "Vídeo reconhecido."
                : formData.youtube_url
                  ? "Não reconhecemos esse link do YouTube."
                  : "Aceita links de vídeo, shorts ou youtu.be."}
            </p>
            {youtubeId && (
              <img
                src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
                alt="Miniatura do vídeo"
                className="aspect-video w-full max-w-sm rounded-xl border border-stone-200 object-cover"
              />
            )}
          </div>
        )}

        {isDiary && kind === "quote" && (
          <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
            <div>
              <label htmlFor={`${id}-quote`} className={labelClass}>
                Frase *
              </label>
              <textarea
                id={`${id}-quote`}
                rows={3}
                required
                value={formData.content}
                onChange={(event) => set("content", event.target.value)}
                className={`${field} resize-y font-serif text-base italic`}
                placeholder="A vida acontece no contato…"
              />
            </div>
            <div>
              <label htmlFor={`${id}-quote-author`} className={labelClass}>
                Autoria da frase
              </label>
              <input
                id={`${id}-quote-author`}
                value={formData.quote_author}
                onChange={(event) => set("quote_author", event.target.value)}
                className={field}
              />
            </div>
          </div>
        )}

        {isDiary && kind !== "quote" && (
          <div>
            <p className={labelClass}>
              {kind === "photo" ? "Fotografia *" : "Imagem (opcional)"}
            </p>
            <ImageUpload
              onUploadingChange={setIsUploading}
              defaultImage={formData.image}
              onUpload={(url) => set("image", url)}
            />
          </div>
        )}

        <div>
          <label htmlFor={`${id}-excerpt`} className={labelClass}>
            {kind === "photo"
              ? "Legenda"
              : kind === "video"
                ? "Comentário sobre o vídeo"
                : "Resumo"}
          </label>
          <textarea
            id={`${id}-excerpt`}
            rows={2}
            value={formData.excerpt}
            onChange={(event) => set("excerpt", event.target.value)}
            className={field}
          />
        </div>

        {(!isDiary || kind === "article" || kind === "text") &&
          formData.type !== "library" && (
            <div>
              <label htmlFor={`${id}-content`} className={labelClass}>
                {kind === "text"
                  ? "Texto *"
                  : "Conteúdo do artigo (aceita HTML) *"}
              </label>
              <textarea
                id={`${id}-content`}
                rows={kind === "text" ? 5 : 12}
                required
                value={formData.content}
                onChange={(event) => set("content", event.target.value)}
                className={`${field} leading-relaxed ${kind === "article" ? "font-mono" : ""}`}
              />
            </div>
          )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-author`} className={labelClass}>
              Autoria
            </label>
            <input
              id={`${id}-author`}
              value={formData.author}
              onChange={(event) => set("author", event.target.value)}
              className={field}
            />
          </div>
          {kind === "article" && (
            <div>
              <label htmlFor={`${id}-reading`} className={labelClass}>
                Tempo de leitura
              </label>
              <input
                id={`${id}-reading`}
                value={formData.readingTime}
                onChange={(event) => set("readingTime", event.target.value)}
                className={field}
                placeholder="Ex.: 4 min"
              />
            </div>
          )}
        </div>

        {formData.type === "library" && (
          <div>
            <p className={labelClass}>Arquivo PDF *</p>
            <FileUpload
              defaultFile={formData.pdf_url}
              onUpload={(data) => set("pdf_url", data.url)}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-stone-100 pt-4">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isUploading || isSubmitting}
          className="shadow-lg shadow-primary/20"
        >
          <Save size={16} className="mr-1.5" aria-hidden="true" />
          {post ? "Salvar alterações" : "Publicar no diário"}
        </Button>
      </div>
    </form>
  );
}
