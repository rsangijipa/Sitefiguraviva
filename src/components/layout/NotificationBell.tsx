"use client";

import { useState, useEffect } from 'react';
import { Bell, Check, BellRing } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import { NotificationDoc } from '@/types/lms';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Button from '@/components/ui/Button';

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
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-stone-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                        <div className="p-3 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                            <h3 className="font-bold text-sm text-stone-700">Notificações</h3>
                            {unreadCount > 0 && (
                                <button onClick={handleMarkAllRead} className="text-xs text-primary hover:text-primary/80 font-medium">
                                    Marcar todas como lidas
                                </button>
                            )}
                        </div>
                        <div className="max-h-[400px] overflow-y-auto divide-y divide-stone-50">
                            {notifications.length > 0 ? notifications.map(notif => (
                                <Link
                                    key={notif.id}
                                    href={notif.link}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "block p-4 hover:bg-stone-50 transition-colors relative group",
                                        !notif.isRead ? "bg-blue-50/30" : ""
                                    )}
                                >
                                    <div className="flex gap-3">
                                        <div className={cn("mt-1 w-2 h-2 rounded-full shrink-0", !notif.isRead ? "bg-blue-500" : "bg-stone-200")} />
                                        <div className="flex-1">
                                            <h4 className={cn("text-sm text-stone-800 mb-1", !notif.isRead ? "font-bold" : "font-medium")}>
                                                {notif.title}
                                            </h4>
                                            {notif.body && <p className="text-xs text-stone-500 line-clamp-2 mb-1">{notif.body}</p>}
                                            <span className="text-[10px] text-stone-400 block mt-1">
                                                {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        {!notif.isRead && (
                                            <button
                                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                className="p-1 text-stone-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Marcar como lida"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                    </div>
                                </Link>
                            )) : (
                                <div className="p-8 text-center text-stone-400 text-sm">
                                    <BellRing size={24} className="mx-auto mb-2 opacity-50" />
                                    <p>Nenhuma notificação.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
