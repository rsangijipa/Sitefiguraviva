import { useState, useEffect } from "react";
import { presenceService } from "@/services/presenceService";

export function usePresence(
  userId: string,
  contextId: string,
  userName: string,
  userAvatar?: string,
) {
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!userId || !contextId) return;

    // Initial heart beat
    presenceService.updatePresence(userId, contextId, {
      name: userName,
      avatar: userAvatar,
      isTyping: false,
    });

    // Subscription
    const unsubscribe = presenceService.subscribeToPresence(
      contextId,
      (users) => {
        setActiveUsers(users.filter((u) => u.userId !== userId));
      },
    );

    // Cleanup on unmount
    return () => {
      presenceService.clearPresence(userId, contextId);
      unsubscribe();
    };
  }, [userId, contextId, userName, userAvatar]);

  // Handle typing state with debounce
  useEffect(() => {
    if (!userId || !contextId) return;

    const timeout = setTimeout(() => {
      presenceService.updatePresence(userId, contextId, {
        name: userName,
        isTyping,
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [isTyping, userId, contextId, userName]);

  return { activeUsers, setIsTyping };
}
