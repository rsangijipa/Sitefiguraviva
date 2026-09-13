import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";
import PublicPageHero from "@/features/public-site/components/PublicPageHero";
import PublicSiteFrame from "@/features/public-site/components/PublicSiteFrame";
import { listPublishedContent } from "@/features/content/infrastructure/supabaseContentRepository";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artigos e reflexoes do Instituto Figura Viva sobre Gestalt-Terapia e formacao clinica.",
  alternates: {
    canonical: "/blog",
  },
};

// Revalidate every hour
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

// Reads Supabase's `posts` table, same source as /blog/[id] (detail page)
// and the admin blog manager. This page used to read Firestore's `posts`
// collection instead, so a post created/edited in the admin (which writes
// Supabase) could appear here but 404 on click, or not appear at all.
async function getPosts(): Promise<any[]> {
  try {
    const posts = await listPublishedContent("posts");
    return posts
      .filter((post: any) => post.type !== "library")
      .map((post: any) => ({
        ...post,
        image: post.image ?? post.imageUrl,
        created_at: formatDate(post.created_at),
      }));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

function PostMeta({ post }: { post: any }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-primary/40">
      <span>{post.author || "Instituto Figura Viva"}</span>
      {post.created_at && (
        <span className="flex items-center gap-1.5">
          <Calendar size={12} /> {post.created_at}
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <Clock size={12} /> {readingTime(post)}
      </span>
    </div>
  );
}

export default async function BlogPage() {
  const posts = await getPosts();
  const [first, second, third, ...rest] = posts;
  const highlighted = [second, third].filter(Boolean);

  return (
    <PublicSiteFrame>
      <PublicPageHero
        eyebrow="Diário visual"
        title="Reflexões em movimento"
        description="Artigos, poesias e reflexões sobre a Gestalt-terapia e o viver humano."
        backgroundImage="/assets/fv/heroes/blog.png"
      />
      <div className="min-h-screen bg-paper pb-20 pt-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* DESTAQUE */}
          {first && (
            <section className="mb-16 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <Link href={`/blog/${first.id}`} className="group block h-full">
                <Card className="flex h-full flex-col overflow-hidden">
                  <div className="relative h-80 overflow-hidden bg-stone-100 lg:h-full lg:min-h-[420px]">
                    {first.image ? (
                      <Image
                        src={first.image}
                        alt={first.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 60vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-stone-200 font-serif text-4xl text-stone-300 opacity-30">
                        FV
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/10 to-transparent p-8 flex flex-col justify-end">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
                        {categoryOf(first)}
                      </p>
                      <h2 className="mt-2 font-serif text-3xl leading-tight text-white md:text-4xl">
                        {first.title}
                      </h2>
                    </div>
                  </div>
                </Card>
              </Link>

              <div className="flex flex-col gap-6">
                {highlighted.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.id}`}
                    className="group block flex-1"
                  >
                    <Card className="flex h-full flex-col overflow-hidden p-6">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
                        {categoryOf(post)}
                      </p>
                      <h3 className="mt-2 font-serif text-xl leading-tight text-primary group-hover:text-gold transition-colors">
                        {post.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 flex-1 text-sm font-light text-stone-500">
                        {post.excerpt}
                      </p>
                      <PostMeta post={post} />
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CATEGORIAS */}
          <div className="mb-10 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-stone-200 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-primary/60"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* GRID */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="group block h-full"
              >
                <Card className="h-full border border-stone-100 overflow-hidden flex flex-col">
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
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
                      {categoryOf(post)}
                    </p>
                    <h2 className="mt-2 font-serif text-2xl text-primary mb-2 group-hover:text-gold transition-colors leading-tight">
                      {post.title}
                    </h2>
                    <p className="text-stone-500 font-light text-sm line-clamp-3 mb-4 flex-1">
                      {post.excerpt || post.content?.substring(0, 150) + "..."}
                    </p>
                    <PostMeta post={post} />
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:translate-x-1 transition-transform">
                      Ler completo <ArrowRight size={14} />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-stone-400 font-light">
                Nenhuma publicação encontrada.
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicSiteFrame>
  );
}
