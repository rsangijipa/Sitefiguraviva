"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, ArrowLeft, BookOpen, Sparkles, ExternalLink, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import ImageUpload from "@/components/admin/ImageUpload";
import { saveBookAction } from "@/app/actions/books";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { FormShell, FormSection } from "@/components/admin/FormShell";

export default function NewBookPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverConfirmed, setCoverConfirmed] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    coverImageUrl: "",
    coverStoragePath: "",
    purchaseUrl: "",
    publicationYear: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.coverImageUrl) {
      addToast("Faça o upload da capa do livro antes de salvar.", "error");
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
      const res = await saveBookAction(null, {
        ...formData,
        publicationYear,
      });

      if (res.success) {
        addToast("Livro adicionado com sucesso à estante!", "success");
        router.push("/admin/books");
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      console.error("Error saving book:", err);
      addToast("Erro ao cadastrar livro: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminPageShell
      title="Novo Livro na Estante"
      description="Cadastre uma recomendação literária com capa em alta qualidade, dados do autor e link para compra."
      breadcrumbs={[
        { label: "Estante", href: "/admin/books" },
        { label: "Novo Livro" },
      ]}
      backLink="/admin/books"
      actions={
        <div className="flex items-center gap-3">
          <Link href="/admin/books">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={16} className="mr-1.5" />
              Cancelar
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            size="sm"
            className="shadow-lg shadow-primary/20"
          >
            <Save size={16} className="mr-1.5" />
            Salvar Livro
          </Button>
        </div>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 bg-stone-50/70 px-6 py-4 flex items-center gap-2 text-primary font-semibold text-sm">
          <BookOpen size={18} className="text-primary" />
          <span>Ficha de Recomendação Bibliográfica</span>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 bg-stone-50/30 space-y-6">
          <FormShell className="max-w-none grid lg:grid-cols-12 gap-8 bg-transparent border-0 shadow-none p-0">
            {/* Coluna Esquerda: Capa e Autorização */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              <FormSection
                title="Capa da Obra"
                description="Upload da imagem em proporção 2:3 padrão livro"
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
                    <label htmlFor="book-title" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                      Título do Livro *
                    </label>
                    <input
                      id="book-title"
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
                      <label htmlFor="book-author" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                        Autor(a) / Organizador(a) *
                      </label>
                      <input
                        id="book-author"
                        type="text"
                        required
                        value={formData.author}
                        onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                        placeholder="Ex: Frederick S. Perls"
                        className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-700 focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="book-year" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                        Ano de Publicação
                      </label>
                      <input
                        id="book-year"
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
                    <label htmlFor="book-purchase-url" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                      Link para Compra / Catálogo da Editora *
                    </label>
                    <div className="relative">
                      <input
                        id="book-purchase-url"
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
                  <label htmlFor="book-description" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                    Sinopse / Por que indicamos este livro
                  </label>
                  <textarea
                    id="book-description"
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
                  Salvar e Adicionar à Estante
                </Button>
              </div>
            </div>
          </FormShell>
        </form>
      </div>
    </AdminPageShell>
  );
}
