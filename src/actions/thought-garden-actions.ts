"use server";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { verifySession } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const MAX_THOUGHT_LENGTH = 500;
const MIN_THOUGHT_LENGTH = 1;
const MAX_TITLE_LENGTH = 80;

const saveThoughtSchema = z.object({
  thoughtText: z
    .string()
    .trim()
    .min(MIN_THOUGHT_LENGTH, "Escreva pelo menos uma letra.")
    .max(
      MAX_THOUGHT_LENGTH,
      `M\u00e1ximo de ${MAX_THOUGHT_LENGTH} caracteres.`,
    ),
  optionalTitle: z
    .string()
    .trim()
    .max(MAX_TITLE_LENGTH, `M\u00e1ximo de ${MAX_TITLE_LENGTH} caracteres.`)
    .optional()
    .or(z.literal("")),
});

export async function saveGardenThoughtServer(
  thoughtText: string,
  clientRequestId?: string,
  optionalTitle?: string,
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const claims = await verifySession();
    if (!claims) return { success: false, error: "Unauthorized" };
    const uid = claims.uid;

    const parseResult = saveThoughtSchema.safeParse({
      thoughtText,
      optionalTitle,
    });
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || "Dados inv\u00e1lidos",
      };
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("garden_thoughts" as never)
      .insert({
        user_id: uid,
        client_request_id: clientRequestId || undefined,
        thought_text: parseResult.data.thoughtText,
        optional_title: parseResult.data.optionalTitle || null,
        status: "saved",
        is_private: true,
      } as never)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message || "Falha ao salvar pensamento.",
      };
    }

    revalidatePath("/portal/recursos/jardim-de-pensamentos");
    revalidatePath("/portal/recursos/jardim-de-pensamentos/historico");

    return { success: true, id: (data as any)?.id };
  } catch (error) {
    console.error("[saveGardenThought] Error:", error);
    return { success: false, error: "N\u00e3o foi poss\u00edvel salvar." };
  }
}

export async function listGardenThoughts(
  limit: number = 50,
): Promise<{ thoughts: any[]; error?: string }> {
  try {
    const claims = await verifySession();
    if (!claims) return { thoughts: [], error: "Unauthorized" };
    const uid = claims.uid;

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("garden_thoughts" as never)
      .select("*")
      .eq("user_id", uid)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return {
        thoughts: [],
        error: error.message || "Falha ao carregar hist\u00f3rico.",
      };
    }

    return { thoughts: data || [] };
  } catch (error) {
    console.error("[listGardenThoughts] Error:", error);
    return { thoughts: [], error: "N\u00e3o foi poss\u00edvel carregar." };
  }
}

export async function deleteGardenThoughtServer(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const claims = await verifySession();
    if (!claims) return { success: false, error: "Unauthorized" };
    const uid = claims.uid;

    const supabase = createSupabaseServiceClient();
    const { error } = await supabase
      .from("garden_thoughts" as never)
      .update({ archived_at: new Date().toISOString() } as never)
      .eq("id", id)
      .eq("user_id", uid);

    if (error) {
      return {
        success: false,
        error: error.message || "Falha ao excluir pensamento.",
      };
    }

    revalidatePath("/portal/recursos/jardim-de-pensamentos");
    revalidatePath("/portal/recursos/jardim-de-pensamentos/historico");

    return { success: true };
  } catch (error) {
    console.error("[deleteGardenThought] Error:", error);
    return { success: false, error: "N\u00e3o foi poss\u00edvel excluir." };
  }
}
