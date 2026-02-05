import { CreateEventButton } from '@/components/admin/events/CreateEventButton';
import { LiveEvent } from '@/types/event';
import { Calendar, Video, MapPin, MoreVertical } from 'lucide-react';
import { adminDb as db } from '@/lib/firebase/admin';

export default async function AdminEventsPage() {
    // Fetch Events
    const eventsSnap = await db.collection('events').orderBy('startsAt', 'desc').get();
    const events = eventsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as LiveEvent));

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-stone-800">Eventos Ao Vivo & Híbridos</h1>
                    <p className="text-stone-500 text-sm">Agende webinars, aulas presenciais e mentorias.</p>
                </div>
                <div className="flex gap-2">
                    <CreateEventButton />
                </div>
            </header>
// ...

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Total Agendado</span>
                        <Calendar size={18} className="text-blue-400" />
                    </div>
                    <div className="text-3xl font-serif font-bold text-stone-800">
                        {events.filter(e => e.status === 'scheduled').length}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Acontecendo Agora</span>
                        <Video size={18} className="text-red-400" />
                    </div>
                    <div className="text-3xl font-serif font-bold text-stone-800 italic">
                        {events.filter(e => e.status === 'live').length}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Total Concluído</span>
                        <Calendar size={18} className="text-green-400" />
                    </div>
                    <div className="text-3xl font-serif font-bold text-stone-800">
                        {events.filter(e => e.status === 'ended').length}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-stone-50 border-b border-stone-200">
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Evento</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Data / Hora</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Tipo</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {events.map(item => {
                            const date = (item.startsAt as any)?.toDate ? (item.startsAt as any).toDate() : (item.startsAt ? new Date(item.startsAt as any) : new Date());
                            return (
                                <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-bold text-stone-800">{item.title}</div>
                                            <div className="text-[10px] text-stone-400 font-bold uppercase mt-0.5">ID: {item.id}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-stone-600">
                                        <div className="font-medium">
                                            {date.toLocaleDateString('pt-BR')}
                                        </div>
                                        <div className="text-stone-400">
                                            {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
                                            {item.type === 'in_person' ? <MapPin size={14} className="text-stone-400" /> : <Video size={14} className="text-stone-400" />}
                                            <span className="capitalize">{item.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`
                                            px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                            ${item.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' :
                                                item.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-stone-100 text-stone-500'}
                                        `}>
                                            {item.status === 'live' ? 'Ao Vivo' :
                                                item.status === 'scheduled' ? 'Agendado' :
                                                    'Encerrado'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-2 hover:bg-stone-200 rounded-lg transition-colors text-stone-400">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {events.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-stone-400 italic">
                                    Nenhum evento agendado. Comece criando o seu primeiro webinar ou aula presencial.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
