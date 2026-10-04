"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type { Mediator } from "@/utils/mediators";

const schema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Informe o nome.").max(200),
  role: z.string().trim().max(300),
  image: z
    .string()
    .max(2000)
    .refine(
      (value) =>
        !value || /^\/(?!\/)/.test(value) || /^https:\/\//i.test(value),
      "Foto inválida.",
    ),
  bio: z.string().trim().max(20000),
});

export async function listMediatorsAction(): Promise<Mediator[]> {
  await requireAdmin();
  const { data, error } = await createSupabaseServiceClient()
    .from("mediators")
    .select("id,name,role,image,bio")
    .order("name");
  if (error) throw new Error("Não foi possível carregar os mediadores.");
  return (data ?? []).sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
  );
}

export async function saveMediatorAction(input: Mediator): Promise<void> {
  await requireAdmin();
  const { id, ...profile } = schema.parse(input);
  const db = createSupabaseServiceClient();
  const result = id
    ? await db
        .from("mediators")
        .update(profile)
        .eq("id", id)
        .select("id")
        .maybeSingle()
    : await db.from("mediators").insert(profile).select("id").single();
  if (result.error?.code === "23505")
    throw new Error("Este nome já está cadastrado. Edite o perfil existente.");
  if (result.error || !result.data)
    throw new Error("Não foi possível salvar o mediador.");
  revalidatePath("/admin/courses");
  revalidatePath("/");
  revalidatePath("/curso", "layout");
}

export async function deleteMediatorAction(id: string): Promise<void> {
  await requireAdmin();
  z.string().uuid().parse(id);
  const { error, data } = await createSupabaseServiceClient()
    .from("mediators")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error?.code === "23503")
    throw new Error("Desvincule este mediador dos cursos antes de excluí-lo.");
  if (error || !data) throw new Error("Não foi possível excluir o mediador.");
  revalidatePath("/admin/courses");
}
