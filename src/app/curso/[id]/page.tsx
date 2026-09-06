import { Suspense } from "react";
import { notFound } from "next/navigation";
import CourseDetailClient from "./CourseDetailClient";

import { getCourseById } from "@/data/courses";
import { deepSafeSerialize } from "@/lib/utils";

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
