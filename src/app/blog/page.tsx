import type { Metadata } from "next";
import PublicPageHero from "@/features/public-site/components/PublicPageHero";
import PublicSiteFrame from "@/features/public-site/components/PublicSiteFrame";
import { listPublishedContent } from "@/features/content/infrastructure/supabaseContentRepository";
import {
  orderDiaryBlocks,
  toDiaryBlock,
  type DiaryBlock,
} from "@/features/blog/diary-blocks";
import { getDiarySettings } from "@/features/blog/diary-settings.server";
import {
  DIARY_CATEGORIES as CATEGORIES,
  DiaryView,
  diaryCategoryOf as categoryOf,
} from "@/features/blog/DiaryView";

export const metadata: Metadata = {
  title: "Diário visual",
  description:
    "Reflexões em movimento: textos, frases, fotografias e vídeos do Instituto Figura Viva sobre Gestalt-terapia e a arte de viver.",
  alternates: {
    canonical: "/blog",
  },
};

// Revalidate every hour
export const revalidate = 3600;

// Reads Supabase's `posts` table, same source as /blog/[id] and the admin.
async function getBlocks(): Promise<DiaryBlock[]> {
  try {
    const posts = await listPublishedContent("posts");
    return posts
      .filter((post: any) => post.type !== "library")
      .map((post: any) => toDiaryBlock(post));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory =
    CATEGORIES.find((category) => category === params.categoria) || "Todos";

  const [blocks, settings] = await Promise.all([
    getBlocks(),
    getDiarySettings(),
  ]);
  const ordered = orderDiaryBlocks(blocks, settings.order);
  const visible =
    selectedCategory === "Todos"
      ? ordered
      : ordered.filter((block) => categoryOf(block) === selectedCategory);

  return (
    <PublicSiteFrame>
      <PublicPageHero
        eyebrow="Diário visual"
        title="Reflexões em movimento"
        description="Textos, frases soltas, fotografias e vídeos: um caderno aberto sobre a clínica, a formação e a vida."
        backgroundImage="/assets/fv/heroes/blog.webp"
      />
      <DiaryView
        visible={visible}
        settings={settings}
        selectedCategory={selectedCategory}
      />
    </PublicSiteFrame>
  );
}
