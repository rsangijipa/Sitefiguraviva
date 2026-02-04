
import { auth, db } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LiveEvent } from '@/types/event';
import { LiveEventCard } from '@/components/portal/events/LiveEventCard';
import { Calendar } from 'lucide-react';
import { Timestamp } from 'firebase-admin/firestore';

export default async function EventsPage() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) redirect('/login');

    // Auth Check
    let uid;
    try {
        await auth.verifySessionCookie(sessionCookie, true);
    } catch { redirect('/login'); }

    // Fetch Events (Ordered by start date)
    // In production, filter by enrolled courses or public visibility
    const eventsSnap = await db.collection('events')
        .where('status', '!=', 'cancelled')
        .orderBy('status') // Constraint: inequality field must be first in orderBy
        .orderBy('startsAt', 'asc')
        .get();

    let events: LiveEvent[] = eventsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startsAt: doc.data().startsAt, // Ensure Timestamp is passed correctly
        endsAt: doc.data().endsAt
    } as LiveEvent));

    // If empty, mock data for demonstration if allowMock=true or just empty state
    // For Development, let's inject a mock event if database is empty so review is possible
    if (events.length === 0) {
        const now = new Date();
        const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);

        events = [
            {
                id: 'mock-1',
                title: 'Aula Inaugural: O Poder da Figura',
                description: 'Encontro ao vivo para discutir os fundamentos da metodologia e tirar dúvidas iniciais.',
                startsAt: Timestamp.fromDate(tomorrow),
                endsAt: Timestamp.fromDate(new Date(tomorrow.getTime() + 3600000)),
                timezone: 'America/Sao_Paulo',
                type: 'webinar',
                provider: 'zoom',
                joinUrl: 'https://zoom.us/j/123456789',
                status: 'scheduled',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            },
            {
                id: 'mock-2',
                title: 'Mentoria em Grupo #04',
                description: 'Sessão de feedback sobre os projetos do Módulo 2.',
                startsAt: Timestamp.fromDate(new Date(now.getTime() - 86400000)), // Yesterday
                endsAt: Timestamp.fromDate(new Date(now.getTime() - 82800000)),
                timezone: 'America/Sao_Paulo',
                type: 'webinar',
                provider: 'google_meet',
                status: 'ended',
                recordingUrl: '#',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            }
        ];
    }

    return (
        <div className="max-w-5xl mx-auto p-8 animate-fade-in-up">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">Agenda Ao Vivo</h1>
                    <p className="text-stone-500">Próximas aulas, mentorias e eventos da comunidade.</p>
                </div>
                <div className="hidden md:block p-3 bg-stone-100 rounded-full text-stone-400">
                    <Calendar size={24} />
                </div>
            </header>

            <div className="space-y-6">
                {/* Upcoming */}
                <section>
                    <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Próximos Eventos</h2>
                    <div className="grid gap-4">
                        {events.filter(e => e.status !== 'ended').map(event => (
                            <LiveEventCard key={event.id} event={event} />
                        ))}
                    </div>
                    {events.filter(e => e.status !== 'ended').length === 0 && (
                        <p className="text-stone-400 italic">Nenhum evento futuro agendado.</p>
                    )}
                </section>

                {/* Past */}
                <section className="mt-12">
                    <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Eventos Anteriores</h2>
                    <div className="grid gap-4 opacity-75">
                        {events.filter(e => e.status === 'ended').map(event => (
                            <LiveEventCard key={event.id} event={event} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
