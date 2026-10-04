import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { SavedThoughtRecord } from "./types";

const RESOURCE_SLUG = "garden-thoughts";

export async function saveGardenThought(
  thoughtText: string,
  clientRequestId?: string,
  optionalTitle?: string,
): Promise<SavedThoughtRecord> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("garden_thoughts" as never)
    .insert({
      user_id: user.id,
      client_request_id: clientRequestId || undefined,
      thought_text: thoughtText,
      optional_title: optionalTitle || null,
      status: "saved",
      is_private: true,
    } as never)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Falha ao salvar pensamento.");
  }

  return data as unknown as SavedThoughtRecord;
}

export async function listSavedThoughts(): Promise<SavedThoughtRecord[]> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("garden_thoughts" as never)
    .select("*")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message || "Falha ao carregar histórico.");
  }

  return (data || []) as unknown as SavedThoughtRecord[];
}

export async function getThoughtById(
  id: string,
): Promise<SavedThoughtRecord | null> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("garden_thoughts" as never)
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Falha ao buscar pensamento.");
  }

  return data as unknown as SavedThoughtRecord | null;
}

export async function updateGardenThought(
  id: string,
  thoughtText: string,
  optionalTitle?: string,
): Promise<SavedThoughtRecord> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("garden_thoughts" as never)
    .update({
      thought_text: thoughtText,
      optional_title: optionalTitle || null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .eq("user_id", user.id)
    .is("archived_at", null)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Falha ao atualizar pensamento.");
  }

  return data as unknown as SavedThoughtRecord;
}

export async function deleteGardenThought(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("garden_thoughts" as never)
    .update({ archived_at: new Date().toISOString() } as never)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message || "Falha ao excluir pensamento.");
  }
}
