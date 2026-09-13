"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Save,
  BookOpen,
  Trash2,
  Loader2,
  Plus,
  X,
  GripVertical,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useToast } from "@/context/ToastContext";
import ImageUpload from "@/components/admin/ImageUpload";
import {
  listBooksAction,
  saveBookAction,
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

const initialForm = {
  id: "",
  title: "",
  author: "",
  description: "",
  coverImageUrl: "",
  coverStoragePath: "",
  purchaseUrl: "",
  publicationYear: "",
};

export default function BooksManager() {
  const { addToast } = useToast();
  const [books, setBooks] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverConfirmed, setCoverConfirmed] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.coverImageUrl) {
      addToast("Envie a capa do livro antes de salvar.", "error");
      return;
    }
    if (!coverConfirmed) {
      addToast(
        "Confirme que a imagem da capa é autorizada para uso no site.",
        "error",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const trimmedYear = formData.publicationYear.trim();
      const publicationYear = trimmedYear ? Number(trimmedYear) : null;
      if (publicationYear !== null && !Number.isInteger(publicationYear)) {
        addToast("Ano de publicação inválido.", "error");
        setIsSubmitting(false);
        return;
      }

      const res = await saveBookAction(formData.id || null, {
        ...formData,
        publicationYear,
      });
      if (res.success) {
        addToast(
          formData.id ? "Livro atualizado!" : "Livro adicionado à estante!",
          "success",
        );
        await loadBooks();
        setFormData(initialForm);
        setCoverConfirmed(false);
        setIsEditing(false);
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      addToast("Erro ao salvar livro: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (book: BookRow) => {
    setFormData({
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description || "",
      coverImageUrl: book.cover_image_url,
      coverStoragePath: book.cover_storage_path,
      purchaseUrl: book.purchase_url,
      publicationYear:
        book.publication_year != null ? String(book.publication_year) : "",
    });
    setCoverConfirmed(true);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este livro da estante?"))
      return;
    const res = await deleteBookAction(id);
    if (res.success) {
      addToast("Livro excluído!", "success");
      await loadBooks();
    } else {
      addToast("Erro ao excluir: " + res.error, "error");
    }
  };

  const handleTogglePublish = async (book: BookRow) => {
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
          ? "Livro despublicado."
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
    <div className="space-y-5 pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-serif text-2xl mb-1 text-primary">
            Estante de Livros
          </h1>
          <p className="text-primary/40 text-sm max-w-lg">
            Curadoria de recomendações exibidas em /estante. Arraste para
            reordenar; publique apenas quando a capa estiver autorizada.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData(initialForm);
            setCoverConfirmed(false);
            setIsEditing(true);
          }}
          className="bg-primary text-paper px-4 py-2.5 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-gold transition-soft"
        >
          <Plus size={16} /> Novo Livro
        </button>
      </header>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 overflow-y-auto bg-primary/20 backdrop-blur-sm"
              >
                <div className="flex min-h-full items-center justify-center p-4 py-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="book-editor-title"
                    className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-4rem)]"
                  >
                    <div className="shrink-0 p-4 md:p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                      <div>
                        <h2
                          id="book-editor-title"
                          className="font-serif text-lg text-primary"
                        >
                          {formData.id ? "Editar Livro" : "Novo Livro"}
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mt-0.5">
                          Detalhes da recomendação
                        </p>
                      </div>
                      <button
                        onClick={() => setIsEditing(false)}
                        aria-label="Fechar editor sem salvar"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X size={20} className="text-primary/40" />
                      </button>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="overflow-y-auto bg-[#FDFCF9]"
                    >
                      <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-[220px_1fr]">
                        {/* Coluna da capa */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-1">
                            Capa do livro
                          </label>
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
                            className="aspect-[2/3] w-full rounded-xl"
                          />
                          <label className="flex items-start gap-2 text-[11px] leading-snug text-primary/70">
                            <input
                              type="checkbox"
                              checked={coverConfirmed}
                              onChange={(e) =>
                                setCoverConfirmed(e.target.checked)
                              }
                              className="mt-0.5 shrink-0"
                            />
                            Confirmo que tenho autorização para usar esta imagem
                            de capa no site.
                          </label>
                        </div>

                        {/* Coluna dos campos */}
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-1">
                              Título
                            </label>
                            <input
                              required
                              value={formData.title}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  title: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-primary font-serif text-base"
                              placeholder="Ex: Gestalt-Terapia Explicada"
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-1">
                                Autor(a)
                              </label>
                              <input
                                required
                                value={formData.author}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    author: e.target.value,
                                  })
                                }
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm text-primary"
                                placeholder="Ex: Fritz Perls"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-1">
                                Ano de publicação
                              </label>
                              <input
                                type="number"
                                inputMode="numeric"
                                min={0}
                                max={9999}
                                value={formData.publicationYear}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    publicationYear: e.target.value,
                                  })
                                }
                                className="w-full sm:w-28 bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm text-primary"
                                placeholder="Opcional"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-1">
                              Descrição curta
                            </label>
                            <textarea
                              rows={4}
                              value={formData.description}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  description: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm text-primary/80 resize-none"
                              placeholder="Por que essa leitura importa para a formação e a clínica..."
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-1">
                              Link para compra / catálogo (onde encontrar)
                            </label>
                            <input
                              required
                              type="url"
                              value={formData.purchaseUrl}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  purchaseUrl: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm text-primary/70"
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gray-100 bg-white p-4">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:bg-gray-50 transition-colors"
                          disabled={isSubmitting}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-primary text-paper px-6 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-soft shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                          {isSubmitting ? "Salvando..." : "Salvar Livro"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={20} className="text-gold" />
          <h3 className="text-xl font-serif text-primary">Livros na Estante</h3>
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
                          className={`flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-3 shadow-sm transition-shadow ${
                            snapshot.isDragging ? "shadow-xl" : ""
                          }`}
                        >
                          <button
                            {...draggableProvided.dragHandleProps}
                            aria-label={`Reordenar ${book.title}`}
                            className="shrink-0 p-2 text-stone-300 hover:text-primary cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical size={18} />
                          </button>

                          <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-md bg-stone-100 border border-stone-200">
                            {book.cover_image_url && (
                              <img
                                src={book.cover_image_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-serif text-base text-primary">
                              {book.title}
                            </p>
                            <p className="truncate text-xs text-primary/50">
                              {book.author}
                            </p>
                            <span
                              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                                book.is_published
                                  ? "bg-green-50 text-green-700"
                                  : "bg-stone-100 text-stone-500"
                              }`}
                            >
                              {book.is_published ? "Publicado" : "Rascunho"}
                            </span>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              onClick={() => handleTogglePublish(book)}
                              title={
                                book.is_published ? "Despublicar" : "Publicar"
                              }
                              className="p-2 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors"
                            >
                              {book.is_published ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(book)}
                              className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:bg-stone-50 rounded-lg transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(book.id)}
                              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
