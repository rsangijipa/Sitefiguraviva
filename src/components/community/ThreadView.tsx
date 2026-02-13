"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  Pin,
  Lock,
  User,
  MoreVertical,
} from "lucide-react";
import { CommunityThreadDoc, CommunityReplyDoc } from "@/types/lms";
import { communityService } from "@/services/communityService";
import { useRepliesRealtime } from "@/hooks/useCommunityRealtime";
import { usePresence } from "@/hooks/usePresence";
import ReplyComposer from "./ReplyComposer";
import { cn } from "@/lib/utils";

interface ThreadViewProps {
  courseId: string;
  thread: CommunityThreadDoc;
  user: any; // Current user
  onBack: () => void;
}

export default function ThreadView({
  courseId,
  thread,
  user,
  onBack,
}: ThreadViewProps) {
  const { replies, loading } = useRepliesRealtime(courseId, thread.id);
  const { activeUsers, setIsTyping } = usePresence(
    user?.uid,
    thread.id,
    user?.displayName || "Aluno",
    user?.photoURL,
  );

  const handleReply = async (content: string) => {
    await communityService.createReply(courseId, thread.id, user, content);
  };

  const typingUsers = activeUsers.filter((u) => u.isTyping);

  return (
    <div className="animate-in fade-in slide-in-from-right-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-stone-500 hover:text-primary text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para discussões
        </button>

        {/* Active Users Bubble */}
        {activeUsers.length > 0 && (
          <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-stone-100 shadow-sm">
            <div className="flex -space-x-2">
              {activeUsers.slice(0, 3).map((u, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-white bg-stone-100 overflow-hidden"
                  title={u.name}
                >
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={12} className="m-1 text-stone-400" />
                  )}
                </div>
              ))}
            </div>
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-tighter">
              {activeUsers.length} Online
            </span>
          </div>
        )}
      </div>

      {/* Thread Header */}
      <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-xl font-bold text-stone-800">{thread.title}</h1>
          <div className="flex gap-2">
            {thread.isPinned && (
              <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                <Pin size={10} /> Fixado
              </span>
            )}
            {thread.isLocked && (
              <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                <Lock size={10} /> Trancado
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-stone-100">
          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center overflow-hidden">
            {thread.authorAvatar ? (
              <img src={thread.authorAvatar} className="w-full h-full" />
            ) : (
              <User className="text-stone-400" />
            )}
          </div>
          <div>
            <div className="font-bold text-sm text-stone-700">
              {thread.authorName}
            </div>
            <div className="text-xs text-stone-400 flex items-center gap-2">
              <span>
                Iniciado em{" "}
                {thread.createdAt?.toDate
                  ? thread.createdAt.toDate().toLocaleDateString()
                  : "Data"}
              </span>
            </div>
          </div>
        </div>

        <div className="prose prose-stone max-w-none text-stone-600 mb-4">
          {thread.content}
        </div>
      </div>

      {/* Replies List */}
      <div className="space-y-6 mb-8">
        <h3 className="font-bold text-stone-700 flex items-center gap-2">
          <MessageSquare size={18} /> Respostas ({replies.length})
        </h3>

        {loading ? (
          <div className="text-center py-8 text-stone-400">
            Carregando respostas...
          </div>
        ) : replies.length > 0 ? (
          replies.map((reply) => (
            <div key={reply.id} className="flex gap-4 group">
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0 mt-1 overflow-hidden">
                {reply.authorAvatar ? (
                  <img src={reply.authorAvatar} className="w-full h-full" />
                ) : (
                  <User size={14} className="text-stone-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-stone-700">
                      {reply.authorName}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {reply.createdAt?.toDate
                        ? reply.createdAt.toDate().toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600">{reply.content}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-stone-400 text-sm italic ml-12">
            Nenhuma resposta ainda.
          </div>
        )}
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="ml-12 mb-2 flex items-center gap-2 text-[10px] font-bold text-primary/60 uppercase animate-pulse">
          <div className="flex gap-1">
            <span className="w-1 h-1 rounded-full bg-current animate-bounce" />
            <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
            <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
          </div>
          {typingUsers.length === 1
            ? `${typingUsers[0].name} está digitando...`
            : `${typingUsers.length} pessoas estão digitando...`}
        </div>
      )}

      {/* Reply Input */}
      {!thread.isLocked ? (
        <div className="ml-12">
          <ReplyComposer onReply={handleReply} onTyping={setIsTyping} />
        </div>
      ) : (
        <div className="bg-stone-100 p-4 rounded-xl text-center text-stone-500 text-sm">
          Este tópico está trancado para novas respostas.
        </div>
      )}
    </div>
  );
}
