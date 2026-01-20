"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/client';
import { doc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { Trash2, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/context/ToastContext';

interface EnrollmentCardProps {
    enrollment: any;
    course: any;
    userId: string;
}

export function EnrollmentCard({ enrollment, course, userId }: EnrollmentCardProps) {
    const [progress, setProgress] = useState<any>(null);
    const { addToast } = useToast();

    // Fetch Progress realtime
    useEffect(() => {
        if (!enrollment.courseId || !userId) return;

        const unsub = onSnapshot(doc(db, 'progress', `${userId}_${enrollment.courseId}`), (doc) => {
            if (doc.exists()) {
                setProgress(doc.data());
            } else {
                setProgress(null);
            }
        });

        return () => unsub();
    }, [enrollment.courseId, userId]);

    const handleRevoke = async () => {
        if (!confirm(`Tem certeza que deseja remover a matrícula de ${course?.title || 'este curso'}?`)) return;
        try {
            // Delete from root collection
            await deleteDoc(doc(db, 'enrollments', `${userId}_${enrollment.courseId}`));
            addToast('Matrícula removida.', 'success');
        } catch (error) {
            console.error(error);
            addToast('Erro ao remover matrícula.', 'error');
        }
    };

    const lastAccessDate = progress?.lastAccessedAt?.toDate?.()?.toLocaleDateString();

    // Calculate simple completion if we had module data, but without it we can just show "Last Lesson"
    // Or just "Started"

    return (
        <Card className="p-4 flex flex-col gap-4 group hover:border-gold/30 transition-all">
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                    {course?.image && (
                        <img src={course.image} className="w-16 h-16 rounded-lg object-cover bg-stone-100" />
                    )}
                    <div>
                        <h4 className="font-bold text-primary">{course?.title || enrollment.courseId}</h4>
                        <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${enrollment.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' :
                                    enrollment.status === 'past_due' ? 'bg-red-50 text-red-500 border-red-100' :
                                        'bg-stone-50 text-stone-500 border-stone-100'
                                }`}>
                                {enrollment.status}
                            </span>
                            <span>• {enrollment.enrolledAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleRevoke}
                    className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    title="Revogar Acesso"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Progress Section */}
            {(progress || enrollment.status === 'active') && (
                <div className="pt-4 border-t border-stone-100 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-stone-500">
                        <div className="p-1.5 bg-stone-50 rounded-md text-gold">
                            <TrendingUp size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-stone-300">Última Lição</span>
                            <span className="text-xs font-medium truncate max-w-[120px]">
                                {progress?.lastLessonId || 'Não iniciado'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-stone-500">
                        <div className="p-1.5 bg-stone-50 rounded-md text-primary/60">
                            <Clock size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-stone-300">Acesso</span>
                            <span className="text-xs font-medium">
                                {lastAccessDate || '-'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
