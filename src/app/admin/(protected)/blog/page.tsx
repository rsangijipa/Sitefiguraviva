"use client";

import { useEffect, useState, useTransition } from "react";
import { useBlogPosts } from "@/hooks/useContent";
import { useToast } from "@/context/ToastContext";
import {
  Plus,
  Trash2,
  Edit,
  FileText,
  BookOpen,
  ExternalLink,
  Image as ImageIcon,
  User,
  Calendar,
  Quote,
  Video,
  Palette,
  Sparkles,
  Check,
} from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@/components/ui/Modal";
import { BlogPostForm } from "./components/BlogPostForm";
import { saveBlogThemeAction } from "@/app/actions/blog";

const BLOG_THEMES = [
  { id: "paper", name: "Papel Artesanal", desc: "Tom pergaminho suave com textura de papel", color: "#f8f4eb" },
  { id: "watercolor", name: "Aquarela Suave", desc: "Pinceladas fluidas e orgânicas", color: "#f5ede0" },
  { id: "linen", name: "Linho & Areia", desc: "Textura natural de linho suave", color: "#f4f1e8" },
  { id: "sage", name: "Verde Igarapé", desc: "Tom esmeralda sereno e meditativo", color: "#edf4ef" },
  { id: "dark", name: "Diário Noturno", desc: "Fundo escuro poético e intimista", color: "#161c17" },
];

export default function BlogManager() {
  const { data: blogPosts = [], isLoading, refetch } = useBlogPosts(true);
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [currentTheme, setCurrentTheme] = useState("paper");
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase
          .from("public_pages")
          .select("content")
          .eq("key", "blog_theme")
          .maybeSingle();

        if (data?.content && typeof (data.content as any).theme === "string") {
          setCurrentTheme((data.content as any).theme);
        }
      } catch (e) {
        console.error("Error loading theme", e);
      }
    }
    loadTheme();
  }, []);

  const handleSelectTheme = async (themeId: string) => {
    setCurrentTheme(themeId);
    setIsSavingTheme(true);
    try {
      const res = await saveBlogThemeAction(themeId);
      if (res.success) {
        addToast("Fundo do Diário Visual atualizado com sucesso!", "success");
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      addToast("Erro ao salvar tema: " + err.message, "error");
    } finally {
      setIsSavingTheme(false);
    }
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${title}"?`)) return;

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.from("posts").delete().eq("id", id);
        if (error) throw error;
        addToast("Publicação excluída.", "success");
        refetch();
      } catch (error) {
        console.error("Delete error", error);
        addToast("Erro ao excluir.", "error");
      }
    });
  };

  const columns: Column<any>[] = [
    {
      key: "title",
      label: "Publicação",
      render: (row) => {
        const format = row.post_format || row.legacy_payload?.post_format || "article";
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 shrink-0 overflow-hidden border border-stone-200">
              {row.image ? (
                <img
                  src={row.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : format === "quote" ? (
                <Quote size={18} className="text-amber-700" />
              ) : format === "video" ? (
                <Video size={18} className="text-red-600" />
              ) : row.type === "library" ? (
                <FileText size={18} className="text-emerald-700" />
              ) : (
                <BookOpen size={18} className="text-stone-500" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-stone-800 text-sm line-clamp-1">
                {row.title}
              </span>
              <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                <User size={10} /> {row.author || "Lilian Vanessa Nicacio"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "type",
      label: "Formato",
      render: (row) => {
        if (row.type === "library") {
          return (
            <Badge variant="secondary" className="font-bold">
              PDF BIBLIOTECA
            </Badge>
          );
        }
        const format = row.post_format || row.legacy_payload?.post_format || "article";
        if (format === "quote") {
          return (
            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 font-bold">
              FRASE SOLTA
            </Badge>
          );
        }
        if (format === "video") {
          return (
            <Badge variant="outline" className="border-red-300 bg-red-50 text-red-800 font-bold">
              VÍDEO YOUTUBE
            </Badge>
          );
        }
        if (format === "photo") {
          return (
            <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-800 font-bold">
              MOMENTO VISUAL
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="border-stone-300 text-primary font-bold">
            ARTIGO
          </Badge>
        );
      },
    },
    {
      key: "date",
      label: "Data",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium whitespace-nowrap">
          <Calendar size={12} className="text-stone-300" />
          {row.date || (row.created_at ? new Date(row.created_at).toLocaleDateString("pt-BR") : "—")}
        </div>
      ),
    },
    {
      key: "stats",
      label: "Detalhes",
      render: (row) => (
        <div className="flex flex-col gap-1">
          {row.type === "library" ? (
            <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase tracking-wider">
              <FileText size={12} /> PDF Anexado
            </div>
          ) : row.externalUrl || row.youtube_url ? (
            <div className="text-[10px] text-red-600 font-bold flex items-center gap-1">
              <Video size={11} /> Player YouTube
            </div>
          ) : (
            <div className="text-[10px] text-stone-400 font-medium">
              {row.readingTime || "3 min"} de leitura
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Diário Visual & Blog Pessoal"
      description="Gerencie reflexões, poesias, momentos fotográficos, vídeos do YouTube e personalize a identidade visual do blog."
      breadcrumbs={[{ label: "Blog" }]}
      actions={
        <button
          onClick={() => {
            setEditingPost(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-5 py-3 rounded-xl flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider hover:bg-gold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Plus size={16} /> Nova Publicação
        </button>
      }
    >
      {/* SELETOR CRIATIVO: FUNDO DO BLOG */}
      <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Palette size={18} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-800">
                Fundo do Diário Visual (Reflexões e Movimentos)
              </h3>
              <p className="text-xs text-stone-500">
                Escolha o papel ou textura de fundo exibido publicamente no blog.
              </p>
            </div>
          </div>
          {isSavingTheme && (
            <span className="text-xs text-stone-400 animate-pulse">
              Salvando tema...
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {BLOG_THEMES.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelectTheme(theme.id)}
                className={`flex flex-col items-start p-3.5 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-stone-50 shadow-md ring-2 ring-primary/20 scale-[1.02]"
                    : "border-stone-200/80 hover:border-stone-300 hover:bg-stone-50/50"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className="h-6 w-6 rounded-full border border-stone-300 shadow-2xs"
                    style={{ backgroundColor: theme.color }}
                  />
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <Check size={12} />
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-stone-800 leading-tight">
                  {theme.name}
                </span>
                <span className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">
                  {theme.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white/80 p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Total de Posts
            </span>
            <BookOpen size={16} className="text-primary/40" />
          </div>
          <div className="text-2xl font-serif font-bold text-primary">
            {blogPosts.filter((p: any) => p.type !== "library").length}
          </div>
        </div>

        <div className="bg-white/80 p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Frases & Poesias
            </span>
            <Quote size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-800">
            {blogPosts.filter((p: any) => (p.post_format || p.legacy_payload?.post_format) === "quote").length}
          </div>
        </div>

        <div className="bg-white/80 p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Vídeos YouTube
            </span>
            <Video size={16} className="text-red-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-800">
            {blogPosts.filter((p: any) => (p.post_format || p.legacy_payload?.post_format) === "video" || p.externalUrl).length}
          </div>
        </div>

        <div className="bg-white/80 p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              PDFs do Acervo
            </span>
            <FileText size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-800">
            {blogPosts.filter((p: any) => p.type === "library").length}
          </div>
        </div>
      </div>

      <DataTable
        data={blogPosts}
        columns={columns}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Buscar por título..."
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            {row.pdf_url && (
              <a
                href={row.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-stone-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                title="Ver PDF"
              >
                <ExternalLink size={18} />
              </a>
            )}
            <button
              onClick={() => handleEdit(row)}
              className="p-2 text-stone-400 hover:text-gold hover:bg-gold/5 rounded-xl transition-all cursor-pointer"
              title="Editar"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => handleDelete(row.id, row.title)}
              disabled={isPending}
              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
              title="Excluir"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent className="max-w-3xl">
          <ModalHeader>
            <div className="flex flex-col">
              <h2 className="font-serif text-2xl font-bold text-stone-800">
                {editingPost ? "Editar Publicação no Diário" : "Nova Publicação Criativa"}
              </h2>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                Diário Visual Reflexões e Movimentos
              </p>
            </div>
          </ModalHeader>
          <ModalBody>
            <BlogPostForm
              post={editingPost}
              onSuccess={() => {
                setIsModalOpen(false);
                refetch();
              }}
              onCancel={() => setIsModalOpen(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </AdminPageShell>
  );
}
