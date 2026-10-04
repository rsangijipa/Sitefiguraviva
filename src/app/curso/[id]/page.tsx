import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CourseDetailClient from "./CourseDetailClient";

import { getCourseById } from "@/data/courses";
import { deepSafeSerialize } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    return { title: "Curso não encontrado" };
  }

  const title = course.title;
  const subtitle = course.subtitle as string | null | undefined;
  const description =
    subtitle || (course.description as string | null | undefined) || undefined;
  const coverImage = course.coverImage as string | null | undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: coverImage ? [coverImage] : undefined,
    },
  };
}

async function CourseContent({ id }: { id: string }) {
  try {
    const course = await getCourseById(id);

    if (!course) {
      notFound();
    }

    return <CourseDetailClient course={deepSafeSerialize(course)} />;
  } catch (error) {
    console.error("❌ Course Fetch Error:", error);
    notFound();
  }
}

export default async function CourseDetail({
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
              Tecendo o Encontro...
            </p>
          </div>
        </div>
      }
    >
      <CourseContent id={id} />
    </Suspense>
  );
}
