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
} from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { db } from "@/lib/firebase/client";
import { deleteDoc, doc } from "firebase/firestore";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@/components/ui/Modal";
import { BlogPostForm } from "./components/BlogPostForm";

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
        await deleteDoc(doc(db, "posts", id));
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
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 shrink-0 overflow-hidden">
            {row.image ? (
              <img
                src={row.image}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : row.type === "library" ? (
              <FileText size={20} />
            ) : (
              <BookOpen size={20} />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-stone-800 text-sm">
              {row.title}
            </span>
            <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
              <User size={10} /> {row.author || "Richard Sangi"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Tipo",
      render: (row) => (
        <Badge
          variant={row.type === "library" ? "secondary" : "outline"}
          className="font-bold"
        >
          {row.type === "library" ? "BIBLIOTECA" : "BLOG"}
        </Badge>
      ),
    },
    {
      key: "date",
      label: "Data",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium whitespace-nowrap">
          <Calendar size={12} className="text-stone-300" />
          {row.date}
        </div>
      ),
    },
    {
      key: "stats",
      label: "Conteúdo",
      render: (row) => (
        <div className="flex flex-col gap-1">
          {row.type === "library" ? (
            <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase tracking-wider">
              <FileText size={12} /> PDF Anexado
            </div>
          ) : (
            <div className="text-[10px] text-stone-400 font-medium">
              {row.readingTime || "5 min"} de leitura
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Blog & Biblioteca"
      description="Gerencie artigos informativos e materiais de apoio para seus alunos."
      breadcrumbs={[{ label: "Blog" }]}
      actions={
        <button
          onClick={() => {
            setEditingPost(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-6 py-4 rounded-xl flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-all shadow-lg active:scale-95"
        >
          <Plus size={16} /> Nova Publicação
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-stone-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Artigos
            </span>
            <BookOpen size={18} className="text-primary/40" />
          </div>
          <div className="text-3xl font-serif font-bold text-primary">
            {blogPosts.filter((p: any) => p.type !== "library").length}
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-stone-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Materiais PDF
            </span>
            <FileText size={18} className="text-stone-300" />
          </div>
          <div className="text-3xl font-serif font-bold text-stone-800">
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
                className="p-2 text-stone-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                title="Ver PDF"
              >
                <ExternalLink size={18} />
              </a>
            )}
            <button
              onClick={() => handleEdit(row)}
              className="p-2 text-stone-400 hover:text-gold hover:bg-gold/5 rounded-xl transition-all"
              title="Editar"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => handleDelete(row.id, row.title)}
              disabled={isPending}
              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
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
                {editingPost ? "Editar Publicação" : "Nova Publicação"}
              </h2>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                Blog & Biblioteca Viva
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
