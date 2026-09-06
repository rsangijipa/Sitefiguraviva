import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";

export const interactionService = {
  async getTreeCount(): Promise<number> {
    try {
      const supabase: any = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("interaction_stats")
        .select("count")
        .eq("key", "tree")
        .maybeSingle();
      if (error) throw error;
      return Number(data?.count ?? 1243);
    } catch (error) {
      console.error("Error fetching tree count:", error);
      return 1243;
    }
  },

  async incrementTreeCount(): Promise<void> {
    try {
      const supabase: any = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("interaction_stats")
        .select("count")
        .eq("key", "tree")
        .maybeSingle();
      await supabase
        .from("interaction_stats")
        .upsert(
          { key: "tree", count: Number(data?.count ?? 0) + 1 },
          { onConflict: "key" },
        );
    } catch (error) {
      console.error("Error incrementing tree count:", error);
    }
  },
};
