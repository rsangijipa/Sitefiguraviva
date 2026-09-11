"use server";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { deleteStorageObject } from "@/infrastructure/supabase/storage.server";
import { requireStaff } from "@/lib/auth/server";
import { logAudit } from "@/lib/audit";

export async function listAdminPublicDocuments() {
  await requireStaff();
  const { data, error } = await createSupabaseServiceClient()
    .from("public_documents")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createPublicDocument(data: {
  title: string;
  category: string;
  file_url: string;
  file_path?: string;
  file_size?: string;
  file_type?: string;
  isPublished?: boolean;
}) {
  try {
    const staff = await requireStaff();
    const title = data.title.trim();
    if (!title || title.length > 180 || !data.file_url.startsWith("http")) {
      return { error: "Dados do documento inválidos." };
    }
    const { data: row, error } = await createSupabaseServiceClient()
      .from("public_documents")
      .insert({
        title,
        category: data.category.trim().slice(0, 60) || "public",
        file_url: data.file_url,
        file_path: data.file_path || null,
        file_size: data.file_size || null,
        file_type: data.file_type || "pdf",
        is_published: data.isPublished ?? true,
        created_by: staff.uid,
      })
      .select("id")
      .single();
    if (error) throw error;
    await logAudit({
      action: "PUBLIC_DOCUMENT_CREATED",
      actor: { uid: staff.uid, email: staff.email, role: staff.role },
      target: { collection: "public_documents", id: row.id, summary: title },
    });
    return { success: true, id: row.id };
  } catch (error) {
    console.error("Create public document failed", error);
    return { error: "Não foi possível salvar o documento." };
  }
}

export async function deletePublicDocument(id: string) {
  try {
    const staff = await requireStaff();
    const supabase = createSupabaseServiceClient();
    const { data: current, error: currentError } = await supabase
      .from("public_documents")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (currentError) throw currentError;
    if (!current) return { error: "Documento não encontrado." };
    const { error } = await supabase
      .from("public_documents")
      .delete()
      .eq("id", id);
    if (error) throw error;
    if (current.file_path) {
      await deleteStorageObject({
        bucket: "course-assets",
        path: current.file_path,
      });
    }
    await logAudit({
      action: "PUBLIC_DOCUMENT_DELETED",
      actor: { uid: staff.uid, email: staff.email, role: staff.role },
      target: { collection: "public_documents", id, summary: current.title },
    });
    return { success: true };
  } catch (error) {
    console.error("Delete public document failed", error);
    return { error: "Não foi possível excluir o documento." };
  }
}
