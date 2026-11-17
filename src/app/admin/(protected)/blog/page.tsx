"use client";

import { useState, useTransition } from "react";
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
  AlignLeft,
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
import { DiaryLayoutPanel } from "./components/DiaryLayoutPanel";
import { DIARY_KIND_LABELS, toDiaryBlock } from "@/features/blog/diary-blocks";

const kindOf = (row: any) => toDiaryBlock(row).kind;

export default function BlogManager() {
  const { data: blogPosts = [], isLoading, refetch } = useBlogPosts(true);
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
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
        const format = kindOf(row);
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
              ) : format === "text" ? (
                <AlignLeft size={18} className="text-stone-600" />
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
        return (
          <Badge variant="outline" className="border-stone-300 font-bold text-primary">
            {DIARY_KIND_LABELS[kindOf(row)]}
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
          ) : kindOf(row) === "video" ? (
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
          <Plus size={16} aria-hidden="true" /> Novo bloco
        </button>
      }
    >
      <DiaryLayoutPanel posts={blogPosts} />

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
            {blogPosts.filter((p: any) => p.type !== "library" && kindOf(p) === "quote").length}
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
            {blogPosts.filter((p: any) => p.type !== "library" && kindOf(p) === "video").length}
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
                {editingPost ? "Editar bloco do diário" : "Novo bloco do diário"}
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
