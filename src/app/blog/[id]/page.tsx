import { Suspense } from "react";
import { notFound } from "next/navigation";
import BlogDetailClient from "./BlogDetailClient";
import type { Metadata } from "next";
import { listPublishedContent } from "@/features/content/infrastructure/supabaseContentRepository";

async function getPostDoc(id: string) {
  const posts = await listPublishedContent("posts");
  const post = posts.find((item) => item.id === id || item.slug === id);
  return post ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const docSnap = await getPostDoc(id);
    if (!docSnap) {
      return {
        title: "Artigo não encontrado",
        robots: { index: false, follow: false },
      };
    }

    const data: any = docSnap;
    const title = data?.title || "Blog";
    const description =
      data?.excerpt || data?.subtitle || "Conteudo do Instituto Figura Viva";
    const image = data?.image || "/og-default.jpg";

    return {
      title,
      description,
      alternates: {
        canonical: `/blog/${data?.slug || id}`,
      },
      openGraph: {
        title,
        description,
        type: "article",
        images: [image],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return {
      title: "Blog",
    };
  }
}

async function BlogContent({ id }: { id: string }) {
  try {
    const docSnap = await getPostDoc(id);

    if (!docSnap) {
      notFound();
    }

    const data = docSnap;

    const post: any = {
      id: docSnap.id,
      title: data?.title || "",
      content: data?.content || "",
      image: data?.image || "",
      author: data?.author || "",
      created_at: data?.created_at ?? null,
      updated_at: data?.updated_at ?? null,
    };

    return <BlogDetailClient post={post} />;
  } catch (error) {
    console.error("❌ Blog Fetch Error:", error);
    notFound();
  }
}

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-paper">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
            <p className="text-primary/60 font-serif animate-pulse text-xs tracking-widest uppercase">
              Lendo o Diário...
            </p>
          </div>
        </div>
      }
    >
      <BlogContent id={id} />
    </Suspense>
  );
}
