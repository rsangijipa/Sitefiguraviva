"use client";

import { useState, useEffect } from 'react';
import { adminCourseService } from '@/services/adminCourseService';
import { Trash2, User, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

export default function CourseStudentsTab({ courseId }: { courseId: string }) {
    const { addToast } = useToast();
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStudents();
    }, [courseId]);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const data = await adminCourseService.getCourseEnrollments(courseId);
            setEnrollments(data);
        } catch (error) {
            console.error(error);
            addToast("Erro ao carregar alunos", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const action = currentStatus === 'active' ? 'Suspender' : 'Reativar';
        if (!confirm(`${action} acesso do aluno?`)) return;
        try {
            await adminCourseService.toggleEnrollmentStatus(id, currentStatus);
            addToast(`Acesso ${currentStatus === 'active' ? 'suspenso' : 'reativado'}`, 'success');
            loadStudents();
        } catch (e) {
            addToast("Erro ao alterar status", 'error');
        }
    };

    if (loading) return <div className="p-8 text-center text-stone-400">Carregando alunos...</div>;

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-stone-100">
                    <div className="text-xs font-bold uppercase text-stone-400 mb-1">Total de Alunos</div>
                    <div className="text-2xl font-bold text-stone-700">{enrollments.length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-stone-100">
                    <div className="text-xs font-bold uppercase text-stone-400 mb-1">Ativos</div>
                    <div className="text-2xl font-bold text-green-600">{enrollments.filter(e => e.status === 'active').length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-stone-100">
                    <div className="text-xs font-bold uppercase text-stone-400 mb-1">Concluíram</div>
                    <div className="text-2xl font-bold text-primary">{enrollments.filter(e => (e.progressSummary?.percent || 0) >= 100).length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-stone-100">
                    <div className="text-xs font-bold uppercase text-stone-400 mb-1">Progresso Médio</div>
                    <div className="text-2xl font-bold text-stone-700">
                        {enrollments.length > 0
                            ? Math.round(enrollments.reduce((acc, curr) => acc + (curr.progressSummary?.percent || 0), 0) / enrollments.length)
                            : 0}%
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-stone-100">
                <div>
                    <h3 className="font-bold text-stone-700">Lista de Alunos</h3>
                    <p className="text-xs text-stone-400">Gerencie o acesso e acompanhe o progresso individual.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
                <table className="w-full text-sm text-left text-stone-600">
                    <thead className="bg-stone-50 text-xs font-bold uppercase text-stone-400">
                        <tr>
                            <th className="px-6 py-3">Aluno</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Progresso</th>
                            <th className="px-6 py-3">Aulas</th>
                            <th className="px-6 py-3">Último Acesso</th>
                            <th className="px-6 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                        {enrollments.map(enrollment => (
                            <tr key={enrollment.id} className="hover:bg-primary/5 transition-colors group">
                                <td className="px-6 py-4 font-medium flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                                        <User size={14} />
                                    </div>
                                    <div>
                                        <div className="text-stone-800">{enrollment.userId}</div>
                                        <div className="text-[10px] text-stone-400 font-mono">{enrollment.email || 'Email não disponível'}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-stone-400">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                        enrollment.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    )}>
                                        {enrollment.status === 'active' ? 'Ativo' : 'Suspenso'}
                                    </span>
                                    <div className="flex items-center gap-1 mt-1 text-[10px]">
                                        <Calendar size={10} />
                                        {enrollment.enrolledAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: `${enrollment.progressSummary?.percent || 0}%` }} />
                                    </div>
                                    <span className="text-[10px] text-stone-400 mt-1 block font-mono">{enrollment.progressSummary?.percent || 0}%</span>
                                </td>
                                <td className="px-6 py-4 text-xs text-stone-500">
                                    {enrollment.progressSummary?.completedLessonsCount || 0} / {enrollment.progressSummary?.totalLessonsCount || 0}
                                </td>
                                <td className="px-6 py-4 text-xs text-stone-500">
                                    {enrollment.lastAccessedAt?.toDate?.()?.toLocaleString() || '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleToggleStatus(enrollment.id, enrollment.status)}
                                        className={cn(
                                            "p-2 rounded transition-colors",
                                            enrollment.status === 'active' ? "text-stone-300 hover:text-red-500 hover:bg-red-50" : "text-green-500 hover:bg-green-50"
                                        )}
                                        title={enrollment.status === 'active' ? "Suspender Acesso" : "Reativar Acesso"}
                                    >
                                        <Trash2 size={16} /> {/* Could change icon based on state */}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {enrollments.length === 0 && (
                    <div className="py-12 text-center text-stone-400">
                        Nenhum aluno matriculado.
                    </div>
                )}
            </div>
        </div>
    );
}
