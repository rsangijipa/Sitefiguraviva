"use client";

import { useAuth } from "@/context/AuthContext";
import { eventService, EventDoc } from "@/services/eventService";
import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function PortalEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    eventService.getUpcomingEvents(20).then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, [user?.uid]);

  const formatDate = (ts: any) => {
    const date = ts?.toDate ? ts.toDate() : new Date(ts);
    return {
      day: date.toLocaleDateString("pt-BR", { day: "2-digit" }),
      month: date
        .toLocaleDateString("pt-BR", { month: "short" })
        .replace(".", ""),
      full: date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      }),
      time: date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-stone-800">Agenda Viva</h1>
          <p className="text-stone-500 mt-1">
            Acompanhe nossos encontros ao vivo, mentorias e eventos especiais.
          </p>
        </div>
        <Link href="/portal">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft size={16} />}
          >
            Voltar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {events.length > 0 ? (
          events.map((event) => {
            const date = formatDate(event.startsAt);
            const isLive = event.status === "live";

            return (
              <div
                key={event.id}
                className={cn(
                  "bg-white rounded-2xl border transition-all overflow-hidden flex flex-col md:flex-row",
                  isLive
                    ? "border-amber-200 shadow-amber-100/50 shadow-xl"
                    : "border-stone-100 hover:border-gold/30 hover:shadow-md",
                )}
              >
                {/* Date Badge */}
                <div
                  className={cn(
                    "w-full md:w-32 flex flex-col items-center justify-center p-6 shrink-0",
                    isLive
                      ? "bg-amber-500 text-white"
                      : "bg-stone-50 text-stone-600",
                  )}
                >
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                    {date.month}
                  </span>
                  <span className="text-4xl font-serif font-bold leading-none my-1">
                    {date.day}
                  </span>
                  {isLive && (
                    <span className="mt-2 px-2 py-0.5 bg-white text-amber-600 text-[10px] font-bold uppercase rounded-full animate-pulse">
                      AO VIVO
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-md uppercase tracking-wider">
                        {event.courseId
                          ? "Mentoria Exclusiva"
                          : "Evento Especial"}
                      </span>
                      <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium">
                        <Clock size={14} />
                        <span>{date.time}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-stone-800 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-stone-500 line-clamp-2 mb-4 leading-relaxed">
                      {event.description ||
                        "Participe deste encontro transformador com a equipe do Instituto Figura Viva."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-stone-400">
                        {event.type === "in_person" ? (
                          <MapPin size={14} />
                        ) : (
                          <Video size={14} />
                        )}
                        <span>
                          {event.type === "in_person"
                            ? event.location
                            : "Online (Zoom/Meet)"}
                        </span>
                      </div>
                    </div>

                    {event.joinUrl ? (
                      <a
                        href={event.joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                      >
                        Acessar Sala <ExternalLink size={14} />
                      </a>
                    ) : (
                      <Button disabled size="sm" variant="outline">
                        Link em breve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
            <Calendar size={48} className="text-stone-300 mb-4" />
            <h3 className="text-lg font-bold text-stone-700">
              Agenda Tranquila
            </h3>
            <p className="text-stone-500 text-sm max-w-xs text-center mt-2">
              No momento não há eventos agendados. Fique atento às nossas
              notificações!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
