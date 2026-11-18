import Link from "next/link";
import { Card } from "@/components/ui/Card";
import {
  Calendar,
  Clock,
  ArrowRight,
  Quote,
  Video,
  Image as ImageIcon,
  BookOpen,
  Sparkles,
  Palette,
} from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";
import PublicPageHero from "@/features/public-site/components/PublicPageHero";
import PublicSiteFrame from "@/features/public-site/components/PublicSiteFrame";
import { listPublishedContent } from "@/features/content/infrastructure/supabaseContentRepository";
import { getBlogThemeAction } from "@/app/actions/blog";
import { getYouTubeVideoId } from "@/lib/course-content/media";

export const metadata: Metadata = {
  title: "Diário Visual | Reflexões em Movimento",
  description:
    "Espaço pessoal de partilha, pensamentos, poesias, vídeos e artigos sobre Gestalt-terapia e a arte de viver.",
  alternates: {
    canonical: "/blog",
  },
};

export const revalidate = 3600;

const CATEGORIES = [
  "Todos",
  "Clínica",
  "Gestalt",
  "Formação",
  "Arte",
  "Território",
  "Memória",
] as const;

function formatDate(value: unknown): string | null {
  if (!value || typeof value !== "string") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function readingTime(post: any): string {
  const words = String(post.content || post.excerpt || "")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min de leitura`;
}

function categoryOf(post: any): string {
  const haystack =
    `${post.type ?? ""} ${(post.tags || []).join(" ")} ${post.title ?? ""}`.toLowerCase();
  const match = CATEGORIES.slice(1).find((cat) =>
    haystack.includes(cat.toLowerCase()),
  );
  return match || "Reflexão";
}

async function getPosts(): Promise<any[]> {
  try {
    const posts = await listPublishedContent("posts");
    return posts
      .filter((post: any) => post.type !== "library")
      .map((post: any) => ({
        ...post,
        image: post.image ?? post.imageUrl,
        created_at: formatDate(post.created_at),
        youtube_url: post.youtube_url || post.legacy_payload?.youtube_url || post.externalUrl || null,
        post_format: post.post_format || post.legacy_payload?.post_format || "article",
        quote_author: post.quote_author || post.legacy_payload?.quote_author || post.author || null,
        card_size: post.card_size || post.legacy_payload?.card_size || "normal",
        bg_style: post.bg_style || post.legacy_payload?.bg_style || "default",
      }));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

// Background theme styling classes and inline styles
const THEME_STYLES: Record<
  string,
  {
    containerClass: string;
    style: React.CSSProperties;
    cardDefault: string;
    textDefault: string;
    quoteBg: string;
  }
> = {
  paper: {
    containerClass: "bg-[#fbf7ee] text-stone-900",
    style: {
      backgroundImage:
        "radial-gradient(rgba(180, 165, 140, 0.25) 1px, transparent 1px)",
      backgroundSize: "16px 16px",
    },
    cardDefault: "bg-white/95 border-stone-200/90 text-stone-900",
    textDefault: "text-stone-800",
    quoteBg: "bg-[#fdfaf3] border-[#ecdcc7]",
  },
  watercolor: {
    containerClass: "bg-[#faf5ee] text-stone-900",
    style: {
      backgroundImage: "url('/assets/fv/art/aquarela-suave-estante.svg')",
      backgroundSize: "cover",
      backgroundAttachment: "fixed",
    },
    cardDefault: "bg-white/90 backdrop-blur-md border-stone-200/80 text-stone-900 shadow-md",
    textDefault: "text-stone-800",
    quoteBg: "bg-white/95 border-amber-200 shadow-sm",
  },
  linen: {
    containerClass: "bg-[#f5f1e8] text-stone-900",
    style: {
      backgroundImage:
        "repeating-linear-gradient(45deg, rgba(216, 207, 190, 0.15), rgba(216, 207, 190, 0.15) 1px, transparent 0, transparent 8px)",
    },
    cardDefault: "bg-white/95 border-stone-200 text-stone-900",
    textDefault: "text-stone-800",
    quoteBg: "bg-[#fbf8f0] border-amber-200",
  },
  sage: {
    containerClass: "bg-[#eef4f0] text-stone-900",
    style: {
      backgroundImage:
        "radial-gradient(rgba(0, 90, 31, 0.08) 1.5px, transparent 1.5px)",
      backgroundSize: "20px 20px",
    },
    cardDefault: "bg-white/95 border-emerald-100 text-stone-900 shadow-sm",
    textDefault: "text-stone-800",
    quoteBg: "bg-emerald-50/70 border-emerald-200",
  },
  dark: {
    containerClass: "bg-[#141a15] text-[#e8eee6]",
    style: {
      backgroundImage:
        "radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
    },
    cardDefault: "bg-[#1d251f] border-stone-800 text-[#e8eee6] shadow-xl",
    textDefault: "text-[#e8eee6]",
    quoteBg: "bg-[#222c24] border-stone-700 text-[#f5fbf3]",
  },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; tema?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory =
    CATEGORIES.find((cat) => cat === params.categoria) || "Todos";
  const storedTheme = await getBlogThemeAction();
  const activeTheme = params.tema || storedTheme || "paper";
  const themeConfig = THEME_STYLES[activeTheme] || THEME_STYLES.paper;

  const allPosts = await getPosts();
  const posts =
    selectedCategory === "Todos"
      ? allPosts
      : allPosts.filter((post) => categoryOf(post) === selectedCategory);

  return (
    <PublicSiteFrame>
      <PublicPageHero
        eyebrow="Diário visual"
        title="Reflexões em movimento"
        description="Artigos, pensamentos soltos, momentos fotográficos e registros em vídeo compartilhados com liberdade poética e clínica."
        backgroundImage="/assets/fv/heroes/blog.webp"
      />

      {/* ÁREA DO BLOG COM FUNDO PERSONALIZADO */}
      <div
        className={`min-h-screen pb-20 pt-10 transition-colors duration-500 ${themeConfig.containerClass}`}
        style={themeConfig.style}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* BARRA SUPERIOR: CATEGORIAS & SELETOR DE FUNDO DO BLOG */}
          <div className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-stone-200/60">
            {/* Categorias */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  href={
                    cat === "Todos"
                      ? `/blog${params.tema ? `?tema=${params.tema}` : ""}`
                      : `/blog?categoria=${encodeURIComponent(cat)}${params.tema ? `&tema=${params.tema}` : ""}`
                  }
                  aria-current={selectedCategory === cat ? "page" : undefined}
                  key={cat}
                  className={`inline-flex min-h-[42px] items-center rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    selectedCategory === cat
                      ? "bg-primary text-white border-primary shadow-md scale-105"
                      : "border-stone-300/80 bg-white/70 text-stone-700 hover:border-primary hover:text-primary backdrop-blur-sm"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>

            {/* Alternador sutil de fundo para os leitores */}
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200/80 text-xs font-bold text-stone-600 shadow-2xs">
              <Palette size={13} className="text-primary" />
              <span className="text-[10px] uppercase tracking-wider text-stone-400">
                Fundo:
              </span>
              {[
                { id: "paper", label: "Papel", color: "#f8f4eb" },
                { id: "watercolor", label: "Aquarela", color: "#e8cfb5" },
                { id: "sage", label: "Verde", color: "#cde3d4" },
                { id: "dark", label: "Noturno", color: "#1a221c" },
              ].map((t) => (
                <Link
                  key={t.id}
                  href={`/blog?${selectedCategory !== "Todos" ? `categoria=${encodeURIComponent(selectedCategory)}&` : ""}tema=${t.id}`}
                  title={`Trocar fundo para ${t.label}`}
                  className={`h-5 w-5 rounded-full border transition-all ${
                    activeTheme === t.id
                      ? "scale-125 ring-2 ring-primary ring-offset-1 border-white"
                      : "border-stone-300 hover:scale-110 opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: t.color }}
                />
              ))}
            </div>
          </div>

          {/* GRID ORGÂNICO E VARIADO (BENTO / SCRAPBOOK PESSOAL) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {posts.map((post) => {
              const format = post.post_format || "article";
              const cardBackground: Record<string, string> = {watercolor:"linear-gradient(135deg, #fdfaf4, #f5dfd6)", forest:"linear-gradient(135deg, #fdfaf4, #dcece0)", terracotta:"linear-gradient(135deg, #fdfaf4, #f3ded0)"};
              const cardStyle = cardBackground[post.bg_style] ? { background: cardBackground[post.bg_style] } : undefined;
              const isLarge = post.card_size === "large";
              const isTall = post.card_size === "tall";
              const youtubeId = post.youtube_url ? getYouTubeVideoId(post.youtube_url) : null;

              // 1. FORMATO: FRASE SOLTA / PENSAMENTO
              if (format === "quote") {
                return (
                  <div
                    key={post.id}
                    style={cardStyle}
                    className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl border ${themeConfig.quoteBg} ${
                      isLarge ? "md:col-span-2" : "col-span-1"
                    }`}
                  >
                    <span className="text-gold opacity-80 block mb-3">
                      <Quote size={36} className="rotate-180" />
                    </span>

                    <blockquote className={`font-serif text-xl sm:text-2xl italic leading-relaxed ${themeConfig.textDefault} mb-6`}>
                      “{post.content || post.excerpt || post.title}”
                    </blockquote>

                    <div className="pt-4 border-t border-stone-200/60 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-primary/70">
                      <span>{post.quote_author || post.author || "Lilian Vanessa Nicacio"}</span>
                      {post.created_at && (
                        <span className="flex items-center gap-1 text-[11px] font-normal text-stone-400">
                          <Calendar size={12} /> {post.created_at}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              // 2. FORMATO: VÍDEO DO YOUTUBE
              if (format === "video" && youtubeId) {
                return (
                  <div
                    key={post.id}
                    style={cardStyle}
                    className={`group overflow-hidden rounded-3xl border border-stone-200/90 bg-white/95 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                      isLarge ? "md:col-span-2" : "col-span-1"
                    }`}
                  >
                    {/* Player do YouTube Embutido */}
                    <div className="relative aspect-video w-full bg-stone-900 overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title={post.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    <div className="p-6 sm:p-8">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-full bg-red-100 text-red-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Video size={11} /> Vídeo
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gold">
                          {categoryOf(post)}
                        </span>
                      </div>

                      <h3 className="font-serif text-xl sm:text-2xl font-medium text-stone-900 mb-3 leading-tight">
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="text-sm font-light text-stone-600 leading-relaxed mb-4">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                        <span className="font-bold text-stone-600">
                          {post.author || "Lilian Vanessa Nicacio"}
                        </span>
                        {post.created_at && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {post.created_at}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // 3. FORMATO: MOMENTO VISUAL / FOTOGRAFIA
              if (format === "photo") {
                return (
                  <div
                    key={post.id}
                    style={cardStyle}
                    className={`group overflow-hidden rounded-3xl border border-stone-200/90 bg-white/95 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col ${
                      isLarge ? "md:col-span-2" : "col-span-1"
                    } ${isTall ? "row-span-2" : ""}`}
                  >
                    <div className={`relative w-full overflow-hidden bg-stone-100 ${isTall ? "h-96 sm:h-[460px]" : "h-72 sm:h-80"}`}>
                      {post.image ? (
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-stone-200 font-serif text-4xl text-stone-400">
                          FV
                        </div>
                      )}
                      <div className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md flex items-center gap-1">
                        <ImageIcon size={11} /> Fotografia
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1 block">
                          {categoryOf(post)}
                        </span>
                        <h3 className="font-serif text-xl sm:text-2xl font-medium text-stone-900 mb-2 leading-tight">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm font-light text-stone-600 leading-relaxed italic">
                            “{post.excerpt}”
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                        <span>{post.author || "Lilian Vanessa Nicacio"}</span>
                        {post.created_at && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {post.created_at}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // 4. FORMATO: ARTIGO COMPLETO CLÁSSICO
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className={`group block h-full ${
                    isLarge ? "md:col-span-2" : "col-span-1"
                  }`}
                >
                  <Card
                    style={cardStyle}
                    className={`h-full overflow-hidden flex flex-col rounded-3xl border border-stone-200/90 bg-white/95 shadow-md transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl`}
                  >
                    <div className="h-64 overflow-hidden relative bg-stone-100">
                      {post.image ? (
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-300 font-serif text-4xl opacity-30">
                          FV
                        </div>
                      )}
                      <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-sm">
                        {categoryOf(post)}
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between">
                      <div>
                        <h2 className="font-serif text-2xl text-stone-900 mb-3 group-hover:text-primary transition-colors leading-tight">
                          {post.title}
                        </h2>
                        <p className="text-stone-600 font-light text-sm line-clamp-3 mb-4 leading-relaxed">
                          {post.excerpt || post.content?.substring(0, 160) + "..."}
                        </p>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">
                          <span>{post.author || "Lilian Vanessa Nicacio"}</span>
                          {post.created_at && (
                            <span className="flex items-center gap-1">
                              <Calendar size={11} /> {post.created_at}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {readingTime(post)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:translate-x-1 transition-transform">
                          Ler reflexão completa <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-24 rounded-3xl border border-dashed border-stone-300 bg-white/50 my-12">
              <p className="text-stone-500 font-light text-base">
                Nenhuma publicação encontrada nesta categoria. Acesse a aba &ldquo;Todos&rdquo; para ver as reflexões e registros do Diário Visual.
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicSiteFrame>
  );
}
