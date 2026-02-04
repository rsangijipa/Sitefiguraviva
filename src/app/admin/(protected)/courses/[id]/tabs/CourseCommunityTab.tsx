"use client";

import { useState, useEffect } from 'react';
import { adminCourseService } from '@/services/adminCourseService';
import { Trash2, MessageSquare, AlertCircle, Pin, Lock } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

export default function CourseCommunityTab({ courseId }: { courseId: string }) {
    const { addToast } = useToast();
    const [threads, setThreads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadThreads();
    }, [courseId]);

    const loadThreads = async () => {
        setLoading(true);
        try {
            const data = await adminCourseService.getCourseThreads(courseId);
            setThreads(data);
        } catch (error) {
            console.error(error);
            // addToast("Erro ao carregar comunidade", 'error'); 
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (thread: any, action: 'pin' | 'lock') => {
        try {
            const updates = action === 'pin' ? { isPinned: !thread.isPinned } : { isLocked: !thread.isLocked };
            await adminCourseService.updateThread(courseId, thread.id, updates);
            addToast(`Tópico ${action === 'pin' ? (thread.isPinned ? 'desfixado' : 'fixado') : (thread.isLocked ? 'destrancado' : 'trancado')}`, 'success');
            loadThreads();
        } catch (e) {
            addToast("Erro na ação", 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir este tópico?")) return;
        try {
            await adminCourseService.deleteThread(courseId, id);
            addToast("Tópico excluído", 'success');
            loadThreads();
        } catch (e) {
            addToast("Erro ao excluir", 'error');
        }
    };

    if (loading) return <div className="p-8 text-center text-stone-400">Carregando discussões...</div>;

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-orange-50 p-4 rounded-xl flex items-start gap-4 text-orange-800 border border-orange-200">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-sm">Moderação da Comunidade</h4>
                    <p className="text-xs opacity-80 mt-1">Aqui você pode visualizar e excluir tópicos inadequados para este curso específico.</p>
                </div>
            </div>

            <div className="space-y-4">
                {threads.map(thread => (
                    <div key={thread.id} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:border-primary/30 transition-all flex gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="p-1 rounded bg-stone-100 text-stone-500"><MessageSquare size={14} /></span>
                                <h4 className="font-bold text-stone-800 text-sm">{thread.title}</h4>
                                {thread.isPinned && <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Fixado</span>}
                                {thread.isLocked && <span className="bg-stone-100 text-stone-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Trancado</span>}
                            </div>
                            <p className="text-sm text-stone-600 line-clamp-2">{thread.content}</p>
                            <div className="mt-2 text-xs text-stone-400">
                                Por {thread.authorId} • {thread.replyCount} respostas • Atualizado em {thread.lastReplyAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => handleAction(thread, 'pin')} className={cn("p-2 rounded transition-colors", thread.isPinned ? "text-yellow-500 bg-yellow-50" : "text-stone-300 hover:text-yellow-500 hover:bg-yellow-50")} title="Fixar">
                                <Pin size={16} />
                            </button>
                            <button onClick={() => handleAction(thread, 'lock')} className={cn("p-2 rounded transition-colors", thread.isLocked ? "text-red-500 bg-red-50" : "text-stone-300 hover:text-stone-600 hover:bg-stone-50")} title="Trancar">
                                <Lock size={16} />
                            </button>
                            <button onClick={() => handleDelete(thread.id)} className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Excluir">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {threads.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400">
                        Nenhuma discussão iniciada.
                    </div>
                )}
            </div>
        </div>
    );
}
