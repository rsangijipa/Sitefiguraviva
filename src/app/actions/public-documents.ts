"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

const documentSchema = z.object({
  title: z.string().trim().min(1).max(180),
  category: z.enum(["public", "institucional", "editais"]),
  file_url: z.string().url(),
  file_path: z.string().trim().min(1),
  file_size: z.string().trim().max(40).optional(),
  file_type: z.literal("pdf"),
});

export async function listPublicDocumentsAction() {
  await requireAdmin();
  const { data, error } = await createSupabaseServiceClient()
    .from("public_documents")
    .select(
      "id, title, category, file_url, file_path, file_size, file_type, is_published, created_at",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error("Não foi possível carregar documentos públicos.");
  return data;
}

export async function createPublicDocumentAction(input: unknown) {
  const actor = await requireAdmin();
  const document = documentSchema.parse(input);
  const { error } = await createSupabaseServiceClient()
    .from("public_documents")
    .insert({
      ...document,
      file_size: document.file_size || null,
      is_published: true,
      created_by: actor.uid,
    });
  if (error) throw new Error("Não foi possível salvar o documento público.");
  revalidatePath("/admin/public-docs");
  revalidatePath("/public-library");
  return { success: true };
}

export async function deletePublicDocumentAction(id: string) {
  await requireAdmin();
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("public_documents")
    .select("file_path")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) throw new Error("Documento não encontrado.");

  const { error: deleteError } = await supabase
    .from("public_documents")
    .delete()
    .eq("id", id);
  if (deleteError) throw new Error("Não foi possível excluir o documento.");
  if (data.file_path)
    await supabase.storage.from("course-assets").remove([data.file_path]);
  revalidatePath("/admin/public-docs");
  revalidatePath("/public-library");
  return { success: true };
}
