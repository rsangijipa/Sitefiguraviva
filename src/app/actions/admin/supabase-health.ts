"use server";

import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

export type SyncHealthStatus = "healthy" | "pending" | "error";
export type SyncHealthItem = {
  key: string;
  label: string;
  status: SyncHealthStatus;
  detail: string;
};

/** A read-only operational summary. It exposes no credentials, row data, or raw database errors. */
export async function getSupabaseSyncHealthAction(): Promise<SyncHealthItem[]> {
  await requireAdmin();
  try {
    const supabase = createSupabaseServiceClient();
    const [courses, modules, lessons, gallery, pages, buckets] =
      await Promise.all([
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase
          .from("course_modules")
          .select("id", { count: "exact", head: true }),
        supabase.from("lessons").select("id", { count: "exact", head: true }),
        supabase
          .from("gallery_items")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("public_pages")
          .select("key", { count: "exact", head: true }),
        supabase.storage.listBuckets(),
      ]);
    const failed = [courses, modules, lessons, gallery, pages].some(
      (result) => result.error,
    );
    if (failed || buckets.error)
      throw new Error("Supabase health query failed");
    const bucketById = new Map(
      (buckets.data ?? []).map((bucket) => [bucket.id, bucket]),
    );
    const storageStatus = (
      id: string,
      expectedPublic: boolean,
    ): SyncHealthItem => {
      const bucket = bucketById.get(id);
      if (!bucket)
        return {
          key: id,
          label: id,
          status: "pending",
          detail: "Bucket ainda não encontrado.",
        };
      if (bucket.public !== expectedPublic)
        return {
          key: id,
          label: id,
          status: "error",
          detail: expectedPublic ? "Deve ser público." : "Deve ser privado.",
        };
      return {
        key: id,
        label: id,
        status: "healthy",
        detail: expectedPublic
          ? "Bucket público configurado."
          : "Bucket privado configurado.",
      };
    };
    return [
      {
        key: "supabase",
        label: "Supabase",
        status: "healthy",
        detail: "Consulta administrativa respondendo.",
      },
      {
        key: "gallery",
        label: "Galeria",
        status: "healthy",
        detail: `${gallery.count ?? 0} itens canônicos.`,
      },
      {
        key: "settings",
        label: "Settings",
        status: (pages.count ?? 0) > 0 ? "healthy" : "pending",
        detail: `${pages.count ?? 0} páginas públicas.`,
      },
      {
        key: "courses",
        label: "Cursos",
        status: "healthy",
        detail: `${courses.count ?? 0} cursos canônicos.`,
      },
      {
        key: "modules",
        label: "Módulos",
        status: "healthy",
        detail: `${modules.count ?? 0} módulos canônicos.`,
      },
      {
        key: "lessons",
        label: "Aulas",
        status: "healthy",
        detail: `${lessons.count ?? 0} aulas canônicas.`,
      },
      storageStatus("course-assets", true),
      storageStatus("assessment-submissions", false),
    ];
  } catch {
    return [
      {
        key: "supabase",
        label: "Supabase",
        status: "error",
        detail: "Não foi possível consultar a saúde agora.",
      },
    ];
  }
}
