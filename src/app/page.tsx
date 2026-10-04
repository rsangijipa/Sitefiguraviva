import { getPublicPage } from "@/features/public-site/infrastructure/supabasePublicPagesRepository.server";
import { DEFAULT_HOME, DEFAULT_CONFIG } from "@/lib/siteSettings";
import type { Metadata } from "next";
import { Suspense } from "react";

import {
  mapPublicCourse,
  mapPublicPost,
} from "@/features/content/infrastructure/supabaseContentRepository";
import HomeClient from "@/components/HomeClient";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data } = await createSupabaseServiceClient()
      .from("public_pages")
      .select("content")
      .eq("key", "seo")
      .eq("is_published", true)
      .maybeSingle();
    const seo = data?.content as any;

    return {
      title: seo?.defaultTitle || "Instituto Figura Viva | Gestalt-Terapia",
      description:
        seo?.defaultDescription ||
        "Um espaço vivo de acolhimento clínico e formação profissional.",
      keywords: seo?.keywords || [],
      alternates: { canonical: "/" },
      ...(seo?.ogImage
        ? { openGraph: { images: [{ url: seo.ogImage }] } }
        : {}),
    };
  } catch {
    return { alternates: { canonical: "/" } };
  }
}

export const revalidate = 3600;

async function getHomeData() {
  try {
    const supabase = createSupabaseServiceClient();
    const [{ data: courseRows }, { data: postRows }] = await Promise.all([
      supabase
        .from("courses")
        .select(
          "*, course_mediators(mediator:mediators(id,name,role,image,bio))",
        )
        .eq("is_published", true)
        .in("status", ["open", "closed"])
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("posts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    const courses = (courseRows ?? []).map(mapPublicCourse);
    const posts = (postRows ?? []).map(mapPublicPost);

    return {
      courses,
      posts,
      gallery: [],
    };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return { courses: [], posts: [], gallery: [] };
  }
}

export default async function Home() {
  const [data, home, config] = await Promise.all([
    getHomeData(),
    getPublicPage("home", DEFAULT_HOME).catch(() => DEFAULT_HOME),
    getPublicPage("config", DEFAULT_CONFIG).catch(() => DEFAULT_CONFIG),
  ]);

  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center bg-paper text-primary"
          role="status"
        >
          Preparando o Instituto Figura Viva…
        </div>
      }
    >
      <HomeClient initialData={{ ...data, home, config }} />
    </Suspense>
  );
}
