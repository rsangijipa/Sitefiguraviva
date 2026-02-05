"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Search, User, Clock, Phone, Mail, GraduationCap, X, Check, Info } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [courses, setCourses] = useState<Record<string, any>>({});
    const { addToast } = useToast();

    useEffect(() => {
        const q = query(collection(db, 'applications'));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const apps = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            // Fetch course titles if missing
            const newCourseIds = apps
                .map((a: any) => a.courseId)
                .filter(id => id && !courses[id]);

            if (newCourseIds.length > 0) {
                const courseData = { ...courses };
                await Promise.all(newCourseIds.map(async (id) => {
                    const snap = await getDoc(doc(db, 'courses', id));
                    if (snap.exists()) courseData[id] = snap.data();
                }));
                setCourses(courseData);
            }

            setApplications(apps);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [courses]);

    const filteredApps = applications.filter(a =>
        a.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        courses[a.courseId]?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUpdateStatus = async (appId: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, 'applications', appId), {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            addToast(`Status atualizado para ${newStatus}`, 'success');
        } catch (error) {
            console.error(error);
            addToast('Erro ao atualizar status', 'error');
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="font-serif text-3xl text-primary font-bold">Interessados & Inscrições</h1>
                    <p className="text-stone-500 font-light">Acompanhe novos cadastros e solicitações de inscrição.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email ou curso..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-stone-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:border-gold outline-none transition-all shadow-sm"
                    />
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Clock className="animate-spin text-stone-300" size={40} />
                </div>
            ) : filteredApps.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200 shadow-sm">
                    <Info className="mx-auto mb-4 text-stone-300" size={48} />
                    <h3 className="text-lg font-bold text-stone-500 font-serif">Nenhuma solicitação encontrada</h3>
                    <p className="text-stone-400">Tente buscar por termos diferentes ou aguarde novos cadastros.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredApps.map((app) => (
                        <Card key={app.id} className="p-0 overflow-hidden border-stone-100 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex flex-col md:flex-row">
                                {/* Status Indicator Strip */}
                                <div className={`w-full md:w-2 h-2 md:h-auto ${app.status === 'just_registered' ? 'bg-blue-400' :
                                    app.status === 'submitted' ? 'bg-gold' :
                                        app.status === 'approved' ? 'bg-green-500' : 'bg-stone-300'
                                    }`} />

                                <div className="p-6 flex-1 grid md:grid-cols-12 gap-6 items-center">
                                    {/* User Info */}
                                    <div className="md:col-span-4 flex gap-4">
                                        <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary shrink-0">
                                            <User size={24} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-primary truncate">{app.userName || 'Sem nome'}</h3>
                                            <div className="flex items-center gap-1.5 text-stone-400 text-xs mt-0.5">
                                                <Mail size={12} />
                                                <span className="truncate">{app.userEmail}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-stone-400 text-xs mt-0.5">
                                                <Phone size={12} />
                                                <span>{app.userPhone || 'Não informado'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Course Info */}
                                    <div className="md:col-span-3">
                                        <div className="flex items-center gap-2 text-primary/40 text-[10px] font-bold uppercase tracking-widest mb-1">
                                            <GraduationCap size={12} /> Interesse
                                        </div>
                                        <p className="text-sm font-medium text-primary">
                                            {courses[app.courseId]?.title || app.courseId || 'Interesse Geral'}
                                        </p>
                                    </div>

                                    {/* Status & Date */}
                                    <div className="md:col-span-2">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${app.status === 'just_registered' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                            app.status === 'submitted' ? 'bg-gold/10 text-gold border border-gold/20' :
                                                'bg-stone-100 text-stone-500'
                                            }`}>
                                            {app.status === 'just_registered' ? 'Apenas Cadastro' :
                                                app.status === 'submitted' ? 'Formulário Enviado' : app.status}
                                        </span>
                                        <div className="text-[10px] text-stone-400 mt-2 flex items-center gap-1">
                                            <Clock size={10} /> {app.createdAt?.toDate?.()?.toLocaleDateString() || 'Recentemente'}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="md:col-span-3 flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.location.href = `mailto:${app.userEmail}`}
                                            leftIcon={<Mail size={14} />}
                                        >
                                            Email
                                        </Button>
                                        <Button
                                            variant="outline"
                                            color="primary"
                                            size="sm"
                                            onClick={() => handleUpdateStatus(app.id, 'contacted')}
                                            leftIcon={<Check size={14} />}
                                        >
                                            Contatar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
