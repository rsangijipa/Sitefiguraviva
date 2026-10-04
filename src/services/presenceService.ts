import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";

export const presenceService = {
  async updatePresence(
    userId: string,
    contextId: string,
    data: { name: string; avatar?: string; isTyping?: boolean },
  ) {
    const supabase: any = createSupabaseBrowserClient();
    const { error } = await supabase.from("presence").upsert(
      {
        id: `${userId}_${contextId}`,
        user_id: userId,
        context_id: contextId,
        name: data.name,
        avatar: data.avatar || null,
        is_typing: data.isTyping ?? false,
        last_seen: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) throw error;
  },

  subscribeToPresence(contextId: string, callback: (users: any[]) => void) {
    const supabase: any = createSupabaseBrowserClient();
    const load = async () => {
      const threshold = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("presence")
        .select("*")
        .eq("context_id", contextId)
        .gte("last_seen", threshold);
      callback(data ?? []);
    };
    void load();
    const channel = supabase
      .channel(`presence:${contextId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "presence",
          filter: `context_id=eq.${contextId}`,
        },
        load,
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  },

  async clearPresence(userId: string, contextId: string) {
    const { error } = await (createSupabaseBrowserClient() as any)
      .from("presence")
      .delete()
      .eq("id", `${userId}_${contextId}`);
    if (error) console.warn("Presence cleanup failed", error);
  },
};
