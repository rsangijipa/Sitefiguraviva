"use client";

import { parseAmountCents } from "@/features/courses/domain/course-offer";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Layout,
  BookOpen,
  AlertTriangle,
  ArrowLeft,
  DollarSign,
  Sparkles,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ImageUpload from "@/components/admin/ImageUpload";
import SyllabusEditor from "@/components/admin/courses/SyllabusEditor";
import MediatorsEditor from "@/components/admin/courses/MediatorsEditor";
import type { Mediator } from "@/utils/mediators";
import { useToast } from "@/context/ToastContext";
import { adminCourseService } from "@/services/adminCourseService";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { FormShell, FormSection } from "@/components/admin/FormShell";
import { CourseDoc } from "@/types/lms";

export default function CourseCreateClient() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [uploadingMediator, setUploadingMediator] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    instructor: "Figura Viva",
    category: "Geral",
    duration: "4 semanas",
    level: "beginner" as
      | "beginner"
      | "intermediate"
      | "advanced"
      | "all_levels",
    coverImage: "",
    introVideoUrl: "",
    billingType: "free" as "free" | "one_time" | "subscription",
    price: "",
    installments: 1,
    topics: [] as string[],
    mediators: [] as Mediator[],
    status: "draft" as const,
    isPublished: false,
  });

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug:
        prev.slug === "" || prev.slug === generateSlug(prev.title)
          ? generateSlug(title)
          : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingMediator) {
      addToast("Aguarde o envio da foto da mediadora.", "error");
      return;
    }
    if (formData.mediators.some((m) => !m.name.trim())) {
      addToast("Informe o nome de cada mediadora.", "error");
      return;
    }
    if (!formData.title.trim()) {
      addToast("O título do curso é obrigatório", "error");
      return;
    }

    setIsCreating(true);
    try {
      const payload: Partial<CourseDoc> = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || generateSlug(formData.title),
        subtitle: formData.subtitle.trim(),
        description: formData.description.trim(),
        instructor: formData.instructor.trim() || "Figura Viva",
        category: formData.category,
        duration: formData.duration.trim() || "4 semanas",
        level: formData.level,
        coverImage: formData.coverImage || "",
        image: formData.coverImage || "",
        syllabus: formData.topics,
        mediators: formData.mediators,
        details: { syllabus: formData.topics } as CourseDoc["details"],
        totalPriceCents:
          formData.billingType === "free"
            ? 0
            : parseAmountCents(formData.price),
        installments: formData.installments,
        status: "draft",
        isPublished: false,
        billing: {
          type:
            formData.billingType === "subscription"
              ? "subscription"
              : formData.billingType === "free"
                ? "free"
                : "one_time",
        },
      };

      const newId = await adminCourseService.createCourse(payload);
      addToast("Curso criado com sucesso! Abrindo editor...", "success");
      router.push(`/admin/courses/${newId}`);
    } catch (error: any) {
      console.error("Error creating course:", error);
      addToast(error?.message || "Erro ao criar curso", "error");
      setIsCreating(false);
    }
  };

  return (
    <AdminPageShell
      title={formData.title.trim() ? formData.title : "Novo Curso"}
      description="Cadastre as informações fundamentais para iniciar a estruturação do curso."
      breadcrumbs={[
        { label: "Cursos", href: "/admin/courses" },
        { label: "Novo Curso" },
      ]}
      backLink="/admin/courses"
      actions={
        <div className="flex items-center gap-3">
          <Link href="/admin/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={16} className="mr-1.5" />
              Cancelar
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            isLoading={isCreating}
            disabled={uploadingMediator}
            size="sm"
            className="shadow-lg shadow-primary/20"
          >
            <Save size={16} className="mr-1.5" />
            Criar e Continuar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        {/* Sub-header navigation / progress indicator */}
        <div className="border-b border-stone-200 bg-stone-50/70 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Layout size={18} className="text-primary" />
            <span>Informações Gerais do Curso</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
            Status: Rascunho
          </span>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 lg:p-8 bg-stone-50/30 space-y-6"
        >
          <div className="bg-amber-50/80 border border-amber-200 text-amber-900 p-4 rounded-xl flex items-start gap-3 shadow-xs">
            <AlertTriangle
              size={18}
              className="text-amber-600 mt-0.5 shrink-0"
            />
            <div className="text-sm">
              <span className="font-bold">Primeira etapa:</span> Preencha os
              dados essenciais e clique em <strong>"Criar e Continuar"</strong>.
              Em seguida, você poderá cadastrar os módulos, aulas em vídeo,
              materiais de apoio e avisos.
            </div>
          </div>

          <FormShell className="max-w-none grid lg:grid-cols-3 gap-6 bg-transparent border-0 shadow-none p-0">
            {/* Coluna Esquerda: Mídia e Configurações Rápidas */}
            <div className="lg:col-span-1 space-y-6">
              <FormSection
                title="Capa do Curso"
                description="Imagem de apresentação nos catálogos"
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="space-y-4">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-stone-100 border border-stone-200">
                    <ImageUpload
                      defaultImage={formData.coverImage}
                      onUpload={(url) =>
                        setFormData((prev) => ({ ...prev, coverImage: url }))
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-stone-400">
                    Recomendado: 1920x1080 (16:9), PNG ou JPG até 2MB.
                  </p>
                </div>
              </FormSection>

              <FormSection
                title="Configurações Rápidas"
                description="Classificação e duração"
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="course-category"
                      className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5"
                    >
                      Categoria
                    </label>
                    <select
                      id="course-category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium focus:border-primary focus:outline-none"
                    >
                      <option value="Geral">Geral</option>
                      <option value="Fundamentos">Fundamentos</option>
                      <option value="Avançado">Avançado</option>
                      <option value="Prática Clínica">Prática Clínica</option>
                      <option value="Supervisão">Supervisão</option>
                      <option value="Teoria">Teoria</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="course-level"
                      className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5"
                    >
                      Nível de Dificuldade
                    </label>
                    <select
                      id="course-level"
                      value={formData.level}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          level: e.target.value as any,
                        }))
                      }
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium focus:border-primary focus:outline-none"
                    >
                      <option value="beginner">Iniciante</option>
                      <option value="intermediate">Intermediário</option>
                      <option value="advanced">Avançado</option>
                      <option value="all_levels">Todos os níveis</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="course-duration"
                      className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5"
                    >
                      Duração Estimada
                    </label>
                    <input
                      id="course-duration"
                      type="text"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      placeholder="Ex: 4 semanas ou 20 horas"
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="course-instructor"
                      className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5"
                    >
                      Instrutor / Docente
                    </label>
                    <input
                      id="course-instructor"
                      type="text"
                      value={formData.instructor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          instructor: e.target.value,
                        }))
                      }
                      placeholder="Ex: Figura Viva"
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </FormSection>
            </div>

            {/* Coluna Direita: Dados Básicos, Preço e Ementa */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <MediatorsEditor
                  value={formData.mediators}
                  onChange={(mediators) =>
                    setFormData((prev) => ({ ...prev, mediators }))
                  }
                  onUploadingChange={setUploadingMediator}
                  disabled={isCreating || uploadingMediator}
                />
              </div>
              <FormSection
                title="Dados Principais"
                description="Título, identificador e descrição da proposta"
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="course-title"
                      className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5"
                    >
                      Título do Curso *
                    </label>
                    <input
                      id="course-title"
                      type="text"
                      required
                      value={formData.title}
                      onChange={handleTitleChange}
                      placeholder="Ex: Introdução à Gestalt-Terapia"
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-base font-serif font-bold text-stone-800 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="course-slug"
                        className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5"
                      >
                        Slug (URL Amigável)
                      </label>
                      <input
                        id="course-slug"
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            slug: e.target.value,
                          }))
                        }
                        placeholder="introducao-a-gestalt"
                        className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-mono text-stone-600 focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="course-subtitle"
                        className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5"
                      >
                        Subtítulo / Chamada Curta
                      </label>
                      <input
                        id="course-subtitle"
                        type="text"
                        value={formData.subtitle}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            subtitle: e.target.value,
                          }))
                        }
                        placeholder="Ex: Fundamentos epistemológicos e clínicos"
                        className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="course-description"
                      className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5"
                    >
                      Descrição Detalhada
                    </label>
                    <textarea
                      id="course-description"
                      rows={5}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Apresente os objetivos, a metodologia e o público-alvo do curso..."
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-stone-700 focus:border-primary focus:outline-none resize-y"
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Precificação & Acesso"
                description="Defina se o curso é gratuito, assinatura ou pagamento único"
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: "free",
                        label: "Gratuito",
                        desc: "Acesso livre para alunos",
                      },
                      {
                        id: "one_time",
                        label: "Pagamento Único",
                        desc: "Valor integral e parcelamento",
                      },
                      {
                        id: "subscription",
                        label: "Assinatura",
                        desc: "Acesso recorrente",
                      },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            billingType: option.id as any,
                          }))
                        }
                        className={cn(
                          "p-3.5 rounded-xl border text-left transition-all",
                          formData.billingType === option.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-stone-200 bg-white hover:border-stone-300",
                        )}
                      >
                        <div className="font-bold text-sm text-stone-800">
                          {option.label}
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">
                          {option.desc}
                        </div>
                      </button>
                    ))}
                  </div>

                  {formData.billingType !== "free" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label
                          htmlFor="course-price"
                          className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5"
                        >
                          Valor integral do curso (R$)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">
                            R$
                          </span>
                          <input
                            id="course-price"
                            type="text"
                            inputMode="decimal"
                            value={formData.price || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                price: e.target.value,
                              }))
                            }
                            placeholder="0,00"
                            className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-sm font-semibold focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      {formData.billingType === "one_time" && (
                        <div>
                          <label
                            htmlFor="course-installments"
                            className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5"
                          >
                            Parcelas Máximas
                          </label>
                          <input
                            id="course-installments"
                            type="number"
                            min="1"
                            max="12"
                            value={formData.installments || 1}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                installments: Number(e.target.value),
                              }))
                            }
                            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </FormSection>

              <FormSection
                title="Ementa / Tópicos Abordados"
                description="Adicione tópicos programáticos que serão destacados na página do curso"
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <SyllabusEditor
                  topics={formData.topics}
                  onChange={(topics) =>
                    setFormData((prev) => ({ ...prev, topics }))
                  }
                />
              </FormSection>

              {/* Botões de Ação Inferiores */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                <Link href="/admin/courses">
                  <Button variant="ghost" type="button">
                    <ArrowLeft size={16} className="mr-1.5" />
                    Voltar para Lista de Cursos
                  </Button>
                </Link>

                <Button
                  type="submit"
                  isLoading={isCreating}
                  className="shadow-lg shadow-primary/20"
                >
                  <Sparkles size={16} className="mr-1.5" />
                  Criar Curso & Continuar para Módulos
                </Button>
              </div>
            </div>
          </FormShell>
        </form>
      </div>
    </AdminPageShell>
  );
}
