"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { Save, Loader2 } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import FileUpload from "@/components/admin/FileUpload";
import { saveBlogPostAction } from "@/app/actions/blog";
import Button from "@/components/ui/Button";

interface BlogPostFormProps {
  post?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BlogPostForm({ post, onSuccess, onCancel }: BlogPostFormProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = {
    title: post?.title || "",
    date: post?.date || new Date().toISOString().split("T")[0],
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    author: post?.author || "Richard Sangi",
    readingTime: post?.readingTime || "5 min",
    type: post?.type || "blog",
    pdf_url: post?.pdf_url || "",
    image: post?.image || "",
  };

  const [formData, setFormData] = useState(initialForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      {/* Type Toggle */}
      <div className="flex bg-stone-100 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: "blog" })}
          className={`px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
            formData.type === "blog"
              ? "bg-white text-primary shadow-sm"
              : "text-stone-400 hover:text-stone-600"
          }`}
        >
          Post do Blog
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: "library" })}
          className={`px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
            formData.type === "library"
              ? "bg-white text-primary shadow-sm"
              : "text-stone-400 hover:text-stone-600"
          }`}
        >
          Material (PDF)
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">
            Título
          </label>
          <input
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-gold outline-none bg-stone-50/50 text-stone-800 text-sm font-medium transition-all"
            placeholder="Título da publicação"
          />
        </div>

        {formData.type === "blog" && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">
              Imagem de Capa
            </label>
            <ImageUpload
              defaultImage={formData.image}
              onUpload={(url) =>
                setFormData((prev) => ({ ...prev, image: url }))
              }
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">
              Data Display
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-gold outline-none bg-stone-50/50 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">
              Autor
            </label>
            <input
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-gold outline-none bg-stone-50/50 text-sm"
              placeholder="Nome do autor"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">
            Resumo Curto
          </label>
          <textarea
            rows={2}
            value={formData.excerpt}
            onChange={(e) =>
              setFormData({ ...formData, excerpt: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-gold outline-none bg-stone-50/50 text-sm"
            placeholder="Uma breve introdução..."
          />
        </div>

        {formData.type === "blog" ? (
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">
                Conteúdo principal
              </label>
              <textarea
                rows={10}
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full px-4 py-4 rounded-xl border border-stone-200 focus:border-gold outline-none bg-stone-50/50 text-sm font-mono leading-relaxed"
                placeholder="Escreva aqui (suporta HTML/Markdown)..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">
                Tempo de leitura
              </label>
              <input
                value={formData.readingTime}
                onChange={(e) =>
                  setFormData({ ...formData, readingTime: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-gold outline-none bg-stone-50/50 text-sm"
                placeholder="Ex: 5 min"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">
              Arquivo PDF
            </label>
            <FileUpload
              folder="uploads/admin/library"
              defaultFile={formData.pdf_url}
              defaultName={post?.title || "Arquivo PDF"}
              onUpload={(data) =>
                setFormData((prev) => ({ ...prev, pdf_url: data.url }))
              }
            />
          </div>
        )}
      </div>

      <div className="flex justify-end items-center gap-3 pt-6 border-t border-stone-50">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-[10px] font-bold text-stone-400 hover:text-stone-600 transition-colors uppercase tracking-widest"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <Button
          type="submit"
          disabled={
            isSubmitting || (formData.type === "library" && !formData.pdf_url)
          }
          className="px-8 shadow-lg shadow-primary/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2" size={16} />
              {post ? "Atualizar" : "Publicar Agora"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
