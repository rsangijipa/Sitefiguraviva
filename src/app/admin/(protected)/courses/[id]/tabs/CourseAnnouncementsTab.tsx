"use client";

import { useState, useEffect } from 'react';
import { Bell, Calendar, Pin, Trash2, Plus, Edit } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { AnnouncementDoc } from '@/types/lms';
import { announcementService } from '@/services/announcementService';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

export default function CourseAnnouncementsTab({ courseId }: { courseId: string }) {
    const { addToast } = useToast();
    const [announcements, setAnnouncements] = useState<AnnouncementDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        isPinned: false,
        publishAtDate: '',
        publishAtTime: ''
    });

    useEffect(() => {
        loadAnnouncements();
    }, [courseId]);

    const loadAnnouncements = async () => {
        setLoading(true);
        const data = await announcementService.getCourseAnnouncements(courseId);
        setAnnouncements(data);
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Parse date/time
        let publishAt = Timestamp.now();
        if (formData.publishAtDate && formData.publishAtTime) {
            const date = new Date(`${formData.publishAtDate}T${formData.publishAtTime}`);
            publishAt = Timestamp.fromDate(date);
        }

        try {
            await announcementService.createAnnouncement(courseId, {
                title: formData.title,
                content: formData.content, // Ideally use a proper markdown editor
                isPinned: formData.isPinned,
                publishAt: publishAt,
                authorId: 'admin',
                courseId: courseId,
            });
            addToast("Aviso criado com sucesso", 'success');
            setIsCreating(false);
            setFormData({ title: '', content: '', isPinned: false, publishAtDate: '', publishAtTime: '' });
            loadAnnouncements();
        } catch (error) {
            console.error(error);
            addToast("Erro ao criar aviso", 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir este aviso?")) return;
        try {
            await announcementService.deleteAnnouncement(courseId, id);
            addToast("Aviso excluído", 'success');
            loadAnnouncements();
        } catch (error) {
            addToast("Erro ao excluir", 'error');
        }
    };

    if (loading) return <div className="p-8 text-center text-stone-400">Carregando avisos...</div>;

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-4 text-blue-800 border border-blue-200">
                <Bell size={20} className="shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-sm">Quadro de Avisos</h4>
                    <p className="text-xs opacity-80 mt-1">Crie comunicados importantes para os alunos. Eles aparecerão no painel do curso.</p>
                </div>
            </div>

            {!isCreating ? (
                <div className="flex justify-end">
                    <Button onClick={() => setIsCreating(true)} leftIcon={<Plus size={16} />}>Novo Aviso</Button>
                </div>
            ) : (
                <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-stone-700">Novo Comunicado</h3>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Título</label>
                        <input
                            type="text"
                            className="w-full p-2 rounded border border-stone-200"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Conteúdo</label>
                        <textarea
                            className="w-full p-2 rounded border border-stone-200 min-h-[100px]"
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Data de Publicação</label>
                            <input
                                type="date"
                                className="w-full p-2 rounded border border-stone-200"
                                value={formData.publishAtDate}
                                onChange={e => setFormData({ ...formData, publishAtDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Hora</label>
                            <input
                                type="time"
                                className="w-full p-2 rounded border border-stone-200"
                                value={formData.publishAtTime}
                                onChange={e => setFormData({ ...formData, publishAtTime: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isPinned"
                            checked={formData.isPinned}
                            onChange={e => setFormData({ ...formData, isPinned: e.target.checked })}
                            className="rounded text-primary focus:ring-primary"
                        />
                        <label htmlFor="isPinned" className="text-sm text-stone-700">Fixar no topo</label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setIsCreating(false)} type="button">Cancelar</Button>
                        <Button type="submit">Publicar</Button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {announcements.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-xl border border-stone-200 flex items-start justify-between group">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                {item.isPinned && <Pin size={14} className="text-blue-500 fill-blue-500" />}
                                <h4 className="font-bold text-stone-800">{item.title}</h4>
                            </div>
                            <p className="text-sm text-stone-500 line-clamp-2">{item.content}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-stone-400">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {item.publishAt ? ((item.publishAt as any).toDate ? (item.publishAt as any).toDate().toLocaleString() : new Date(item.publishAt as any).toLocaleString()) : 'N/A'}</span>
                                {item.publishAt && ((item.publishAt as any).toDate ? (item.publishAt as any).toDate() : new Date(item.publishAt as any)) > new Date() && <span className="text-orange-500 font-bold">Agendado</span>}
                            </div>
                        </div>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-stone-300 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {announcements.length === 0 && !isCreating && (
                    <div className="text-center py-8 text-stone-400 border border-dashed border-stone-200 rounded-xl">
                        Nenhum aviso criado.
                    </div>
                )}
            </div>
        </div>
    );
}
