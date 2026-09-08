import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Calendar, ArrowRight } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";
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

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <PublicSiteFrame>
      <div className="min-h-screen bg-[#FDFCF9] pb-20 pt-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <header className="mb-16 text-center">
            <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4">
              Diário Visual
            </h1>
            <p className="text-stone-500 font-light max-w-2xl mx-auto text-lg">
              Reflexões, artigos e poesias sobre a Gestalt-Terapia e o viver
              humano.
            </p>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="group block h-full"
              >
                <Card className="h-full border border-stone-100 hover:border-gold/50 transition-all duration-300 overflow-hidden flex flex-col">
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
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold mb-3">
                      <Calendar size={12} />
                      <span>{post.created_at}</span>
                    </div>
                    <h2 className="font-serif text-2xl text-primary mb-3 group-hover:text-gold transition-colors leading-tight">
                      {post.title}
                    </h2>
                    <p className="text-stone-500 font-light text-sm line-clamp-3 mb-6 flex-1">
                      {post.excerpt || post.content?.substring(0, 150) + "..."}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:translate-x-2 transition-transform mt-auto">
                      Ler Completo <ArrowRight size={14} />
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
