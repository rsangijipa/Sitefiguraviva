"use client";
import { createSupabaseBrowserClient } from "./client";
export async function uploadPrivateCourseMaterial(
  file: File,
  courseId: string,
): Promise<{
  url: string;
  path: string;
  bucket: string;
  name: string;
  size: string;
}> {
  const { data, error } = await createSupabaseBrowserClient().auth.getSession();
  if (error || !data.session) throw new Error("Faça login novamente.");
  const form = new FormData();
  form.set("courseId", courseId);
  form.set("file", file);
  const response = await fetch("/api/admin/materials/upload", {
    method: "POST",
    body: form,
    headers: { Authorization: `Bearer ${data.session.access_token}` },
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Não foi possível enviar o material.");
  return result;
}
