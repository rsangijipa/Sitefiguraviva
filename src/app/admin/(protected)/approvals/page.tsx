"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Check, X, Clock, User, ExternalLink, ShieldCheck, Mail, Info } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ApprovalsPage() {
    const [pendingEnrollments, setPendingEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Record<string, any>>({});
    const { addToast } = useToast();

    // 1. Fetch Pending Enrollments
    useEffect(() => {
        const q = query(
            collection(db, 'enrollments'),
            where('status', '==', 'pending_approval')
        );

        const unsub = onSnapshot(q, async (snapshot) => {
            const enrollments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            // Fetch missing course details
            const newCourseIds = enrollments
                .map((e: any) => e.courseId)
                .filter(id => !courses[id]);

            if (newCourseIds.length > 0) {
                const courseData: Record<string, any> = { ...courses };
                const promises = newCourseIds.map(async (id) => {
                    const snap = await getDoc(doc(db, 'courses', id));
                    if (snap.exists()) courseData[id] = snap.data();
                });
                await Promise.all(promises);
                setCourses(courseData);
            }

            setPendingEnrollments(enrollments);
            setLoading(false);
        });

        return () => unsub();
    }, [courses]);

    const handleApprove = async (enrollment: any) => {
        if (!confirm(`Aprovar a matrícula de ${enrollment.uid} no curso ${courses[enrollment.courseId]?.title}?`)) return;

        try {
            const updateData = {
                status: 'active',
                approvalStatus: 'approved',
                approvedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const batch = [];
            // Update Global Enrollment
            batch.push(updateDoc(doc(db, 'enrollments', enrollment.id), updateData));
            // Update User Subcollection Enrollment
            batch.push(updateDoc(doc(db, 'users', enrollment.uid, 'enrollments', enrollment.courseId), updateData));

            await Promise.all(batch);
            addToast('Matrícula aprovada com sucesso!', 'success');
        } catch (error) {
            console.error(error);
            addToast('Erro ao aprovar matrícula.', 'error');
        }
    };

    const handleReject = async (enrollment: any) => {
        const reason = prompt("Motivo da rejeição (opcional):");
        if (reason === null) return; // Cancelled

        try {
            const updateData = {
                status: 'rejected',
                approvalStatus: 'rejected',
                rejectionReason: reason || 'Não atende aos critérios do curso.',
                rejectedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const batch = [];
            batch.push(updateDoc(doc(db, 'enrollments', enrollment.id), updateData));
            batch.push(updateDoc(doc(db, 'users', enrollment.uid, 'enrollments', enrollment.courseId), updateData));

            await Promise.all(batch);
            addToast('Matrícula rejeitada.', 'info');
        } catch (error) {
            console.error(error);
            addToast('Erro ao rejeitar matrícula.', 'error');
        }
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="font-serif text-3xl text-primary">Fila de Aprovação</h1>
                <p className="text-stone-500 font-light">Revise e aprove as matrículas que já foram pagas.</p>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Clock className="animate-spin text-stone-300" size={40} />
                </div>
            ) : pendingEnrollments.length === 0 ? (
                <div className="text-center py-20 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                    <Check className="mx-auto mb-4 text-stone-300" size={48} />
                    <h3 className="text-lg font-bold text-stone-500">Tudo limpo!</h3>
                    <p className="text-stone-400">Não há matrículas pendentes de aprovação no momento.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {pendingEnrollments.map((en) => (
                        <Card key={en.id} className="p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-primary shrink-0">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-primary">{en.uid}</h3>
                                            <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider rounded border border-green-100 flex items-center gap-1">
                                                <ShieldCheck size={10} /> Pago
                                            </span>
                                        </div>
                                        <p className="text-sm text-stone-500 mb-2">
                                            Curso: <span className="font-bold text-primary">{courses[en.courseId]?.title || en.courseId}</span>
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-xs text-stone-400">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} /> Pago em: {en.activatedAt?.toDate?.()?.toLocaleString() || 'Processando...'}
                                            </span>
                                            {en.applicationId && (
                                                <span className="flex items-center gap-1">
                                                    <Info size={12} /> ID Inscrição: {en.applicationId}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        color="danger"
                                        size="sm"
                                        leftIcon={<X size={16} />}
                                        onClick={() => handleReject(en)}
                                    >
                                        Rejeitar
                                    </Button>
                                    <Button
                                        size="sm"
                                        leftIcon={<Check size={16} />}
                                        onClick={() => handleApprove(en)}
                                    >
                                        Aprovar Matrícula
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
