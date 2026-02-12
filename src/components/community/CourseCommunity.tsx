"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Search, Filter } from "lucide-react";
import Button from "@/components/ui/Button";
import { CommunityThreadDoc } from "@/types/lms";
import { communityService } from "@/services/communityService";
import ThreadView from "./ThreadView";
import { cn } from "@/lib/utils"; // Assuming utils exists

interface CourseCommunityProps {
  courseId: string;
  user: any;
}

export default function CourseCommunity({
  courseId,
  user,
}: CourseCommunityProps) {
  const [view, setView] = useState<"list" | "detail" | "create">("list");
  const [selectedThread, setSelectedThread] =
    useState<CommunityThreadDoc | null>(null);
  const [threads, setThreads] = useState<CommunityThreadDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Form State
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadThreads();
  }, [courseId]);

  const loadThreads = async () => {
    setLoading(true);
    const data = await communityService.getCourseThreads(courseId);
    setThreads(data);
    setLoading(false);
  };

  const handleSelectThread = (thread: CommunityThreadDoc) => {
    setSelectedThread(thread);
    setView("detail");
  };

  const handleBack = () => {
    setView("list");
    setSelectedThread(null);
    loadThreads(); // Refresh to update reply counts etc
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    setIsCreating(true);
    try {
      const id = await communityService.createThread(
        courseId,
        user,
        newThreadTitle,
        newThreadContent,
      );
      // Optimistic update or reload
      loadThreads();
      setView("list");
      setNewThreadTitle("");
      setNewThreadContent("");
    } catch (error) {
      console.error(error);
      alert("Erro ao criar tópico");
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
          <h2 className="text-xl font-bold text-stone-800">Novo Tópico</h2>
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
              Título
            </label>
            <input
              id="course-topic-title"
              name="title"
              type="text"
              className="w-full p-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Resumo da sua dúvida ou discussão"
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
              Conteúdo
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
              {isCreating ? "Publicando..." : "Publicar Tópico"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-stone-800 text-lg">
          Discussões da Turma
        </h3>
        <Button size="sm" onClick={() => setView("create")}>
          Nova Pergunta
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400">
          Carregando discussões...
        </div>
      ) : threads.length > 0 ? (
        <div className="space-y-4">
          {threads.map((thread) => (
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
                  <span>Por {thread.authorName || "Anônimo"}</span>
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
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-stone-200">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <MessageSquare size={32} />
          </div>
          <h3 className="font-bold text-stone-800 text-lg mb-2">
            Comunidade Vazia
          </h3>
          <p className="text-stone-500 max-w-md mx-auto mb-6">
            Seja o primeiro a iniciar uma discussão!
          </p>
          <Button variant="outline" onClick={() => setView("create")}>
            Criar Tópico
          </Button>
        </div>
      )}
    </div>
  );
}
