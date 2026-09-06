import type { Metadata } from "next";
import { Suspense } from "react";

import HomeClient from "@/components/HomeClient";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { deepSafeSerialize } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data } = await createSupabaseServiceClient()
      .from("public_pages")
      .select("content")
      .eq("key", "seo")
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

function toISO(value: any): string | null {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (value._seconds !== undefined) {
    return new Date(value._seconds * 1000).toISOString();
  }
  return null;
}

async function getHomeData() {
  try {
    const supabase = createSupabaseServiceClient();
    const [{ data: courseRows }, { data: postRows }, { data: instituteRow }] =
      await Promise.all([
        supabase
          .from("courses")
          .select("*")
          .eq("is_published", true)
          .eq("status", "open")
          .limit(3),
        supabase
          .from("posts")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("public_pages")
          .select("content")
          .eq("key", "institute")
          .maybeSingle(),
      ]);

    const courses = (courseRows ?? []).map((data: any) => {
      return deepSafeSerialize({
        id: data.id,
        title: data.title || "",
        subtitle: data.subtitle || "",
        description: data.description || "",
        image: data.image || null,
        coverImage: data.coverImage || "",
      });
    });

    const posts = (postRows ?? []).map((data: any) => {
      return deepSafeSerialize({
        id: data.id,
        title: data.title || "",
        excerpt: data.excerpt || "",
        image: data.image || null,
        created_at: toISO(data.created_at || data.createdAt),
      });
    });

    return {
      courses,
      posts,
      gallery: [],
      institute: instituteRow?.content
        ? deepSafeSerialize(instituteRow.content)
        : undefined,
    };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return { courses: [], posts: [], gallery: [], institute: undefined };
  }
}

export default async function Home() {
  const data = await getHomeData();

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
      <HomeClient initialData={data} />
    </Suspense>
  );
}
