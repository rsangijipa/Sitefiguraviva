"use client";

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, onSnapshot, getDocs, where, documentId } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { BookOpen, Calendar, ArrowRight, Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PortalDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch User Enrollments
    useEffect(() => {
        if (!user) {
            if (!authLoading) setLoading(false);
            return;
        }

        const q = query(collection(db, 'users', user.uid, 'enrollments'), orderBy('enrolledAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEnrollments(docs);
        });

        return () => unsubscribe();
    }, [user, authLoading]);

    // 2. Fetch Details for Enrolled Courses
    useEffect(() => {
        const fetchCourseDetails = async () => {
            if (enrollments.length === 0) {
                setEnrolledCourses([]);
                if (user) setLoading(false);
                return;
            }

            setLoading(true);
            const courseIds = enrollments.map(e => e.courseId);

            // Firesore 'in' query supports up to 10 items.
            // For production with >10 enrollments, we'd need to batch or fetch individually.
            // For now, let's just fetch all courses and filter client side or fetch individually if list is huge.
            // Actually, fetching individually in parallel is fine for this scale.

            try {
                // Optimized approach: Query by documentId IN [...] if <= 10
                const chunks = [];
                for (let i = 0; i < courseIds.length; i += 10) {
                    chunks.push(courseIds.slice(i, i + 10));
                }

                const coursesData = [];
                for (const chunk of chunks) {
                    const q = query(collection(db, 'courses'), where(documentId(), 'in', chunk));
                    const snap = await getDocs(q);
                    coursesData.push(...snap.docs.map(d => ({ id: d.id, ...d.data() })));
                }

                // Merge enrollment data (like status) with course data
                const merged = coursesData.map(course => {
                    const enrollment = enrollments.find(e => e.courseId === course.id);
                    return { ...course, enrollment };
                });

                setEnrolledCourses(merged);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };

        if (enrollments.length > 0) {
            fetchCourseDetails();
        }
    }, [enrollments]);

    if (authLoading || (loading && user)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCF9]">
                <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF9] p-6 text-center">
                <Lock className="w-16 h-16 text-primary/20 mb-6" />
                <h1 className="font-serif text-3xl text-primary mb-2">Área do Aluno</h1>
                <p className="text-stone-500 mb-8">Faça login para acessar seus cursos.</p>
                <Link href="/login" className="bg-primary text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gold transition-colors">
                    Fazer Login
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCF9] pb-20">
            {/* Header */}
            <header className="bg-white border-b border-stone-100 pt-24 pb-12 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4">Meus Cursos</h1>
                    <p className="text-stone-500 font-light max-w-2xl text-lg">
                        Bem-vindo(a), <strong className="font-bold text-primary">{user.displayName?.split(' ')[0]}</strong>. Aqui está sua jornada de aprendizado.
                    </p>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
                {enrolledCourses.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {enrolledCourses.map((course, idx) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Link href={`/portal/course/${course.id}`} className="block h-full">
                                    <Card className="h-full group hover:border-gold/50 transition-all duration-300 overflow-hidden flex flex-col">
                                        <div className="h-48 overflow-hidden relative bg-stone-100">
                                            {course.image ? (
                                                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-primary/10">
                                                    <BookOpen size={48} />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm ${course.enrollment?.status === 'active' ? 'bg-green-500 text-white' : 'bg-stone-500 text-white'}`}>
                                                    {course.enrollment?.status === 'active' ? 'Em Andamento' : 'Concluído'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-8 flex flex-col flex-1">
                                            <h3 className="font-serif text-2xl text-primary mb-2 group-hover:text-gold transition-colors line-clamp-2">
                                                {course.title}
                                            </h3>
                                            <p className="text-sm text-stone-500 font-light mb-6 line-clamp-3 flex-1">
                                                {course.description || course.subtitle}
                                            </p>

                                            <div className="flex items-center justify-between border-t border-stone-100 pt-6 mt-auto">
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-primary/40 flex items-center gap-2">
                                                    <Calendar size={12} />
                                                    {course.enrollment?.enrolledAt?.toDate().toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:translate-x-1 transition-transform">
                                                    Acessar <ArrowRight size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-stone-100 shadow-sm">
                        <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
                            <BookOpen size={40} />
                        </div>
                        <h3 className="font-serif text-2xl text-primary mb-2">Nenhum curso encontrado</h3>
                        <p className="text-stone-400 max-w-md mx-auto mb-8">Você ainda não está matriculado em nenhum curso.</p>
                        <Link href="/" className="text-primary font-bold uppercase tracking-widest text-xs border-b border-gold pb-1 hover:text-gold transition-colors">
                            Explorar Cursos Disponíveis
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
