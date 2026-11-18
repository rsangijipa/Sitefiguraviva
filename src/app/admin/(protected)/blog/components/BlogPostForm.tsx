"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import {
  Save,
  Loader2,
  FileText,
  Quote,
  Image as ImageIcon,
  Video,
  Sparkles,
  LayoutGrid,
  Check,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import FileUpload from "@/components/admin/FileUpload";
import { saveBlogPostAction } from "@/app/actions/blog";
import Button from "@/components/ui/Button";
import { getYouTubeVideoId } from "@/lib/course-content/media";

interface BlogPostFormProps {
  post?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BlogPostForm({ post, onSuccess, onCancel }: BlogPostFormProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const initialForm = {
    title: post?.title || "",
    date: post?.date || new Date().toISOString().split("T")[0],
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    author: post?.author || "Lilian Vanessa Nicacio",
    readingTime: post?.readingTime || "5 min",
    type: post?.type || "blog",
    pdf_url: post?.pdf_url || post?.pdfUrl || "",
    image: post?.image || "",
    post_format: post?.post_format || post?.legacy_payload?.post_format || "article",
    youtube_url: post?.youtube_url || post?.legacy_payload?.youtube_url || post?.externalUrl || "",
    quote_author: post?.quote_author || post?.legacy_payload?.quote_author || "",
    card_size: post?.card_size || post?.legacy_payload?.card_size || "normal",
    bg_style: post?.bg_style || post?.legacy_payload?.bg_style || "default",
  };

  const [formData, setFormData] = useState(initialForm);

  const youtubeVideoId = getYouTubeVideoId(formData.youtube_url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading || isSubmitting) return;

    if (formData.type === "blog") {
      if (formData.post_format === "video" && !formData.youtube_url) {
        addToast("Insira o link do vídeo do YouTube.", "error");
        return;
      }
      if (formData.post_format === "quote" && !formData.excerpt && !formData.content) {
        addToast("Insira o texto da frase ou pensamento.", "error");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await saveBlogPostAction(post?.id || null, formData);

      if (res.success) {
        addToast(
          post ? "Publicação atualizada!" : "Publicação criada com sucesso!",
          "success",
        );
        onSuccess();
      } else {
        throw new Error(res.error);
      }
    } catch (error: any) {
      console.error("Error saving post:", error);
      addToast("Erro ao salvar publicação: " + error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de Publicação (Blog vs PDF da Biblioteca) */}
      <div className="flex bg-stone-100 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: "blog" })}
          className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            formData.type === "blog"
              ? "bg-white text-primary shadow-sm"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Diário Visual (Blog)
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: "library" })}
          className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            formData.type === "library"
              ? "bg-white text-primary shadow-sm"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Material (PDF)
        </button>
      </div>

      {/* Formato Criativo do Post no Diário */}
      {formData.type === "blog" && (
        <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 flex items-center gap-1.5">
            <Sparkles size={12} className="text-gold" /> Formato Criativo no Blog
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              {
                id: "article",
                label: "Artigo / Texto",
                icon: FileText,
                desc: "Texto com leitura",
              },
              {
                id: "quote",
                label: "Frase Solta",
                icon: Quote,
                desc: "Pensamento & poesia",
              },
              {
                id: "photo",
                label: "Momento Visual",
                icon: ImageIcon,
                desc: "Foto em destaque",
              },
              {
                id: "video",
                label: "Vídeo YouTube",
                icon: Video,
                desc: "Player incorporado",
              },
            ].map((f) => {
              const Icon = f.icon;
              const active = formData.post_format === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, post_format: f.id as any })}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    active
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white border-stone-200 text-stone-700 hover:border-primary/40 hover:bg-stone-50"
                  }`}
                >
                  <Icon size={16} className={active ? "text-gold" : "text-primary"} />
                  <span className="text-xs font-bold mt-1.5 leading-tight">{f.label}</span>
                  <span className={`text-[10px] mt-0.5 ${active ? "text-white/70" : "text-stone-400"}`}>
                    {f.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tamanho e Estilo do Card */}
      {formData.type === "blog" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 flex items-center gap-1">
              <LayoutGrid size={12} /> Tamanho do Card no Grid
            </label>
            <select
              value={formData.card_size}
              onChange={(e) => setFormData({ ...formData, card_size: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-700 focus:border-primary outline-none"
            >
              <option value="normal">Padrão (1 coluna)</option>
              <option value="large">Destaque Grande (2 colunas)</option>
              <option value="tall">Alongado Vertical (Retrato)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
              Estilo / Tom do Card
            </label>
            <select
              value={formData.bg_style}
              onChange={(e) => setFormData({ ...formData, bg_style: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-700 focus:border-primary outline-none"
            >
              <option value="default">Papel Suave (Padrão)</option>
              <option value="watercolor">Toque de Aquarela</option>
              <option value="forest">Verde Igarapé Suave</option>
              <option value="terracotta">Terracota & Calor</option>
            </select>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Título */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
            {formData.post_format === "quote" ? "Título ou Tema da Frase *" : "Título da Publicação *"}
          </label>
          <input
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-primary outline-none bg-stone-50/50 text-stone-800 text-sm font-medium transition-all"
            placeholder={
              formData.post_format === "quote"
                ? "Ex: Sobre o instante presente"
                : "Ex: A arte como território de cura"
            }
          />
        </div>

        {/* Campo específico para Vídeo do YouTube */}
        {formData.post_format === "video" && (
          <div className="space-y-2 rounded-2xl border-2 border-primary/20 bg-primary/5 p-4">
            <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Video size={14} /> Link do Vídeo no YouTube *
            </label>
            <input
              type="url"
              value={formData.youtube_url}
              onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:border-primary outline-none"
              placeholder="Cole a URL do vídeo: https://www.youtube.com/watch?v=... ou https://youtu.be/..."
            />
            {youtubeVideoId ? (
              <div className="mt-3 aspect-video w-full max-w-md overflow-hidden rounded-xl border border-stone-300 shadow-sm">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                  title="Prévia do vídeo"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : formData.youtube_url ? (
              <p className="text-xs text-red-500">URL do YouTube inválida ou não reconhecida.</p>
            ) : null}
          </div>
        )}

        {/* Campo específico para Frase Solta / Pensamento */}
        {formData.post_format === "quote" && (
          <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Quote size={14} /> Frase / Pensamento Solto *
              </label>
              <textarea
                rows={3}
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-base font-serif italic text-stone-800 focus:border-primary outline-none resize-none leading-relaxed"
                placeholder="“A vida acontece no contato, no espaço entre o respirar e o encontro...”"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                Autoria da citação
              </label>
              <input
                value={formData.quote_author}
                onChange={(e) => setFormData({ ...formData, quote_author: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 bg-white text-xs font-bold text-stone-700 focus:border-primary outline-none"
                placeholder="Ex: Lilian Vanessa Nicacio (ou autor citado)"
              />
            </div>
          </div>
        )}

        {/* Imagem de Capa (se não for quote) */}
        {formData.type === "blog" && formData.post_format !== "quote" && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">
              {formData.post_format === "photo" ? "Fotografia em Destaque *" : "Imagem de Capa"}
            </label>
            <ImageUpload
              onUploadingChange={setIsUploading}
              defaultImage={formData.image}
              onUpload={(url) => setFormData((prev) => ({ ...prev, image: url }))}
            />
          </div>
        )}

        {/* Data e Autor */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
              Data de Publicação
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
              Autor / Administradora
            </label>
            <input
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:border-primary outline-none"
              placeholder="Nome do autor"
            />
          </div>
        </div>

        {/* Resumo Curto / Legenda */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
            {formData.post_format === "photo" ? "Legenda ou Reflexão da Foto" : "Resumo Curto"}
          </label>
          <textarea
            rows={2}
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-primary outline-none bg-stone-50/50 text-sm"
            placeholder="Uma breve introdução ou reflexão..."
          />
        </div>

        {/* Conteúdo Principal para Artigos */}
        {formData.type === "blog" && formData.post_format === "article" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                Conteúdo do Artigo (suporta HTML/Markdown) *
              </label>
              <textarea
                rows={10}
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-primary outline-none bg-stone-50/50 text-sm font-mono leading-relaxed"
                placeholder="Escreva seu artigo ou reflexão..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                Tempo estimado de leitura
              </label>
              <input
                value={formData.readingTime}
                onChange={(e) => setFormData({ ...formData, readingTime: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-primary outline-none bg-stone-50/50 text-xs"
                placeholder="Ex: 4 min"
              />
            </div>
          </div>
        )}

        {/* Arquivo PDF caso tipo seja library */}
        {formData.type === "library" && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
              Arquivo PDF *
            </label>
            <FileUpload
              defaultFile={formData.pdf_url}
              onUpload={(data) => setFormData((prev) => ({ ...prev, pdf_url: data.url }))}
            />
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isUploading || isSubmitting}
          className="shadow-lg shadow-primary/20"
        >
          <Save size={16} className="mr-1.5" />
          {post ? "Salvar Alterações" : "Publicar no Diário"}
        </Button>
      </div>
    </form>
  );
}
