"use client";

import { useEffect, useState } from "react";
import { Bell, Pin } from "lucide-react";
import { AnnouncementDoc } from "@/types/lms";
import { announcementService } from "@/services/announcementService";
import { cn } from "@/lib/utils"; // Assuming utils exists

export default function AnnouncementList({ courseId }: { courseId: string }) {
  const [announcements, setAnnouncements] = useState<AnnouncementDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = announcementService.subscribeToPublishedAnnouncements(
      courseId,
      (data) => {
        setAnnouncements(data);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [courseId]);

  if (loading)
    return (
      <div className="p-4 text-center text-xs text-stone-400">
        Carregando avisos...
      </div>
    );

  if (announcements.length === 0) {
    return (
      <div className="text-sm text-blue-600/80 italic">
        Nenhum aviso no momento.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="bg-white/50 p-4 rounded-lg border border-blue-100"
        >
          <div className="flex items-start gap-3">
            {announcement.isPinned && (
              <Pin
                size={14}
                className="mt-1 text-blue-500 shrink-0 transform rotate-45"
              />
            )}
            <div>
              <h4 className="font-bold text-blue-900 text-sm mb-1">
                {announcement.title}
              </h4>
              <div className="prose prose-sm text-blue-800/80 text-xs leading-relaxed">
                {announcement.content}
              </div>
              <div className="mt-2 text-[10px] text-blue-400 font-mono">
                {announcement.publishAt?.toDate
                  ? announcement.publishAt.toDate().toLocaleDateString()
                  : ""}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
