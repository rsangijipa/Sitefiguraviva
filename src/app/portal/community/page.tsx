"use client";

import { useState } from "react";
import {
  MessageCircle,
  Search,
  Filter,
  Plus,
  ThumbsUp,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";

const MOCK_TOPICS = [
  {
    id: 1,
    author: { name: "Ana Clara", avatar: null, role: "student" },
    title: "Dúvida sobre o conceito de Fundo-Figura na prática clínica",
    excerpt:
      "Estou tendo dificuldades em identificar o momento exato de transição...",
    tags: ["Dúvida", "Gestalt Clínica"],
    likes: 12,
    replies: 4,
    time: "2h atrás",
  },
  {
    id: 2,
    author: { name: "Roberto Silva", avatar: null, role: "moderator" },
    title: "Leitura recomendada da semana: 'A Arte de Viver'",
    excerpt:
      "Pessoal, achei esse artigo incrível sobre a aplicação da Gestalt no cotidiano...",
    tags: ["Leitura", "Indicação"],
    likes: 45,
    replies: 18,
    time: "5h atrás",
  },
  {
    id: 3,
    author: { name: "Carla Mendes", avatar: null, role: "student" },
    title: "Alguém para grupo de estudos em SP?",
    excerpt:
      "Gostaria de formar um grupo presencial para discutir os módulos do curso...",
    tags: ["Networking", "São Paulo"],
    likes: 8,
    replies: 2,
    time: "1d atrás",
  },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("all");

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
        {MOCK_TOPICS.map((topic, i) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center text-xs font-bold text-stone-600">
                  {topic.author.name[0]}
                </div>
                <span className="text-sm font-bold text-stone-700">
                  {topic.author.name}
                </span>
                {topic.author.role === "moderator" && (
                  <span className="text-[10px] font-bold uppercase bg-gold/10 text-gold-dark px-2 py-0.5 rounded-full">
                    Mod
                  </span>
                )}
                <span className="text-xs text-stone-400">• {topic.time}</span>
              </div>
              <button className="text-stone-300 hover:text-stone-500">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <h3 className="text-lg font-bold text-stone-800 mb-2 group-hover:text-primary transition-colors">
              {topic.title}
            </h3>
            <p className="text-stone-500 text-sm mb-4 line-clamp-2">
              {topic.excerpt}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {topic.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-1 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-stone-400 text-sm">
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <ThumbsUp size={16} />
                  <span>{topic.likes}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <MessageSquare size={16} />
                  <span>{topic.replies}</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
