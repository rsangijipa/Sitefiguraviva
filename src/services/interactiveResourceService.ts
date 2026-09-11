import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";

export async function saveInteractiveEntry(
  resourceSlug: string,
  payload: Record<string, unknown>,
  sessionId?: string,
) {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Faça login para guardar este registro.");
  const { data, error } = await supabase
    .from("interactive_resource_entries" as never)
    .insert({
      user_id: user.id,
      resource_slug: resourceSlug,
      session_id: sessionId,
      payload,
      is_private: true,
    } as never)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listInteractiveEntries(resourceSlug: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("interactive_resource_entries" as never)
    .select("*")
    .eq("resource_slug", resourceSlug)
    .is("archived_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
