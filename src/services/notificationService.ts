import {
  createNotification,
  getUnreadCount as getUnreadCountFromRepo,
  getUserNotifications,
  markAllAsRead as markAllAsReadFromRepo,
  markAsRead as markAsReadFromRepo,
  type NotificationRecord,
} from "@/features/notifications/infrastructure/supabaseNotificationRepository.server";

export type NotificationDoc = NotificationRecord;

export const notificationService = {
  async getUserNotifications(
    userId: string,
    limitCount = 20,
  ): Promise<NotificationDoc[]> {
    return getUserNotifications(userId, limitCount);
  },

  async getUnreadCount(userId: string): Promise<number> {
    return getUnreadCountFromRepo(userId);
  },

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    return markAsReadFromRepo(userId, notificationId);
  },

  async markAllAsRead(userId: string): Promise<void> {
    return markAllAsReadFromRepo(userId);
  },

  // Usually called by server actions or Cloud Functions, but accessible here for MVP
  async createNotification(
    userId: string,
    notification: Omit<NotificationDoc, "id" | "createdAt" | "isRead">,
  ): Promise<string> {
    return createNotification(userId, notification);
  },
};
