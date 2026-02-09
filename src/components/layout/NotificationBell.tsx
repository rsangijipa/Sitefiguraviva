"use client";

import { useState, useEffect } from "react";
import { Bell, Check, BellRing } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { notificationService } from "@/services/notificationService";
import { NotificationDoc } from "@/types/lms";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadNotifications();

    // Polling for MVP (Real-time listener would be better)
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    const data = await notificationService.getUserNotifications(user.uid);
    const count = await notificationService.getUnreadCount(user.uid);
    setNotifications(data);
    setUnreadCount(count);
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    await notificationService.markAsRead(user.uid, id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.uid);
    loadNotifications();
  };

  if (!user) return null;

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-stone-500 hover:text-stone-800 transition-colors"
        title="Notificações"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-stone-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right">
            <div className="p-5 border-b border-stone-50 flex justify-between items-center bg-white">
              <div>
                <h3 className="font-bold text-stone-800">Notificações</h3>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                  Você tem {unreadCount} novas
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-primary hover:text-gold font-bold uppercase tracking-wider transition-colors"
                >
                  Marcar todas
                </button>
              )}
            </div>
            <div className="max-h-[450px] overflow-y-auto divide-y divide-stone-50 custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.link || "#"}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block p-5 hover:bg-stone-50 transition-all relative group",
                      !notif.isRead ? "bg-primary/[0.02]" : "",
                    )}
                  >
                    <div className="flex gap-4">
                      <div
                        className={cn(
                          "mt-1.5 w-2 h-2 rounded-full shrink-0 shadow-sm",
                          !notif.isRead
                            ? "bg-gold animate-pulse"
                            : "bg-stone-200",
                        )}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4
                            className={cn(
                              "text-sm text-stone-800 leading-snug",
                              !notif.isRead ? "font-bold" : "font-medium",
                            )}
                          >
                            {notif.title}
                          </h4>
                          {!notif.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(notif.id, e)}
                              className="p-1 text-stone-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                              title="Lida"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                        {notif.body && (
                          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                            {notif.body}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-stone-300 font-bold uppercase tracking-tight">
                            {notif.createdAt?.toDate
                              ? notif.createdAt
                                  .toDate()
                                  .toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BellRing size={24} className="text-stone-300" />
                  </div>
                  <h4 className="text-stone-800 font-bold text-sm">
                    Tudo em dia!
                  </h4>
                  <p className="text-xs text-stone-400 mt-1">
                    Você não tem novas notificações no momento.
                  </p>
                </div>
              )}
            </div>
            <div className="p-3 bg-stone-50 border-t border-stone-100 text-center">
              <button className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] hover:text-primary transition-colors">
                Central de Ajuda
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
