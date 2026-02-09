"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, getDoc, addDoc, deleteDoc, where, getDocs } from 'firebase/firestore';
import { Search, User, Clock, Phone, Mail, GraduationCap, Check, Info, MessageCircle, UserPlus, Trash2, MoreVertical, Briefcase, Calendar } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [courses, setCourses] = useState<Record<string, any>>({});
    const [enrollingId, setEnrollingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));

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

    const filteredApps = applications.filter(a => {
        const matchesSearch =
            a.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.answers?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.answers?.phone?.includes(searchTerm) ||
            courses[a.courseId]?.title?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || a.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

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

    const handleEnroll = async (app: any) => {
        setEnrollingId(app.id);
        try {
            let targetUserId = app.userId;

            // Fix: If userId is missing, try to find user by email
            if (!targetUserId && app.userEmail) {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('email', '==', app.userEmail));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    targetUserId = querySnapshot.docs[0].id;
                }
            }

            if (!targetUserId) {
                addToast('Erro: Usuário não possui conta registrada no sistema.', 'error');
                setEnrollingId(null);
                return;
            }

            // Create enrollment document
            await addDoc(collection(db, 'enrollments'), {
                userId: targetUserId,
                userName: app.userName || app.answers?.fullName,
                userEmail: app.userEmail,
                userPhone: app.answers?.phone || app.userPhone,
                courseId: app.courseId,
                courseName: courses[app.courseId]?.title || 'Curso',
                status: 'active',
                enrolledAt: serverTimestamp(),
                applicationId: app.id,
                enrolledBy: 'admin_manual'
            });

            // Update application status
            await updateDoc(doc(db, 'applications', app.id), {
                status: 'enrolled',
                enrolledAt: serverTimestamp()
            });

            addToast('Matrícula realizada com sucesso!', 'success');
        } catch (error) {
            console.error(error);
            addToast('Erro ao realizar matrícula', 'error');
        } finally {
            setEnrollingId(null);
        }
    };

    const openWhatsApp = (phone: string, name: string, courseName: string) => {
        const cleanPhone = phone?.replace(/\D/g, '') || '';
        const message = encodeURIComponent(
            `Olá ${name}! 👋\n\nVi que você demonstrou interesse no curso "${courseName}" do Instituto Figura Viva.\n\nGostaria de saber mais sobre sua inscrição?`
        );
        const url = `https://wa.me/55${cleanPhone}?text=${message}`;
        window.open(url, '_blank');
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'submitted': return 'Interesse Confirmado';
            case 'contacted': return 'Contatado';
            case 'enrolled': return 'Matriculado';
            case 'just_registered': return 'Apenas Cadastro';
            default: return status || 'Novo';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'submitted': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'contacted': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'enrolled': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-stone-50 text-stone-600 border-stone-200';
        }
    };

    const handleDelete = async (appId: string, appName: string) => {
        if (!confirm(`Tem certeza que deseja excluir o interesse de "${appName}"? Esta ação não pode ser desfeita.`)) {
            return;
        }

        setDeletingId(appId);
        try {
            await deleteDoc(doc(db, 'applications', appId));
            addToast('Interesse excluído com sucesso', 'success');
        } catch (error) {
            console.error(error);
            addToast('Erro ao excluir interesse', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const statusCounts = {
        all: applications.length,
        submitted: applications.filter(a => a.status === 'submitted').length,
        contacted: applications.filter(a => a.status === 'contacted').length,
        enrolled: applications.filter(a => a.status === 'enrolled').length,
    };

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="font-serif text-3xl text-primary font-bold">Interessados & Inscrições</h1>
                    <p className="text-stone-500 font-light">Acompanhe e gerencie as pessoas interessadas nos cursos.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email, telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-stone-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:border-gold outline-none transition-all shadow-sm"
                    />
                </div>
            </header>

            {/* Status Filters */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { key: 'all', label: 'Todos' },
                    { key: 'submitted', label: 'Aguardando Contato' },
                    { key: 'contacted', label: 'Contatados' },
                    { key: 'enrolled', label: 'Matriculados' },
                ].map((filter) => (
                    <button
                        key={filter.key}
                        onClick={() => setFilterStatus(filter.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterStatus === filter.key
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-white border border-stone-200 text-stone-600 hover:border-primary'
                            }`}
                    >
                        {filter.label}
                        <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
                            {statusCounts[filter.key as keyof typeof statusCounts]}
                        </span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Clock className="animate-spin text-stone-300" size={40} />
                </div>
            ) : filteredApps.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200 shadow-sm">
                    <Info className="mx-auto mb-4 text-stone-300" size={48} />
                    <h3 className="text-lg font-bold text-stone-500 font-serif">Nenhuma solicitação encontrada</h3>
                    <p className="text-stone-400">Aguarde novos interessados se cadastrarem.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredApps.map((app) => {
                        const phone = app.answers?.phone || app.userPhone;
                        const name = app.answers?.fullName || app.userName || 'Sem nome';
                        const courseName = courses[app.courseId]?.title || 'Curso';
                        const profession = app.answers?.profession;
                        const email = app.userEmail;
                        const createdDate = app.createdAt?.toDate?.();

                        return (
                            <motion.div
                                key={app.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                layout
                            >
                                <Card className="p-0 overflow-hidden border-stone-100 hover:shadow-xl transition-all duration-300 group">
                                    <div className="flex flex-col">
                                        {/* Status Indicator Strip */}
                                        <div className={`w-full h-1 ${app.status === 'enrolled' ? 'bg-green-500' :
                                            app.status === 'contacted' ? 'bg-blue-500' :
                                                app.status === 'submitted' ? 'bg-yellow-500' : 'bg-stone-300'
                                            }`} />

                                        <div className="p-5 md:p-6">
                                            {/* Header Row */}
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div className="flex gap-4 min-w-0">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-gold/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                                                        <User size={28} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-primary text-xl truncate">{name}</h3>
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border mt-1 ${getStatusColor(app.status)}`}>
                                                            {getStatusLabel(app.status)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDelete(app.id, name)}
                                                    disabled={deletingId === app.id}
                                                    className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    title="Excluir interesse"
                                                >
                                                    {deletingId === app.id ? (
                                                        <Clock size={18} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={18} />
                                                    )}
                                                </button>
                                            </div>

                                            {/* Info Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5 bg-stone-50/50 rounded-xl p-4 border border-stone-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-stone-400 shadow-sm">
                                                        <Mail size={16} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wide">Email</p>
                                                        <p className="text-sm text-primary truncate" title={email}>{email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-stone-400 shadow-sm">
                                                        <Phone size={16} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wide">Telefone</p>
                                                        <p className="text-sm text-primary">{phone || 'Não informado'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-stone-400 shadow-sm">
                                                        <Briefcase size={16} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wide">Profissão</p>
                                                        <p className="text-sm text-primary truncate">{profession || 'Não informado'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-stone-400 shadow-sm">
                                                        <Calendar size={16} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wide">Data</p>
                                                        <p className="text-sm text-primary">
                                                            {createdDate ? createdDate.toLocaleDateString('pt-BR', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            }) : 'Recentemente'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Course & Actions Row */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                                                        <GraduationCap size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wide">Curso de Interesse</p>
                                                        <p className="text-sm font-semibold text-primary">{courseName}</p>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-wrap gap-2">
                                                    {phone && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openWhatsApp(phone, name, courseName)}
                                                            className="gap-2 border-green-200 text-green-600 hover:bg-green-50"
                                                        >
                                                            <MessageCircle size={14} />
                                                            WhatsApp
                                                        </Button>
                                                    )}

                                                    {app.status !== 'enrolled' && (
                                                        <>
                                                            {app.status !== 'contacted' && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleUpdateStatus(app.id, 'contacted')}
                                                                    className="gap-2"
                                                                >
                                                                    <Check size={14} />
                                                                    Contatado
                                                                </Button>
                                                            )}

                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleEnroll(app)}
                                                                isLoading={enrollingId === app.id}
                                                                className="gap-2 bg-green-600 hover:bg-green-700"
                                                            >
                                                                <UserPlus size={14} />
                                                                Matricular
                                                            </Button>
                                                        </>
                                                    )}

                                                    {app.status === 'enrolled' && (
                                                        <span className="flex items-center gap-2 text-green-600 text-sm font-medium px-3 py-1.5 bg-green-50 rounded-lg">
                                                            <Check size={16} /> Matrícula Ativa
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
