import { randomUUID } from "crypto";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import type { TableRow } from "@/infrastructure/supabase/database.types";
import type { NotificationDoc } from "@/types/lms";

type NotificationRow = TableRow<"notifications">;

export interface NotificationRecord {
  id: string;
  userId: string;
  type: NotificationDoc["type"];
  title: string;
  body?: string | null;
  link: string;
  isRead: boolean;
  readAt?: any;
  createdAt: any;
  metadata?: NotificationDoc["metadata"];
}

function mapNotificationRow(row: NotificationRow): NotificationRecord {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as NotificationDoc["type"],
    title: row.title,
    body: row.body,
    link: row.link,
    isRead: row.is_read,
    readAt: row.read_at,
    createdAt: row.created_at,
    metadata: row.metadata as NotificationDoc["metadata"],
  };
}

export async function getUserNotifications(
  userId: string,
  limitCount = 20,
  supabase = createSupabaseBrowserClient(),
): Promise<NotificationRecord[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limitCount);

  if (error) throw error;
  return (data ?? []).map(mapNotificationRow);
}

export async function getUnreadCount(
  userId: string,
  supabase = createSupabaseBrowserClient(),
): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
  return count ?? 0;
}

export async function markAsRead(
  userId: string,
  notificationId: string,
  supabase = createSupabaseBrowserClient(),
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function markAllAsRead(
  userId: string,
  supabase = createSupabaseBrowserClient(),
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
}

export async function createNotification(
  userId: string,
  notification: Omit<
    NotificationRecord,
    "id" | "userId" | "createdAt" | "isRead"
  >,
  supabase = createSupabaseBrowserClient(),
): Promise<string> {
  const id = randomUUID();
  const { error } = await supabase.from("notifications").insert({
    id,
    user_id: userId,
    type: notification.type,
    title: notification.title,
    body: notification.body || null,
    link: notification.link,
    is_read: false,
    metadata: (notification.metadata || {}) as any,
  });

  if (error) throw error;
  return id;
}
