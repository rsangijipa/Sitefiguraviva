"use server";

import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

interface CreatePostData {
  title: string;
  content: string;
  channel: string;
}

export async function createPost(data: CreatePostData) {
  const session = await verifySession();
  if (!session) return { error: "Unauthorized" };

  try {
    const uid = session.uid;
    const supabase = createSupabaseServiceClient();

    // Fetch user profile for author info display
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, photo_url, role")
      .eq("id", uid)
      .maybeSingle();

    const id = randomUUID();
    const now = new Date().toISOString();

    const { error: insertError } = await supabase
      .from("community_threads")
      .insert({
        id,
        course_id: data.channel || "global",
        author_id: uid,
        title: data.title,
        content: data.content,
        author_name: profile?.display_name || session.email || "Aluno",
        author_avatar_url: profile?.photo_url || null,
        reply_count: 0,
        like_count: 0,
        view_count: 0,
        is_pinned: false,
        is_locked: false,
        is_deleted: false,
        last_reply_at: now,
        created_at: now,
        updated_at: now,
        legacy_author_firebase_uid: null,
      });

    if (insertError) {
      console.error("Supabase insert community thread error:", insertError);
      return { error: "Failed to create post" };
    }

    revalidatePath("/portal/community");
    return { success: true, id };
  } catch (error) {
    console.error("Create Post Error:", error);
    return { error: "Failed to create post" };
  }
}
