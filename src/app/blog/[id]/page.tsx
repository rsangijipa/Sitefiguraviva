import { Suspense } from "react";
import { db } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import BlogDetailClient from "./BlogDetailClient";
import type { Metadata } from "next";

async function getPostDoc(id: string) {
  return db.collection("posts").doc(id).get();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const docSnap = await getPostDoc(id);
    if (!docSnap.exists) {
      return {
        title: "Artigo nao encontrado | Instituto Figura Viva",
        robots: { index: false, follow: false },
      };
    }

    const data: any = docSnap.data();
    const title = data?.title || "Blog | Instituto Figura Viva";
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
      title: "Blog | Instituto Figura Viva",
    };
  }
}

async function BlogContent({ id }: { id: string }) {
  try {
    const docSnap = await getPostDoc(id);

    if (!docSnap.exists) {
      notFound();
    }

    const data = docSnap.data();
    const toISO = (val: any) => {
      if (!val) return null;
      if (typeof val.toDate === "function") return val.toDate().toISOString();
      if (val instanceof Date) return val.toISOString();
      if (typeof val === "string") return new Date(val).toISOString();
      return null;
    };

    const post: any = {
      id: docSnap.id,
      title: data?.title || "",
      content: data?.content || "",
      image: data?.image || "",
      author: data?.author || "",
      created_at: toISO(data?.created_at),
      updated_at: toISO(data?.updated_at),
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
