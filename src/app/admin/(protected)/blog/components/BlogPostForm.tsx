"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { Save, Loader2, Upload, FileText, X } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import { db, storage } from "@/lib/firebase/client";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface BlogPostFormProps {
  post?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BlogPostForm({ post, onSuccess, onCancel }: BlogPostFormProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      addToast("Por favor, selecione um arquivo PDF.", "error");
      return;
    }

    setUploadingPdf(true);
    try {
      const cleanName = file.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9.]/g, "_")
        .replace(/_{2,}/g, "_");

      const storageRef = ref(storage, `library/${Date.now()}_${cleanName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setFormData((prev) => ({ ...prev, pdf_url: downloadURL }));
      addToast("PDF enviado com sucesso!", "success");
    } catch (error) {
      console.error("PDF Upload failed", error);
      addToast("Falha ao enviar PDF.", "error");
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const slug = formData.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-{2,}/g, "-");

      const payload = {
        ...formData,
        slug,
        updated_at: serverTimestamp(),
        isPublished: true,
      };

      if (post) {
        const docRef = doc(db, "posts", post.id);
        await updateDoc(docRef, payload);
        addToast("Publicação atualizada!", "success");
      } else {
        await addDoc(collection(db, "posts"), {
          ...payload,
          created_at: serverTimestamp(),
        });
        addToast("Publicação criada com sucesso!", "success");
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving post:", error);
      addToast("Erro ao salvar publicação.", "error");
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
            <div className="relative group overflow-hidden">
              <div
                className={cn(
                  "w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all",
                  formData.pdf_url
                    ? "bg-green-50 border-green-200"
                    : "bg-stone-50 border-stone-200 group-hover:bg-primary/5 group-hover:border-primary/30",
                )}
              >
                {formData.pdf_url ? (
                  <div className="text-center p-4">
                    <FileText
                      className="text-green-500 mx-auto mb-2"
                      size={24}
                    />
                    <p className="text-xs font-bold text-green-700">
                      PDF Anexado
                    </p>
                    <p className="text-[10px] text-green-600/50 truncate max-w-[200px] mt-1">
                      {formData.pdf_url}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload
                      className="text-stone-300 group-hover:text-primary transition-colors mx-auto mb-2"
                      size={24}
                    />
                    <p className="text-xs font-bold text-stone-400 group-hover:text-primary transition-colors">
                      Arraste ou clique para enviar PDF
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploadingPdf}
                />
              </div>
            </div>
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
