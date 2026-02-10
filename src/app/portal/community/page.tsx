"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle,
  Search,
  Filter,
  Plus,
  ThumbsUp,
  MessageSquare,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { communityService } from "@/services/communityService";
import { CommunityThreadDoc } from "@/types/lms";
import Link from "next/link";
// Removed date-fns

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [threads, setThreads] = useState<CommunityThreadDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadThreads() {
      try {
        const data = await communityService.getGlobalThreads(20);
        setThreads(data);
      } catch (error) {
        console.error("Failed to load community threads", error);
      } finally {
        setLoading(false);
      }
    }
    loadThreads();
  }, []);

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "agora mesmo";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;

    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-stone-800">Comunidade</h1>
          <p className="text-stone-500">
            Troque experiências e tire dúvidas com outros alunos.
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2 px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
          <Plus size={20} />
          <span>Novo Tópico</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Pesquisar discussões..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold/20 outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {["Todos", "Dúvidas", "Indicações", "Geral"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.toLowerCase() || (activeTab === "all" && tab === "Todos") ? "bg-stone-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : threads.length > 0 ? (
          threads.map((topic, i) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center text-xs font-bold text-stone-600 overflow-hidden">
                    {topic.authorAvatar ? (
                      <img
                        src={topic.authorAvatar}
                        alt={topic.authorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      topic.authorName?.[0] || "?"
                    )}
                  </div>
                  <span className="text-sm font-bold text-stone-700">
                    {topic.authorName}
                  </span>
                  {/* Moderator logic would imply storing role in thread doc or fetching user */}
                  <span className="text-xs text-stone-400">
                    • {formatTimeAgo(topic.createdAt)}
                  </span>
                </div>
                <button className="text-stone-300 hover:text-stone-500">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <h3 className="text-lg font-bold text-stone-800 mb-2 group-hover:text-primary transition-colors">
                {topic.title}
              </h3>
              <p className="text-stone-500 text-sm mb-4 line-clamp-2">
                {topic.content}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {/* Tags are not currently in CommunityThreadDoc but useful for future */}
                  <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-1 rounded-md">
                    #Geral
                  </span>
                </div>

                <div className="flex items-center gap-4 text-stone-400 text-sm">
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <ThumbsUp size={16} />
                    <span>{topic.likeCount}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <MessageSquare size={16} />
                    <span>{topic.replyCount}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-stone-50 rounded-xl border border-dashed border-stone-200">
            <MessageCircle size={48} className="text-stone-300 mb-4" />
            <h3 className="text-lg font-bold text-stone-700">
              Comunidade Silenciosa
            </h3>
            <p className="text-stone-500 text-sm mb-6">
              Seja o primeiro a iniciar uma discussão!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
