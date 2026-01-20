"use client";

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { BookOpen, Calendar, ArrowLeft, Loader2, Lock, FileText, Download, PlayCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CourseViewer() {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // State
    const [course, setCourse] = useState<any>(null);
    const [materials, setMaterials] = useState<any[]>([]);
    const [enrollment, setEnrollment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!user || !id) return;
            setLoading(true);

            try {
                // 1. Check Enrollment
                // We query users/{uid}/enrollments where courseId == id
                // Alternatively, if we store the docId as courseId, we can just getDoc.
                // In Dashboard we added doc with random ID but field courseId. So we MUST query.
                const enrollmentQ = query(
                    collection(db, 'users', user.uid, 'enrollments'),
                    where('courseId', '==', id)
                );

                const enrollmentSnap = await getDocs(enrollmentQ);

                if (enrollmentSnap.empty && !user.uid /* TODO: Allow admin bypass */) {
                    setAccessDenied(true);
                    setLoading(false);
                    return;
                }

                // Allow admin to bypass enrollment check logic if needed via claims, 
                // but for now let's enforce enrollment presence or handle "Admin View" separately.
                // Actually, let's allow if admin via claims?
                // For now strict enrollment check.
                if (enrollmentSnap.empty) {
                    // Check if admin?
                    // const token = await user.getIdTokenResult();
                    // if (!token.claims.admin) { ... }
                    // For simplicity, strict check for now.
                    setAccessDenied(true);
                    setLoading(false);
                    return;
                }

                setEnrollment(enrollmentSnap.docs[0].data());

                // 2. Fetch Course Details
                const courseDoc = await getDoc(doc(db, 'courses', id as string));
                if (!courseDoc.exists()) {
                    // Course error
                    return;
                }
                setCourse({ id: courseDoc.id, ...courseDoc.data() });

                // 3. Fetch Materials (Subcollection)
                // Security Rules should allow this because of enrollment.
                const materialsQ = query(collection(db, 'courses', id as string, 'materials'), orderBy('created_at', 'desc'));
                const materialsSnap = await getDocs(materialsQ);
                setMaterials(materialsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

            } catch (error) {
                console.error("Error fetching course data:", error);
                // Likely Permission Denied if rules are working and user not enrolled
                if (error.code === 'permission-denied') {
                    setAccessDenied(true);
                }
            } finally {
                setLoading(false);
            }
        };

        if (user && id) {
            fetchCourseData();
        } else if (!authLoading && !user) {
            setLoading(false); // No user
        }
    }, [user, id, authLoading]);


    if (authLoading || (loading && user && !accessDenied)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCF9]">
                <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
            </div>
        );
    }

    if (!user) {
        // Redirect or show login
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF9]">
                <Lock className="w-12 h-12 text-primary/20 mb-4" />
                <h2 className="text-xl font-serif text-primary">Acesso Restrito</h2>
                <Link href="/login" className="mt-4 text-xs font-bold uppercase tracking-widest text-gold hover:underline">Fazer Login</Link>
            </div>
        )
    }

    if (accessDenied) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF9] text-center p-6">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-300">
                    <Lock size={32} />
                </div>
                <h1 className="font-serif text-3xl text-primary mb-4">Acesso Negado</h1>
                <p className="text-stone-500 max-w-md mb-8">
                    Você não possui uma matrícula ativa para este curso. Entre em contato com a secretaria se acreditar que isso é um erro.
                </p>
                <Link href="/portal">
                    <Button leftIcon={<ArrowLeft size={16} />}>Voltar para Meus Cursos</Button>
                </Link>
            </div>
        );
    }

    if (!course) return null; // Should ideally show 404

    return (
        <div className="min-h-screen bg-[#FDFCF9] pb-20">
            {/* Hero */}
            <header className="bg-white border-b border-stone-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/95 mix-blend-multiply z-10" />
                <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${course.image})` }} />

                <div className="relative z-20 max-w-5xl mx-auto px-6 py-20 text-white">
                    <Link href="/portal" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 text-[10px] font-bold uppercase tracking-widest">
                        <ArrowLeft size={14} /> Voltar
                    </Link>
                    <h1 className="font-serif text-4xl md:text-6xl mb-4 leading-tight">{course.title}</h1>
                    <p className="text-lg md:text-xl text-white/80 font-light max-w-2xl leading-relaxed">{course.subtitle || course.description}</p>

                    <div className="flex flex-wrap gap-6 mt-12 text-[10px] font-bold uppercase tracking-widest text-white/60">
                        {enrollment && <span className="px-3 py-1 bg-white/10 rounded-full text-white border border-white/20">Matrícula Ativa</span>}
                        <span className="flex items-center gap-2"><Calendar size={14} /> {course.date}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-12">

                {/* Main Content */}
                <div className="md:col-span-2 space-y-12">
                    {/* Introduction */}
                    <section>
                        <h3 className="font-serif text-2xl text-primary mb-6">Sobre o Curso</h3>
                        <div className="prose prose-stone prose-sm max-w-none text-stone-600 leading-relaxed font-light">
                            {course.details?.intro?.split('\n').map((p: string, i: number) => <p key={i}>{p}</p>)}
                        </div>
                    </section>

                    {/* Materials Section */}
                    <section>
                        <h3 className="font-serif text-2xl text-primary mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center text-sm"><FileText size={16} /></span>
                            Materiais Didáticos
                        </h3>

                        <div className="space-y-4">
                            {materials.length > 0 ? materials.map(item => (
                                <div key={item.id} className="bg-white p-6 rounded-2xl border border-stone-100 flex items-center justify-between group hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-stone-50 text-stone-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-primary group-hover:text-gold transition-colors">{item.title}</h4>
                                            <p className="text-xs text-stone-400">{item.file_type?.toUpperCase() || 'PDF'} • {item.file_size || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <a
                                        href={item.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-gold hover:text-gold hover:bg-gold/5 transition-all"
                                        download
                                    >
                                        <Download size={18} />
                                    </a>
                                </div>
                            )) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-stone-100 border-dashed text-stone-400">
                                    <p>Nenhum material disponível no momento.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Info */}
                <aside className="space-y-8">
                    <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm sticky top-24">
                        <h4 className="font-bold text-xs uppercase tracking-widest text-primary/40 mb-6">Formato & Cronograma</h4>

                        {course.details?.format && (
                            <div className="mb-6">
                                <h5 className="font-bold text-primary text-sm mb-2">Formato</h5>
                                <p className="text-sm text-stone-500 whitespace-pre-line leading-relaxed">{course.details.format}</p>
                            </div>
                        )}

                        {course.details?.schedule && (
                            <div>
                                <h5 className="font-bold text-primary text-sm mb-2">Cronograma</h5>
                                <p className="text-sm text-stone-500 whitespace-pre-line leading-relaxed">{course.details.schedule}</p>
                            </div>
                        )}

                        {course.link && (
                            <div className="mt-8 pt-6 border-t border-stone-100">
                                <a
                                    href={course.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block w-full text-center bg-stone-50 text-stone-500 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-100 transition-colors"
                                >
                                    Link Original
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Mediators */}
                    {course.mediators?.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="font-bold text-xs uppercase tracking-widest text-primary/40">Equipe</h4>
                            {course.mediators.map((m: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100">
                                    <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden">
                                        {m.photo ? <img src={m.photo} className="w-full h-full object-cover" /> : null}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-primary">{m.name}</p>
                                        <p className="text-[10px] text-stone-400 line-clamp-1">{m.bio}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </aside>

            </main>
        </div>
    );
}
