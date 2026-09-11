"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { verifySession } from "@/lib/auth/server";
import { logAudit } from "@/lib/audit";

interface CreatePostData {
  title: string;
  content: string;
  channel: string;
}

const VALID_CHANNELS = new Set(["general", "questions", "projects", "random"]);

export async function createPost(data: CreatePostData) {
  const session = await verifySession();
  if (!session) return { error: "Faça login para publicar um tópico." };

  const title = data.title?.trim();
  const content = data.content?.trim();
  const channel = data.channel?.trim();
  if (!title || title.length > 160) {
    return { error: "O título deve ter entre 1 e 160 caracteres." };
  }
  if (!content || content.length > 10_000) {
    return { error: "O conteúdo deve ter entre 1 e 10.000 caracteres." };
  }
  if (!channel || !VALID_CHANNELS.has(channel)) {
    return { error: "Canal inválido." };
  }

  try {
    const supabase = createSupabaseServiceClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("display_name, photo_url")
      .eq("id", session.uid)
      .maybeSingle();
    if (profileError) throw profileError;

    const id = randomUUID();
    const now = new Date().toISOString();
    const { error } = await supabase.from("community_threads").insert({
      id,
      course_id: null,
      channel,
      author_id: session.uid,
      legacy_author_firebase_uid: null,
      title,
      content,
      author_name: profile?.display_name || "Aluno",
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
    });
    if (error) throw error;

    await logAudit({
      action: "COMMUNITY_THREAD_CREATED",
      actor: { uid: session.uid, email: session.email, role: session.role },
      target: { collection: "community_threads", id, summary: title },
      metadata: { channel },
    });
    revalidatePath("/portal/community");
    return { success: true };
  } catch (error) {
    console.error("Create community topic failed", error);
    return { error: "Não foi possível publicar o tópico. Tente novamente." };
  }
}
