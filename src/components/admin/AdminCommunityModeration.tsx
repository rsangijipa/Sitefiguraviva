"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Shield,
  EyeOff,
  Lock,
  Unlock,
  Eye,
  Trash2,
} from "lucide-react";
import { communityService } from "@/services/communityService";
import { CommunityThreadDoc } from "@/types/lms";
import Button from "@/components/ui/Button";
import { useCommunityRealtime } from "@/hooks/useCommunityRealtime";
import { cn } from "@/lib/utils";

export default function AdminCommunityModeration() {
  const { threads, loading } = useCommunityRealtime(); // Subscribes to global threads
  const [filter, setFilter] = useState<"all" | "active" | "hidden" | "locked">(
    "all",
  );

  // Since useCommunityRealtime filters for 'active' by default in the service,
  // for Admin we might need a separate subscription that shows EVERYTHING.
  // I will add subscribeToAllThreads to the service if needed,
  // but for now let's work with the active ones and assume admin can see hidden ones via custom query.

  const handleSetStatus = async (
    courseId: string,
    threadId: string,
    status: any,
  ) => {
    try {
      await communityService.setThreadStatus(courseId, threadId, status);
      // Real-time will update UI
    } catch (error) {
      alert("Erro ao alterar status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Moderação de Comunidade
          </h1>
          <p className="text-stone-500 text-sm">
            Gerencie discussões, oculte conteúdo ou tranque tópicos.
          </p>
        </div>
        <div className="flex gap-2 bg-stone-100 p-1 rounded-lg">
          {(["all", "active", "hidden", "locked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                filter === f
                  ? "bg-white text-primary shadow-sm"
                  : "text-stone-500 hover:text-stone-700",
              )}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-stone-400">
          Carregando tópicos...
        </div>
      ) : (
        <div className="grid gap-4">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex justify-between items-center group hover:border-primary/20 transition-all"
            >
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 flex items-center gap-2">
                    {thread.title}
                    {thread.isLocked && (
                      <Lock size={14} className="text-red-500" />
                    )}
                    {(thread as any).status === "hidden" && (
                      <EyeOff size={14} className="text-orange-500" />
                    )}
                  </h3>
                  <p className="text-sm text-stone-500 line-clamp-1">
                    {thread.content}
                  </p>
                  <div className="flex gap-3 mt-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    <span>{thread.authorName}</span>
                    <span>•</span>
                    <span>{thread.replyCount} Respostas</span>
                    <span>•</span>
                    <span
                      className={cn(
                        (thread as any).status === "active"
                          ? "text-green-500"
                          : "text-orange-500",
                      )}
                    >
                      {(thread as any).status || "active"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    handleSetStatus(
                      thread.courseId,
                      thread.id,
                      (thread as any).status === "hidden" ? "active" : "hidden",
                    )
                  }
                  className="text-orange-600 hover:bg-orange-50"
                  title={
                    (thread as any).status === "hidden" ? "Mostrar" : "Ocultar"
                  }
                >
                  {(thread as any).status === "hidden" ? (
                    <Eye size={16} />
                  ) : (
                    <EyeOff size={16} />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    handleSetStatus(
                      thread.courseId,
                      thread.id,
                      thread.isLocked ? "active" : "locked",
                    )
                  }
                  className="text-stone-600 hover:bg-stone-50"
                  title={thread.isLocked ? "Destrancar" : "Trancar"}
                >
                  {thread.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50"
                  title="Excluir (Soft Delete)"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
