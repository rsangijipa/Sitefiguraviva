"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, limit, onSnapshot, where, addDoc, deleteDoc, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { Search, User, Plus, GraduationCap, X, Trash2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useCourses } from '@/hooks/useContent';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function EnrollmentsManager() {
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const { addToast } = useToast();
    const { data: courses } = useCourses();
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');

    // Fetch Users 
    // Ideally use algolia or simple search if 'users' collection exists.
    // For now, fetch recent 50 users.
    useEffect(() => {
        const q = query(collection(db, 'users'), orderBy('lastLogin', 'desc'), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(docs);
        });
        return () => unsubscribe();
    }, []);

    // Filter users locally for MVP
    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Fetch Enrollments for Selected User
    useEffect(() => {
        if (!selectedUser) {
            setEnrollments([]);
            return;
        }
        const q = query(collection(db, 'users', selectedUser.id, 'enrollments'), orderBy('enrolledAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEnrollments(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsubscribe();
    }, [selectedUser]);

    const handleEnroll = async () => {
        if (!selectedCourse || !selectedUser) return;
        try {
            await addDoc(collection(db, 'users', selectedUser.id, 'enrollments'), {
                courseId: selectedCourse,
                enrolledAt: serverTimestamp(),
                status: 'active',
                createdBy: 'admin' // Could put admin uid here
            });
            addToast('Aluno matriculado com sucesso!', 'success');
            setIsEnrolling(false);
            setSelectedCourse('');
        } catch (error) {
            console.error(error);
            addToast('Erro ao matricular.', 'error');
        }
    };

    const handleRevoke = async (enrollmentId: string) => {
        if (!confirm('Remover matrícula? O aluno perderá acesso.')) return;
        try {
            await deleteDoc(doc(db, 'users', selectedUser.id, 'enrollments', enrollmentId));
            addToast('Matrícula removida.', 'success');
        } catch (error) {
            console.error(error);
            addToast('Erro ao remover.', 'error');
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] grid md:grid-cols-12 gap-6">

            {/* Left Col: User List */}
            <div className={`md:col-span-4 lg:col-span-3 flex flex-col bg-white rounded-3xl border border-stone-100 overflow-hidden ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar aluno..."
                            className="w-full bg-white border border-stone-200 pl-10 pr-4 py-2 rounded-xl text-sm focus:border-gold focus:outline-none transition-colors"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredUsers.map(user => (
                        <button
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${selectedUser?.id === user.id ? 'bg-primary text-white shadow-md' : 'hover:bg-stone-50 text-stone-600'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedUser?.id === user.id ? 'bg-white/20' : 'bg-stone-100'}`}>
                                {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full rounded-full" /> : <User size={18} />}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold truncate">{user.displayName || 'Sem Nome'}</p>
                                <p className={`text-[10px] truncate ${selectedUser?.id === user.id ? 'text-white/60' : 'text-stone-400'}`}>{user.email}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Col: Enrollments */}
            <div className={`md:col-span-8 lg:col-span-9 flex flex-col ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
                {selectedUser ? (
                    <div className="bg-white rounded-3xl border border-stone-100 p-8 h-full flex flex-col">
                        <header className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedUser(null)} className="md:hidden p-2 -ml-2 text-stone-400"><X size={20} /></button>
                                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center overflow-hidden">
                                    {selectedUser.photoURL ? <img src={selectedUser.photoURL} alt="" className="w-full h-full" /> : <User size={32} className="text-stone-300" />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-serif text-primary">{selectedUser.displayName}</h2>
                                    <p className="text-stone-400 text-sm">{selectedUser.email}</p>
                                    <p className="text-[10px] uppercase tracking-widest text-primary/30 mt-1">UID: {selectedUser.id}</p>
                                </div>
                            </div>
                            <Button onClick={() => setIsEnrolling(true)} leftIcon={<Plus size={16} />} size="sm">
                                Nova Matrícula
                            </Button>
                        </header>

                        {isEnrolling && (
                            <div className="mb-8 bg-stone-50 p-6 rounded-2xl border border-stone-100 animate-in fade-in slide-in-from-top-2">
                                <h4 className="font-bold text-primary mb-4 text-sm uppercase tracking-wide">Selecionar Curso</h4>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <select
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none"
                                    >
                                        <option value="">Selecione um curso...</option>
                                        {courses?.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.title}</option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2">
                                        <Button onClick={handleEnroll} disabled={!selectedCourse}>Matricular</Button>
                                        <Button variant="ghost" onClick={() => setIsEnrolling(false)}>Cancelar</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 flex-1 overflow-y-auto">
                            <h4 className="font-bold text-primary flex items-center gap-2"><GraduationCap size={18} className="text-gold" /> Matrículas Ativas</h4>
                            {enrollments.length === 0 ? (
                                <p className="text-stone-400 text-sm italic py-4">Nenhuma matrícula encontrada.</p>
                            ) : (
                                enrollments.map(enrollment => {
                                    const course = courses?.find((c: any) => c.id === enrollment.courseId);
                                    return (
                                        <Card key={enrollment.id} className="p-4 flex items-center justify-between group hover:border-gold/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                {course?.image && <img src={course.image} className="w-12 h-12 rounded-lg object-cover bg-stone-100" />}
                                                <div>
                                                    <p className="font-bold text-primary">{course?.title || 'Curso Desconhecido'}</p>
                                                    <p className="text-xs text-stone-400">Matriculado em: {enrollment.enrolledAt?.toDate().toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wide">
                                                    {enrollment.status}
                                                </span>
                                                <button onClick={() => handleRevoke(enrollment.id)} className="p-2 text-stone-300 hover:text-red-500 transition-colors" title="Revogar acesso">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-stone-300 bg-stone-50/50 rounded-3xl border border-stone-100 border-dashed">
                        <User size={48} className="mb-4 opacity-20" />
                        <p>Selecione um aluno para gerenciar matrículas.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
