
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth, db } from '@/lib/firebase/admin';
import { Card } from '@/components/ui/Card';
import { BookOpen, Calendar, ArrowRight, Clock, AlertCircle, Ban } from 'lucide-react';
import Link from 'next/link';
import { FieldPath } from 'firebase-admin/firestore';
import Button from '@/components/ui/Button'; // Assuming we have this, or use standard link styling
import { EmptyState } from '@/components/ui/EmptyState';

export default async function PortalDashboard() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
        redirect('/login');
    }

    let uid;
    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        uid = decodedClaims.uid;
    } catch (error) {
        redirect('/login');
    }

    // 1. Fetch User Enrollments (Server-side from Root Collection)
    const enrollmentsSnap = await db.collection('enrollments')
        .where('userId', '==', uid)
        .get();

    const enrollments = enrollmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let enrolledCourses: any[] = [];

    if (enrollments.length > 0) {
        // 2. Fetch Course Details
        const courseIds = enrollments.map((e: any) => e.courseId);

        // Chunking for Firestore 'in' query limit (10)
        const chunks = [];
        const chunkSize = 10;
        for (let i = 0; i < courseIds.length; i += chunkSize) {
            chunks.push(courseIds.slice(i, i + chunkSize));
        }

        const coursesData = [];
        const coursePromises = chunks.map(chunk =>
            db.collection('courses').where(FieldPath.documentId(), 'in', chunk).get()
        );

        const courseSnapshots = await Promise.all(coursePromises);

        for (const snap of courseSnapshots) {
            coursesData.push(...snap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    subtitle: data.subtitle,
                    description: data.description,
                    image: data.image,
                };
            }));
        }

        // Merge
        const merged = coursesData.map(course => {
            const enrollment = enrollments.find((e: any) => e.courseId === course.id);
            return { ...course, enrollment };
        });

        // Sort by enrollment date
        enrolledCourses = merged.sort((a, b) => {
            const dateA = a.enrollment.enrolledAt?.toDate?.()?.getTime() || 0;
            const dateB = b.enrollment.enrolledAt?.toDate?.()?.getTime() || 0;
            return dateB - dateA; // Newest first
        });
    }

    // Helper to render Status Badge
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">Em Andamento</span>;
            case 'awaiting_approval':
            case 'pending_review': // Fallback legacy
                return <span className="bg-gold text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-1"><Clock size={10} /> Em Análise</span>;
            case 'rejected':
                return <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-1"><Ban size={10} /> Recusado</span>;
            case 'awaiting_payment':
                return <span className="bg-stone-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">Aguardando Pagamento</span>;
            case 'blocked':
            case 'canceled':
                return <span className="bg-stone-800 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">Inativo</span>;
            default:
                return <span className="bg-stone-300 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">Pendente</span>;
        }
    };

    return (
        <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
            <header className="mb-10 animate-fade-in-up">
                <h1 className="font-serif text-3xl text-primary">Meus Cursos</h1>
                <p className="text-stone-500 font-light text-sm">Acompanhe seu progresso e status de aprovação.</p>
            </header>

            {enrolledCourses.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {enrolledCourses.map((course, idx) => {
                        const status = course.enrollment?.status || 'pending';
                        const isInteractive = status === 'active' || status === 'awaiting_payment';
                        const targetLink = status === 'active' ? `/portal/course/${course.id}` :
                            status === 'awaiting_payment' ? `/inscricao/${course.id}` : '#';

                        return (
                            <div
                                key={course.id}
                                className="animate-fade-in-up"
                                style={{ animationDelay: `${idx * 0.1}s`, opacity: 0 }}
                            >
                                <Link
                                    href={targetLink}
                                    className={`block h-full ${!isInteractive ? 'cursor-default' : ''}`}
                                    onClick={!isInteractive ? (e) => e.preventDefault() : undefined}
                                >
                                    <Card variant="glass" className={`h-full group transition-all duration-500 overflow-hidden flex flex-col ${status === 'active' ? 'hover:border-gold/50 hover:shadow-glow-gold' : 'opacity-90 grayscale-[0.2]'}`}>

                                        {/* Image Header */}
                                        <div className="h-48 overflow-hidden relative bg-stone-100">
                                            {course.image ? (
                                                <img src={course.image} alt={course.title} className={`w-full h-full object-cover transition-transform duration-700 ${status === 'active' ? 'group-hover:scale-105' : ''}`} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-primary/10">
                                                    <BookOpen size={48} />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4">
                                                {renderStatusBadge(status)}
                                            </div>
                                        </div>

                                        {/* Content Body */}
                                        <div className="p-8 flex flex-col flex-1 relative">
                                            <h3 className="font-serif text-2xl text-primary mb-2 transition-colors line-clamp-2 leading-tight">
                                                {course.title}
                                            </h3>

                                            {/* Dynamic Status Content */}
                                            <div className="flex-1 mt-2">
                                                {status === 'awaiting_approval' || status === 'pending_review' ? (
                                                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 my-2">
                                                        <div className="flex items-start gap-2">
                                                            <Clock className="text-amber-500 mt-0.5 shrink-0" size={16} />
                                                            <div>
                                                                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">Pagamento Confirmado</p>
                                                                <p className="text-xs text-amber-700 leading-relaxed">
                                                                    Sua inscrição está sendo analisada pela nossa equipe. O acesso será liberado em até 24h úteis.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : status === 'rejected' ? (
                                                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 my-2">
                                                        <div className="flex items-start gap-2">
                                                            <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={16} />
                                                            <div>
                                                                <p className="text-xs font-bold text-red-800 uppercase tracking-wide mb-1">Inscrição Recusada</p>
                                                                <p className="text-xs text-red-700 leading-relaxed italic mb-3">
                                                                    "{course.enrollment?.rejectionReason || 'Não atende aos critérios.'}"
                                                                </p>
                                                                <Link href={`/inscricao/${course.id}?retry=true`} className="text-xs font-bold text-red-600 underline hover:text-red-800">
                                                                    Tentar Novamente
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : status === 'awaiting_payment' ? (
                                                    <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 my-2 text-center">
                                                        <p className="text-xs text-stone-500 mb-2">Finalize sua inscrição para acessar.</p>
                                                        <span className="text-xs font-bold text-primary underline">Ir para Pagamento</span>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-stone-500 font-light mb-6 line-clamp-3">
                                                        {course.description || course.subtitle}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between border-t border-stone-100 pt-6 mt-6">
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-primary/40 flex items-center gap-2">
                                                    <Calendar size={12} />
                                                    {course.enrollment?.enrolledAt?.toDate?.()?.toLocaleDateString() ?? 'Recentemente'}
                                                </div>

                                                {status === 'active' && (
                                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:translate-x-1 transition-transform">
                                                        Acessar <ArrowRight size={14} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <EmptyState
                    icon={<BookOpen size={32} />}
                    title="Nenhum curso encontrado"
                    description="Você ainda não está matriculado em nenhum curso. Entre em contato com a administração para liberar seu acesso."
                    action={
                        <Link href="/" className="px-6 py-3 bg-white border border-stone-200 text-primary font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-stone-50 hover:border-gold/50 hover:text-gold transition-all shadow-sm">
                            Explorar Cursos Disponíveis
                        </Link>
                    }
                />
            )}
        </main>
    );
}
