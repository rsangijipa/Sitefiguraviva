"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  ArrowLeft,
  BookOpen,
  Trash2,
  Loader2,
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import ImageUpload from "@/components/admin/ImageUpload";
import {
  getBookAction,
  saveBookAction,
  deleteBookAction,
  setBookPublishedAction,
} from "@/app/actions/books";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { FormShell, FormSection } from "@/components/admin/FormShell";

export default function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [coverConfirmed, setCoverConfirmed] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    coverImageUrl: "",
    coverStoragePath: "",
    purchaseUrl: "",
    publicationYear: "",
  });

  useEffect(() => {
    async function loadBook() {
      setLoading(true);
      try {
        const res = await getBookAction(id);
        if (res.success && res.data) {
          const book = res.data;
          setFormData({
            title: book.title || "",
            author: book.author || "",
            description: book.description || "",
            coverImageUrl: book.cover_image_url || "",
            coverStoragePath: book.cover_storage_path || "",
            purchaseUrl: book.purchase_url || "",
            publicationYear:
              book.publication_year != null ? String(book.publication_year) : "",
          });
          setIsPublished(Boolean(book.is_published));
          setCoverConfirmed(true);
        } else {
          addToast("Não foi possível carregar os dados do livro.", "error");
        }
      } catch (err: any) {
        addToast("Erro ao carregar livro: " + err.message, "error");
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [id, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.coverImageUrl) {
      addToast("A capa do livro é obrigatória.", "error");
      return;
    }
    if (!coverConfirmed) {
      addToast(
        "Por favor, confirme a autorização de uso da imagem da capa.",
        "error"
      );
      return;
    }
    if (!formData.title.trim()) {
      addToast("O título do livro é obrigatório.", "error");
      return;
    }
    if (!formData.author.trim()) {
      addToast("O nome do(a) autor(a) é obrigatório.", "error");
      return;
    }
    if (!formData.purchaseUrl.trim()) {
      addToast("O link de compra ou catálogo é obrigatório.", "error");
      return;
    }

    const trimmedYear = formData.publicationYear.trim();
    const publicationYear = trimmedYear ? Number(trimmedYear) : null;
    if (publicationYear !== null && !Number.isInteger(publicationYear)) {
      addToast("Ano de publicação inválido.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await saveBookAction(id, {
        ...formData,
        publicationYear,
      });

      if (res.success) {
        addToast("Livro atualizado com sucesso!", "success");
        router.push("/admin/books");
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      console.error("Error updating book:", err);
      addToast("Erro ao atualizar livro: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja remover este livro da estante?")) return;

    setIsDeleting(true);
    try {
      const res = await deleteBookAction(id);
      if (res.success) {
        addToast("Livro excluído com sucesso.", "success");
        router.push("/admin/books");
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      addToast("Erro ao excluir livro: " + err.message, "error");
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async () => {
    try {
      const res = await setBookPublishedAction(id, !isPublished);
      if (res.success) {
        setIsPublished((prev) => !prev);
        addToast(
          isPublished
            ? "Livro definido como rascunho."
            : "Livro publicado na estante do site!",
          "success"
        );
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      addToast("Erro ao alterar publicação: " + err.message, "error");
    }
  };

  return (
    <AdminPageShell
      title={formData.title ? `Editar: ${formData.title}` : "Editar Livro"}
      description="Atualize as informações bibliográficas, capa, sinopse ou status de publicação na estante."
      breadcrumbs={[
        { label: "Estante", href: "/admin/books" },
        { label: formData.title || "Editar Livro" },
      ]}
      backLink="/admin/books"
      actions={
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={handleTogglePublish}
            className="text-stone-600 hover:bg-stone-100"
          >
            {isPublished ? (
              <>
                <EyeOff size={16} className="mr-1.5 text-stone-500" />
                Despublicar
              </>
            ) : (
              <>
                <Eye size={16} className="mr-1.5 text-green-600" />
                Publicar
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 size={16} className="mr-1.5" />
            Excluir
          </Button>

          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            size="sm"
            className="shadow-lg shadow-primary/20"
          >
            <Save size={16} className="mr-1.5" />
            Salvar Alterações
          </Button>
        </div>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 bg-stone-50/70 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <BookOpen size={18} className="text-primary" />
            <span>Ficha de Recomendação Bibliográfica</span>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              isPublished
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {isPublished ? "Publicado no site" : "Rascunho"}
          </span>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-stone-400 gap-3">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm">Carregando informações do livro...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 bg-stone-50/30 space-y-6">
            <FormShell className="max-w-none grid lg:grid-cols-12 gap-8 bg-transparent border-0 shadow-none p-0">
              {/* Coluna Esquerda: Capa e Autorização */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                <FormSection
                  title="Capa da Obra"
                  description="Substituir imagem ou manter a atual"
                  className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="mx-auto max-w-[240px] aspect-[2/3] w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner">
                      <ImageUpload
                        bucket="public-book-covers"
                        folder="covers"
                        defaultImage={formData.coverImageUrl}
                        onUpload={(url, path) =>
                          setFormData((prev) => ({
                            ...prev,
                            coverImageUrl: url,
                            coverStoragePath: path,
                          }))
                        }
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-2">
                      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-amber-950 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={coverConfirmed}
                          onChange={(e) => setCoverConfirmed(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-amber-300 text-primary focus:ring-primary shrink-0"
                        />
                        <span>
                          Confirmo que possuo autorização ou que esta capa é de uso promocional legítimo para divulgação da obra.
                        </span>
                      </label>
                    </div>
                  </div>
                </FormSection>
              </div>

              {/* Coluna Direita: Dados Bibliográficos e Descrição */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                <FormSection
                  title="Informações da Publicação"
                  description="Dados essenciais para identificação e aquisição da obra"
                  className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                >
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="edit-book-title" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                        Título do Livro *
                      </label>
                      <input
                        id="edit-book-title"
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Ex: Gestalt-Terapia Explicada"
                        className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-base font-serif font-bold text-stone-800 focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label htmlFor="edit-book-author" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                          Autor(a) / Organizador(a) *
                        </label>
                        <input
                          id="edit-book-author"
                          type="text"
                          required
                          value={formData.author}
                          onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                          placeholder="Ex: Frederick S. Perls"
                          className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-700 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="edit-book-year" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                          Ano de Publicação
                        </label>
                        <input
                          id="edit-book-year"
                          type="number"
                          min={0}
                          max={9999}
                          value={formData.publicationYear}
                          onChange={(e) => setFormData((prev) => ({ ...prev, publicationYear: e.target.value }))}
                          placeholder="Ex: 1969"
                          className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-700 focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="edit-book-purchase-url" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                        Link para Compra / Catálogo da Editora *
                      </label>
                      <div className="relative">
                        <input
                          id="edit-book-purchase-url"
                          type="url"
                          required
                          value={formData.purchaseUrl}
                          onChange={(e) => setFormData((prev) => ({ ...prev, purchaseUrl: e.target.value }))}
                          placeholder="https://www.amazon.com.br/dp/... ou link da editora"
                          className="w-full rounded-xl border border-stone-200 bg-white pl-4 pr-10 py-2.5 text-sm font-medium text-stone-700 focus:border-primary focus:outline-none"
                        />
                        <ExternalLink size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </FormSection>

                <FormSection
                  title="Comentário Crítico & Recomendação"
                  description="Apresente os motivos pelos quais esta leitura é importante para a formação"
                  className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                >
                  <div>
                    <label htmlFor="edit-book-description" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                      Sinopse / Por que indicamos este livro
                    </label>
                    <textarea
                      id="edit-book-description"
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva as contribuições teóricas ou práticas desta obra, conceitos fundamentais abordados e para qual momento formativo ela é recomendada..."
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                </FormSection>

                {/* Ações Inferiores */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                  <Link href="/admin/books">
                    <Button variant="ghost" type="button">
                      <ArrowLeft size={16} className="mr-1.5" />
                      Voltar para Estante
                    </Button>
                  </Link>

                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="shadow-lg shadow-primary/20"
                  >
                    <Sparkles size={16} className="mr-1.5" />
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            </FormShell>
          </form>
        )}
      </div>
    </AdminPageShell>
  );
}
