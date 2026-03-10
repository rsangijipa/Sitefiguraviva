"use client";

import { useMemo, useState } from "react";
import { MessageSquare, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import { CommunityThreadDoc } from "@/types/lms";
import { communityService } from "@/services/communityService";
import ThreadView from "./ThreadView";
import { useCommunityRealtime } from "@/hooks/useCommunityRealtime";

interface CourseCommunityProps {
  courseId: string;
  user: any;
}

type SortMode = "latest" | "most_replied";

const getDateMillis = (value: any) => {
  if (!value) return 0;
  if (value.toDate) return value.toDate().getTime();
  if (value.seconds) return value.seconds * 1000;
  return 0;
};

export default function CourseCommunity({
  courseId,
  user,
}: CourseCommunityProps) {
  const [view, setView] = useState<"list" | "detail" | "create">("list");
  const [selectedThread, setSelectedThread] =
    useState<CommunityThreadDoc | null>(null);
  const { threads, loading } = useCommunityRealtime(courseId);

  // List controls
  const [searchTerm, setSearchTerm] = useState("");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("latest");

  // Create form state
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredThreads = useMemo(() => {
    const bySearch = threads.filter((thread) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        thread.title?.toLowerCase().includes(normalizedSearch) ||
        thread.content?.toLowerCase().includes(normalizedSearch) ||
        thread.authorName?.toLowerCase().includes(normalizedSearch);

      const matchesPinned = !pinnedOnly || !!thread.isPinned;
      return matchesSearch && matchesPinned;
    });

    return bySearch.sort((a, b) => {
      if (sortMode === "most_replied") {
        return (b.replyCount || 0) - (a.replyCount || 0);
      }

      const aRecency = Math.max(
        getDateMillis(a.lastReplyAt),
        getDateMillis(a.createdAt),
      );
      const bRecency = Math.max(
        getDateMillis(b.lastReplyAt),
        getDateMillis(b.createdAt),
      );
      return bRecency - aRecency;
    });
  }, [threads, normalizedSearch, pinnedOnly, sortMode]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setPinnedOnly(false);
    setSortMode("latest");
  };

  const handleSelectThread = (thread: CommunityThreadDoc) => {
    setSelectedThread(thread);
    setView("detail");
  };

  const handleBack = () => {
    setView("list");
    setSelectedThread(null);
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    setIsCreating(true);
    try {
      await communityService.createThread(
        courseId,
        user,
        newThreadTitle,
        newThreadContent,
      );
      setView("list");
      setNewThreadTitle("");
      setNewThreadContent("");
    } catch (error) {
      console.error(error);
      alert("Erro ao criar topico");
    } finally {
      setIsCreating(false);
    }
  };

  if (view === "detail" && selectedThread) {
    return (
      <ThreadView
        courseId={courseId}
        thread={selectedThread}
        user={user}
        onBack={handleBack}
      />
    );
  }

  if (view === "create") {
    return (
      <div className="animate-in fade-in max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-stone-800">Novo Topico</h2>
          <Button variant="ghost" onClick={() => setView("list")}>
            Cancelar
          </Button>
        </div>

        <form
          onSubmit={handleCreateThread}
          className="space-y-6 bg-white p-6 rounded-xl border border-stone-200 shadow-sm"
        >
          <div>
            <label
              htmlFor="course-topic-title"
              className="block text-sm font-bold text-stone-700 mb-2"
            >
              Titulo
            </label>
            <input
              id="course-topic-title"
              name="title"
              type="text"
              className="w-full p-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Resumo da sua duvida ou discussao"
              value={newThreadTitle}
              onChange={(e) => setNewThreadTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="course-topic-content"
              className="block text-sm font-bold text-stone-700 mb-2"
            >
              Conteudo
            </label>
            <textarea
              id="course-topic-content"
              name="content"
              className="w-full p-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[200px]"
              placeholder="Descreva detalhadamente..."
              value={newThreadContent}
              onChange={(e) => setNewThreadContent(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Publicando..." : "Publicar Topico"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  const hasFilters = normalizedSearch.length > 0 || pinnedOnly;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-stone-800 text-lg">
            Discussoes da Turma
          </h3>
          {!loading && (
            <p className="text-xs text-stone-400 mt-1">
              {filteredThreads.length} de {threads.length} topicos visiveis
            </p>
          )}
        </div>
        <Button size="sm" onClick={() => setView("create")}>
          Nova Pergunta
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-stone-100 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por titulo, conteudo ou autor"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={pinnedOnly ? "primary" : "outline"}
            onClick={() => setPinnedOnly((value) => !value)}
          >
            Apenas Fixados
          </Button>

          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white"
          >
            <option value="latest">Mais Recentes</option>
            <option value="most_replied">Mais Respondidos</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400">
          Carregando discussoes...
        </div>
      ) : filteredThreads.length > 0 ? (
        <div className="space-y-4">
          {filteredThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => handleSelectThread(thread)}
              className="bg-white p-6 rounded-xl border border-stone-100 hover:border-primary/30 transition-all cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-stone-700 group-hover:text-primary transition-colors text-base">
                  {thread.title}
                </h4>
                {thread.isPinned && (
                  <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    Fixado
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-500 line-clamp-2 mb-4">
                {thread.content}
              </p>
              <div className="flex items-center justify-between text-xs text-stone-400 font-medium border-t border-stone-50 pt-4">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-stone-500">
                    <MessageSquare size={14} />
                    {thread.replyCount} respostas
                  </span>
                  <span>Por {thread.authorName || "Anonimo"}</span>
                </div>
                <span>
                  {thread.lastReplyAt?.toDate
                    ? `Atualizado em ${thread.lastReplyAt.toDate().toLocaleDateString()}`
                    : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : threads.length > 0 && hasFilters ? (
        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-stone-200">
          <h3 className="font-bold text-stone-800 mb-2">
            Nenhum topico encontrado
          </h3>
          <p className="text-sm text-stone-500 mb-4">
            Ajuste sua busca ou limpe os filtros para ver todos os topicos.
          </p>
          <Button variant="outline" onClick={handleClearFilters}>
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-stone-200">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <MessageSquare size={32} />
          </div>
          <h3 className="font-bold text-stone-800 text-lg mb-2">
            Comunidade Vazia
          </h3>
          <p className="text-stone-500 max-w-md mx-auto mb-6">
            Seja o primeiro a iniciar uma discussao!
          </p>
          <Button variant="outline" onClick={() => setView("create")}>
            Criar Topico
          </Button>
        </div>
      )}
    </div>
  );
}
