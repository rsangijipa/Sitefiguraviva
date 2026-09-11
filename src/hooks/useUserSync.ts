"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";

export function useUserSync() {
  const { user } = useAuth();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (user) {
      const sync = async () => {
        try {
          const { error } = await supabase.from("profiles").upsert({
            id: user.uid,
            email: user.email || "",
            display_name: user.displayName || "",
            photo_url: user.photoURL || null,
            updated_at: new Date().toISOString(),
          });
          if (error) throw error;
        } catch (error) {
          console.error("Error syncing user:", error);
        }
      };
      sync();
    }
  }, [user]);
}
