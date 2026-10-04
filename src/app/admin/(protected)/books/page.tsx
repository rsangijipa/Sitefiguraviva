"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Trash2,
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Edit3,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useToast } from "@/context/ToastContext";
import {
  listBooksAction,
  deleteBookAction,
  setBookPublishedAction,
  reorderBooksAction,
} from "@/app/actions/books";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
} from "@/components/admin/AdminStates";

interface BookRow {
  id: string;
  title: string;
  author: string;
  description: string;
  cover_image_url: string;
  cover_storage_path: string;
  purchase_url: string;
  publication_year: number | null;
  is_published: boolean;
  sort_order: number;
}

export default function BooksManager() {
  const { addToast } = useToast();
  const [books, setBooks] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBooks = async () => {
    setLoading(true);
    setError(null);
    const res = await listBooksAction();
    if (res.success) {
      setBooks(res.data as BookRow[]);
    } else {
      setError(res.error || "Erro ao carregar a estante.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir este livro da estante?"))
      return;
    const res = await deleteBookAction(id);
    if (res.success) {
      addToast("Livro excluído com sucesso!", "success");
      await loadBooks();
    } else {
      addToast("Erro ao excluir livro: " + res.error, "error");
    }
  };

  const handleTogglePublish = async (book: BookRow, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await setBookPublishedAction(book.id, !book.is_published);
    if (res.success) {
      setBooks((prev) =>
        prev.map((item) =>
          item.id === book.id
            ? { ...item, is_published: !item.is_published }
            : item,
        ),
      );
      addToast(
        book.is_published
          ? "Livro despublicado da estante."
          : "Livro publicado na estante!",
        "success",
      );
    } else {
      addToast("Erro ao atualizar publicação: " + res.error, "error");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;

    const reordered = Array.from(books);
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setBooks(reordered);

    const res = await reorderBooksAction(reordered.map((book) => book.id));
    if (!res.success) {
      addToast("Erro ao reordenar: " + res.error, "error");
      await loadBooks();
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-serif text-2xl mb-1 text-primary">
            Estante de Livros
          </h1>
          <p className="text-primary/60 text-sm max-w-lg">
            Curadoria de recomendações bibliográficas exibidas em /estante. Arraste para
            reordenar os livros na estante pública.
          </p>
        </div>
        <Link
          href="/admin/books/new"
          className="bg-primary text-paper px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-gold transition-colors shadow-sm"
        >
          <Plus size={16} /> Novo Livro
        </Link>
      </header>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            <h3 className="text-lg font-serif text-primary">
              Livros recomendados ({books.length})
            </h3>
          </div>
        </div>

        {loading ? (
          <AdminLoadingState rows={4} />
        ) : error ? (
          <AdminErrorState
            title="Não foi possível carregar a estante."
            retry={loadBooks}
          />
        ) : books.length === 0 ? (
          <AdminEmptyState
            title="Nenhum livro cadastrado"
            description="Adicione o primeiro livro para começar a curadoria da estante."
          />
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="books-list">
              {(droppableProvided) => (
                <div
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                  className="space-y-3"
                >
                  {books.map((book, index) => (
                    <Draggable
                      key={book.id}
                      draggableId={book.id}
                      index={index}
                    >
                      {(draggableProvided, snapshot) => (
                        <article
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          className={`flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm transition-all hover:border-gold/40 hover:shadow-md ${
                            snapshot.isDragging ? "shadow-2xl ring-2 ring-primary/20" : ""
                          }`}
                        >
                          <button
                            {...draggableProvided.dragHandleProps}
                            aria-label={`Reordenar ${book.title}`}
                            className="shrink-0 p-2 text-stone-300 hover:text-primary cursor-grab active:cursor-grabbing transition-colors"
                          >
                            <GripVertical size={18} />
                          </button>

                          <Link
                            href={`/admin/books/${book.id}`}
                            className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-100 border border-stone-200 shadow-sm"
                          >
                            {book.cover_image_url ? (
                              <img
                                src={book.cover_image_url}
                                alt=""
                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-stone-300">
                                <BookOpen size={20} />
                              </div>
                            )}
                          </Link>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/admin/books/${book.id}`}
                              className="font-serif text-base font-bold text-primary hover:text-gold transition-colors truncate block"
                            >
                              {book.title}
                            </Link>
                            <p className="truncate text-xs text-stone-500 mt-0.5">
                              {book.author}
                              {book.publication_year ? ` • ${book.publication_year}` : ""}
                            </p>
                            <span
                              className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                book.is_published
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-stone-100 text-stone-500 border border-stone-200"
                              }`}
                            >
                              {book.is_published ? "Publicado" : "Rascunho"}
                            </span>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              onClick={(e) => handleTogglePublish(book, e)}
                              title={
                                book.is_published ? "Despublicar" : "Publicar"
                              }
                              className="p-2 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-xl transition-colors"
                            >
                              {book.is_published ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                            <Link
                              href={`/admin/books/${book.id}`}
                              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-primary hover:text-gold hover:bg-stone-50 rounded-xl transition-colors"
                            >
                              <Edit3 size={14} /> Editar
                            </Link>
                            <button
                              onClick={(e) => handleDelete(book.id, e)}
                              className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              title="Excluir da estante"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </article>
                      )}
                    </Draggable>
                  ))}
                  {droppableProvided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
