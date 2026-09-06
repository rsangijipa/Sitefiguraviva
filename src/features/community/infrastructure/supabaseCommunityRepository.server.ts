import { randomUUID } from "crypto";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import type { TableRow } from "@/infrastructure/supabase/database.types";
import type { CommunityReplyDoc, CommunityThreadDoc } from "@/types/lms";

type ThreadRow = TableRow<"community_threads">;
type ReplyRow = TableRow<"community_replies">;

function mapThreadRow(row: ThreadRow): CommunityThreadDoc {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    content: row.content,
    authorId: row.legacy_author_firebase_uid || row.author_id || "",
    authorName: row.author_name,
    authorAvatar: row.author_avatar_url || undefined,
    replyCount: row.reply_count,
    likeCount: row.like_count,
    viewCount: row.view_count,
    isPinned: row.is_pinned,
    isLocked: row.is_locked,
    isDeleted: row.is_deleted,
    lastReplyAt: row.last_reply_at as any,
    createdAt: row.created_at as any,
    updatedAt: row.updated_at as any,
  };
}

function mapReplyRow(row: ReplyRow): CommunityReplyDoc {
  return {
    id: row.id,
    threadId: row.thread_id,
    authorId: row.legacy_author_firebase_uid || row.author_id || "",
    authorName: row.author_name,
    authorAvatar: row.author_avatar_url || undefined,
    content: row.content,
    likeCount: row.like_count,
    isDeleted: row.is_deleted,
    createdAt: row.created_at as any,
    updatedAt: row.updated_at as any,
  };
}

export async function listGlobalThreads(
  limitCount = 10,
  supabase = createSupabaseBrowserClient(),
): Promise<CommunityThreadDoc[]> {
  const { data, error } = await supabase
    .from("community_threads")
    .select("*")
    .eq("is_deleted", false)
    .order("is_pinned", { ascending: false })
    .order("last_reply_at", { ascending: false })
    .limit(limitCount);

  if (error) throw error;
  return (data ?? []).map(mapThreadRow);
}

export async function listCourseThreads(
  courseId: string,
  limitCount = 10,
  supabase = createSupabaseBrowserClient(),
): Promise<CommunityThreadDoc[]> {
  const { data, error } = await supabase
    .from("community_threads")
    .select("*")
    .eq("course_id", courseId)
    .eq("is_deleted", false)
    .order("is_pinned", { ascending: false })
    .order("last_reply_at", { ascending: false })
    .limit(limitCount);

  if (error) throw error;
  return (data ?? []).map(mapThreadRow);
}

export async function getThread(
  courseId: string,
  threadId: string,
  supabase = createSupabaseBrowserClient(),
): Promise<CommunityThreadDoc | null> {
  const { data, error } = await supabase
    .from("community_threads")
    .select("*")
    .eq("id", threadId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapThreadRow(data) : null;
}

export async function listReplies(
  threadId: string,
  limitCount = 50,
  supabase = createSupabaseBrowserClient(),
): Promise<CommunityReplyDoc[]> {
  const { data, error } = await supabase
    .from("community_replies")
    .select("*")
    .eq("thread_id", threadId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true })
    .limit(limitCount);

  if (error) throw error;
  return (data ?? []).map(mapReplyRow);
}

export async function createThread(
  courseId: string,
  user: { uid: string; displayName: string; photoURL?: string },
  title: string,
  content: string,
  supabase = createSupabaseBrowserClient(),
): Promise<string> {
  const id = randomUUID();
  const { error } = await supabase.from("community_threads").insert({
    id,
    course_id: courseId,
    author_id: user.uid,
    title,
    content,
    author_name: user.displayName || "Usuário",
    author_avatar_url: user.photoURL || null,
    reply_count: 0,
    like_count: 0,
    view_count: 0,
    is_pinned: false,
    is_locked: false,
    is_deleted: false,
    last_reply_at: new Date().toISOString(),
    legacy_author_firebase_uid: null,
  });

  if (error) throw error;
  return id;
}

export async function createReply(
  courseId: string,
  threadId: string,
  user: { uid: string; displayName: string; photoURL?: string },
  content: string,
  supabase = createSupabaseBrowserClient(),
): Promise<string> {
  const id = randomUUID();
  const now = new Date().toISOString();

  const { error: replyError } = await supabase
    .from("community_replies")
    .insert({
      id,
      thread_id: threadId,
      author_id: user.uid,
      content,
      author_name: user.displayName || "Usuário",
      author_avatar_url: user.photoURL || null,
      like_count: 0,
      is_deleted: false,
      legacy_author_firebase_uid: null,
      created_at: now,
      updated_at: now,
    });

  if (replyError) throw replyError;

  const { error: threadError } = await supabase
    .from("community_threads")
    .update({
      updated_at: now,
      last_reply_at: now,
    })
    .eq("id", threadId)
    .eq("course_id", courseId);

  if (threadError) throw threadError;
  return id;
}

export async function setThreadStatus(
  courseId: string,
  threadId: string,
  status: "active" | "hidden" | "locked",
  supabase = createSupabaseBrowserClient(),
): Promise<void> {
  const updates =
    status === "active"
      ? { is_deleted: false, is_locked: false }
      : status === "locked"
        ? { is_locked: true, is_deleted: false }
        : { is_deleted: true };

  const { error } = await supabase
    .from("community_threads")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", threadId)
    .eq("course_id", courseId);

  if (error) throw error;
}

export async function setReplyStatus(
  threadId: string,
  replyId: string,
  status: "active" | "hidden",
  supabase = createSupabaseBrowserClient(),
): Promise<void> {
  const { error } = await supabase
    .from("community_replies")
    .update({
      is_deleted: status === "hidden",
      updated_at: new Date().toISOString(),
    })
    .eq("id", replyId)
    .eq("thread_id", threadId);

  if (error) throw error;
}
