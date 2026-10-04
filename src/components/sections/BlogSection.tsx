"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "../ui/Skeleton";
import { Card, CardContent } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import SectionShell from "../ui/SectionShell";

interface BlogPost {
  id: string | number;
  title: string;
  date: string;
  excerpt: string;
  image?: string;
  type?: string;
  category?: string;
  slug?: string;
}

interface BlogSectionProps {
  blogPosts: BlogPost[];
  onSelectPost?: (post: BlogPost) => void;
  loading?: boolean;
}

export default function BlogSection({
  blogPosts = [],
  loading = false,
}: BlogSectionProps) {
  const [activeTab, setActiveTab] = useState<"blog" | "biblioteca">("blog");

  // Filtra de acordo com a aba selecionada
  const filteredPosts = blogPosts.filter((post) => {
    const isLibrary =
      post.type === "library" ||
      post.category?.toLowerCase() === "biblioteca" ||
      post.category?.toLowerCase() === "artigo acadêmico" ||
      !post.image;
    return activeTab === "biblioteca" ? isLibrary : !isLibrary;
  });

  // Se o filtro específico estiver vazio, usa os posts disponíveis
  const displayPosts = (
    filteredPosts.length > 0 ? filteredPosts : blogPosts
  ).slice(0, 3);

  return (
    <SectionShell
      id="blog"
      className="fv-bg fv-bg-articles bg-paper border-t border-border/60 py-16 md:py-20"
    >
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="fv-eyebrow mb-2">Reflexões & Saberes</span>
        <h2 className="heading-section text-primary mb-2">
          {activeTab === "blog" ? "Blog Figura Viva" : "Biblioteca Figura Viva"}
        </h2>
        <p className="text-sm md:text-base text-primary/70 font-light leading-relaxed">
          blog e biblioteca figura viva.
        </p>

        {/* Seletor centralizado */}
        <div className="inline-flex items-center gap-1.5 p-1 mt-6 rounded-full border border-border bg-areia/70">
          <button
            onClick={() => setActiveTab("blog")}
            className={`rounded-full px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === "blog"
                ? "bg-primary text-white shadow-xs"
                : "text-primary/70 hover:text-primary"
            }`}
          >
            Blog
          </button>
          <button
            onClick={() => setActiveTab("biblioteca")}
            className={`rounded-full px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === "biblioteca"
                ? "bg-primary text-white shadow-xs"
                : "text-primary/70 hover:text-primary"
            }`}
          >
            Biblioteca
          </button>
        </div>
      </div>

      {/* Grid de 1 linha de 3 cards compactos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[16/9] w-full rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          ))
        ) : displayPosts.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={activeTab === "blog" ? FileText : BookOpen}
              title={
                activeTab === "blog"
                  ? "Nenhum artigo encontrado"
                  : "Nenhum documento encontrado"
              }
              description="Nosso acervo está sendo atualizado. Volte em breve para novos conteúdos."
            />
          </div>
        ) : (
          displayPosts.map((post, index) => {
            const targetHref =
              activeTab === "biblioteca"
                ? `/public-library`
                : `/blog/${post.slug || post.id}`;

            return (
              <motion.div
                key={post.id || index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  href={targetHref}
                  className="group flex flex-col h-full rounded-lg border border-border bg-white p-3.5 transition-all hover:border-primary/40 hover:shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-md bg-areia mb-3">
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-areia to-paper text-primary/60">
                        <BookOpen
                          size={28}
                          className="mb-2 text-fv-terra-barro"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-center line-clamp-2">
                          {post.category || "Biblioteca"}
                        </span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 rounded-sm bg-paper/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary backdrop-blur-xs">
                      {post.category ||
                        (activeTab === "blog" ? "Blog" : "Biblioteca")}
                    </span>
                  </div>

                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-fv-terra-barro font-semibold mb-1.5">
                      <span>{post.date || "Atualizado"}</span>
                    </div>

                    <h3 className="font-serif text-base font-bold text-primary leading-snug group-hover:text-gold transition-colors line-clamp-2 mb-1.5">
                      {post.title}
                    </h3>

                    <p className="text-xs text-primary/70 leading-relaxed line-clamp-2 mb-3 font-light">
                      {post.excerpt ||
                        "Clique para acessar este conteúdo na íntegra."}
                    </p>

                    <div className="mt-auto pt-2 border-t border-border/50 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-primary group-hover:text-fv-verde-raiz transition-colors">
                      <span>
                        {activeTab === "blog" ? "Ler Artigo" : "Acessar Acervo"}
                      </span>
                      <ArrowRight
                        size={12}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Botão de destino completo */}
      <div className="mt-10 text-center">
        <Link
          href={activeTab === "blog" ? "/blog" : "/public-library"}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-fv-verde-raiz border-b border-fv-verde-raiz/30 pb-1 hover:text-gold hover:border-gold transition-colors"
        >
          {activeTab === "blog"
            ? "Ver Todas as Publicações do Blog"
            : "Explorar Todo o Acervo da Biblioteca"}{" "}
          →
        </Link>
      </div>
    </SectionShell>
  );
}
