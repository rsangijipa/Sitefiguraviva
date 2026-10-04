"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
} from "lucide-react";
import { useGallery } from "@/hooks/useContent";
import { useToast } from "@/context/ToastContext";
import { deleteGalleryItemAction } from "@/app/actions/gallery";
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/AdminStates";
import { Toolbar } from "@/components/admin/Toolbar";

export default function GalleryManager() {
  const router = useRouter();
  const { data: gallery = [], isLoading: loading, refetch, error } = useGallery();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir esta imagem?")) return;
    try {
      const res = await deleteGalleryItemAction(id);
      if (res.success) {
        refetch();
        addToast("Imagem excluída da galeria!", "success");
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      addToast("Erro ao excluir imagem: " + err.message, "error");
    }
  };

  const filteredGallery = gallery
    .filter((item) => {
      const matchesSearch =
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.caption?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "Todos" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a: any, b: any) => {
      const dateA = a.created_at?.seconds || 0;
      const dateB = b.created_at?.seconds || 0;
      return dateB - dateA;
    });

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-serif text-2xl mb-1 text-primary">
            Galeria de Imagens
          </h1>
          <p className="text-primary/60 text-sm max-w-lg">
            Gerencie as fotografias exibidas na galeria do site. Adicione fotos em alta qualidade de encontros, workshops e momentos no instituto.
          </p>
        </div>
        <Link
          href="/admin/gallery/new"
          className="bg-primary text-paper px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-gold transition-colors shadow-sm"
        >
          <Plus size={16} /> Nova Imagem
        </Link>
      </header>

      {/* Filters & Search */}
      <Toolbar className="items-end">
        <div className="flex-1 w-full space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 ml-2">
            Buscar
          </label>
          <input
            type="text"
            placeholder="Filtrar por título ou legenda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
          />
        </div>
        <div className="w-full md:w-64 space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 ml-2">
            Filtrar Categoria
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold cursor-pointer"
          >
            <option value="Todos">Todas as Categorias</option>
            <option value="Geral">Geral</option>
            <option value="Eventos">Eventos</option>
            <option value="Workshops">Workshops</option>
            <option value="Espaço">Espaço</option>
            <option value="Encontros">Encontros</option>
          </select>
        </div>
      </Toolbar>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-primary" />
            <h3 className="text-lg font-serif text-primary">
              Imagens cadastradas ({filteredGallery.length})
            </h3>
          </div>
        </div>

        {loading ? (
          <AdminLoadingState rows={6} />
        ) : error ? (
          <AdminErrorState title="Não foi possível carregar a galeria." retry={() => refetch()} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredGallery.map((item) => (
              <article
                key={item.id}
                onClick={() => router.push(`/admin/gallery/${item.id}`)}
                className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-lg cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                    {item.category || "Geral"}
                  </div>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                    title="Excluir imagem"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-primary text-base line-clamp-1 group-hover:text-gold transition-colors">
                      {item.title}
                    </h4>
                    {item.caption && (
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                        {item.caption}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                    <span className="flex items-center gap-1 font-medium text-primary/70 group-hover:text-primary">
                      <Edit3 size={13} /> Editar imagem
                    </span>
                    <ExternalLink size={13} className="text-stone-400 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </article>
            ))}
            {filteredGallery.length === 0 && (
              <div className="col-span-full">
                <AdminEmptyState
                  title="Nenhuma imagem encontrada"
                  description="Ajuste os filtros ou cadastre uma nova foto para a galeria."
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
