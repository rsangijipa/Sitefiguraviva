
"use client";

import { LiveEvent } from '@/types/event';
import { Calendar, Video, MapPin, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

interface LiveEventCardProps {
    event: LiveEvent;
}

// Helper to format Firestore Timestamp or Date
const formatDate = (ts: Timestamp | Date) => {
    const date = ts instanceof Timestamp ? ts.toDate() : ts;
    return new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

export const LiveEventCard = ({ event }: LiveEventCardProps) => {
    const now = new Date();
    const startDate = event.startsAt instanceof Timestamp ? event.startsAt.toDate() : event.startsAt;
    const isLive = now >= startDate && now <= (event.endsAt instanceof Timestamp ? event.endsAt.toDate() : event.endsAt);
    const isEnded = now > (event.endsAt instanceof Timestamp ? event.endsAt.toDate() : event.endsAt);

    return (
        <div className="bg-white rounded-xl border border-stone-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-6">

            {/* Date Badge */}
            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-stone-50 border border-stone-100 shrink-0">
                <span className="text-xs font-bold text-stone-500 uppercase">{startDate.toLocaleString('pt-BR', { month: 'short' })}</span>
                <span className="text-2xl font-bold text-stone-800">{startDate.getDate()}</span>
            </div>

            {/* Info */}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    {isLive && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Ao Vivo
                        </span>
                    )}
                    {isEnded && <span className="text-xs font-bold text-stone-400 uppercase">Encerrado</span>}
                    {!isLive && !isEnded && <span className="text-xs font-bold text-blue-600 uppercase">Agendado</span>}

                    <span className="text-xs text-stone-400">• {formatDate(startDate)}</span>
                </div>

                <h3 className="text-lg font-bold text-stone-800 mb-1">{event.title}</h3>
                <p className="text-sm text-stone-500 line-clamp-2">{event.description}</p>

                <div className="flex items-center gap-4 mt-3 text-sm text-stone-500">
                    <div className="flex items-center gap-1.5">
                        {event.type === 'in_person' ? <MapPin size={14} /> : <Video size={14} />}
                        <span className="capitalize">{event.type === 'in_person' ? 'Presencial' : 'Online'}</span>
                    </div>
                    {event.provider && (
                        <div className="flex items-center gap-1.5">
                            <span className="capitalize px-1.5 py-0.5 rounded bg-stone-100 text-[10px] font-bold border border-stone-200">
                                {event.provider}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Action */}
            <div className="shrink-0 flex md:flex-col gap-2">
                {event.joinUrl && !isEnded && (
                    <Button
                        variant={isLive ? "primary" : "secondary"}
                        className={cn("w-full md:w-auto", isLive && "shadow-red-500/20 shadow-lg")}
                        rightIcon={<ExternalLink size={14} />}
                        onClick={() => window.open(event.joinUrl, '_blank')}
                    >
                        {isLive ? "Entrar Agora" : "Definir Lembrete"}
                    </Button>
                )}
                {isEnded && event.recordingUrl && (
                    <Button variant="secondary" className="w-full md:w-auto">
                        Ver Gravação
                    </Button>
                )}
            </div>
        </div>
    );
};
