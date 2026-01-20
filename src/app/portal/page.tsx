
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth, db } from '@/lib/firebase/admin';
import { Card } from '@/components/ui/Card';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { FieldPath } from 'firebase-admin/firestore';

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
        // .orderBy('enrolledAt', 'desc') // Checking if index exists or if field exists. Safe to fetch and sort in memory for now given low volume?
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
                    // slug: data.slug 
                };
            }));
        }

        // Merge
        const merged = coursesData.map(course => {
            const enrollment = enrollments.find((e: any) => e.courseId === course.id);
            // Serialize timestamps for cleaner passing to components if needed, or keeping as dates?
            // Next.js Server Components can render Date objects directly BUT it warns if passed to Client Components.
            // We are rendering mostly server side here, but let's be safe.
            return { ...course, enrollment };
        });

        // Sort by enrollment date
        enrolledCourses = merged.sort((a, b) => {
            const dateA = a.enrollment.enrolledAt.toDate().getTime();
            const dateB = b.enrollment.enrolledAt.toDate().getTime();
            return dateB - dateA;
        });
    }

    return (
        <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
            <header className="mb-10 animate-fade-in-up">
                <h1 className="font-serif text-3xl text-primary">Meus Cursos</h1>
                <p className="text-stone-500 font-light text-sm">Continue sua jornada de aprendizado.</p>
            </header>

            {enrolledCourses.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {enrolledCourses.map((course, idx) => (
                        <div
                            key={course.id}
                            className="animate-fade-in-up"
                            style={{ animationDelay: `${idx * 0.1}s`, opacity: 0 }}
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
                                                {course.enrollment?.enrolledAt?.toDate?.()?.toLocaleDateString() ?? 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:translate-x-1 transition-transform">
                                                Acessar <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-[3rem] border border-stone-100 shadow-sm animate-fade-in-up">
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
    );
}
