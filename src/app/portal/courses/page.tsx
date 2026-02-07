
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth, db } from '@/lib/firebase/admin';
import Link from 'next/link';
import { FieldPath } from 'firebase-admin/firestore';
import { BookOpen, Library } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase-admin/firestore';

// --- Reusable Course Card (Inline for now, extract later) ---
const CourseCard = ({ course, enrollment, isCatalog = false }: { course: any, enrollment?: any, isCatalog?: boolean }) => {
    const status = enrollment?.status || (isCatalog ? 'catalog' : 'pending');
    const isActive = status === 'active';
    const progress = enrollment?.progressSummary?.percent || 0;
    const lastAccess = enrollment?.lastAccessedAt?.toDate?.().toLocaleDateString();

    const getStatusChip = () => {
        switch (status) {
            case 'active': return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">Ativo</span>;
            case 'completed': return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full">Concluído</span>;
            case 'expired': return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded-full">Expirado</span>;
            case 'catalog': return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded-full">Disponível</span>;
            default: return <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-bold uppercase rounded-full">Pendente</span>;
        }
    };

    return (
        <div className="bg-white rounded-xl border border-stone-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full">
            {/* Cover Image */}
            <div className="h-40 bg-stone-200 relative overflow-hidden">
                {course.image ? (
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400"><BookOpen size={32} /></div>
                )}
                <div className="absolute top-3 left-3">{getStatusChip()}</div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-stone-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>

                {isActive ? (
                    <div className="mt-auto space-y-3">
                        {/* Progress Bar */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium text-stone-500">
                                <span>Progresso</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="flex items-center justify-between pt-3 border-t border-stone-50">
                            <span className="text-[10px] text-stone-400">Último acesso: {lastAccess || 'Nunca'}</span>
                        </div>

                        <Link
                            href={`/portal/course/${course.id}`}
                            className="block w-full py-2 bg-primary text-white text-center text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-stone-800 transition-colors mt-2"
                        >
                            Continuar
                        </Link>
                    </div>
                ) : (
                    <div className="mt-auto pt-4">
                        {isCatalog ? (
                            <p className="text-xs text-stone-500 line-clamp-2 mb-3">{course.description || 'Domine novas habilidades.'}</p>
                        ) : (
                            <p className="text-xs text-stone-500 italic">Acesso restrito ou pendente.</p>
                        )}

                        <Link
                            href={isCatalog ? `/curso/${course.slug || course.id}` : `/portal/course/${course.id}`}
                            className={cn(
                                "block w-full py-2 border text-center text-xs font-bold uppercase tracking-widest rounded-lg transition-colors mt-3",
                                isCatalog
                                    ? "border-primary text-primary hover:bg-primary hover:text-white"
                                    : "border-stone-200 text-stone-500 hover:bg-stone-50"
                            )}
                        >
                            {isCatalog ? 'Saiba Mais' : 'Ver Detalhes'}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default async function MyCoursesPage() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) redirect('/login');

    let uid;
    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        uid = decodedClaims.uid;
    } catch (error) { redirect('/login'); }

    // 1. Fetch User Enrollments
    const enrollmentsSnap = await db.collection('enrollments').where('userId', '==', uid).get();
    const enrollments = enrollmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Resolve Enrolled Courses
    let enrolledCourses: any[] = [];
    let enrolledCourseIds = new Set<string>();

    if (enrollments.length > 0) {
        const courseIds = enrollments.map((e: any) => e.courseId);
        enrolledCourseIds = new Set(courseIds);

        // Batch fetch (simplified for MVP)
        // Split into chunks of 10
        const chunks = [];
        for (let i = 0; i < courseIds.length; i += 10) {
            chunks.push(courseIds.slice(i, i + 10));
        }

        for (const chunk of chunks) {
            if (chunk.length > 0) {
                const snap = await db.collection('courses').where(FieldPath.documentId(), 'in', chunk).get();
                const chunkCourses = snap.docs.map(doc => {
                    const enrollment = enrollments.find((e: any) => e.courseId === doc.id);
                    return { id: doc.id, ...doc.data(), enrollment };
                });
                enrolledCourses.push(...chunkCourses);
            }
        }
    }

    // 3. Fetch Catalog (Published & Open, limit 10 for MVP)
    // Exclude enrolled? Ideally yes, but Firestore "not-in" has limits.
    // We will fetch widely and filter in memory for this page since catalog size is likely small (<100) for now.
    const catalogSnap = await db.collection('courses')
        .where('isPublished', '==', true)
        .where('status', '==', 'open')
        .limit(20)
        .get();

    const catalogCourses = catalogSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(c => !enrolledCourseIds.has(c.id));


    return (
        <div className="space-y-12 pb-12">

            {/* Section: My Enrollments */}
            <section className="space-y-6">
                <header className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div>
                        <h1 className="font-serif text-3xl text-stone-800 flex items-center gap-3">
                            <BookOpen className="text-primary" />
                            Meus Cursos
                        </h1>
                        <p className="text-stone-500 mt-1">Continue de onde parou.</p>
                    </div>
                </header>

                {enrolledCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {enrolledCourses.map(course => (
                            <CourseCard key={course.id} course={course} enrollment={course.enrollment} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-stone-50 border border-dashed border-stone-200 rounded-2xl p-8 text-center pt-16 pb-16">
                        <BookOpen size={48} className="mx-auto text-stone-300 mb-4" />
                        <h3 className="text-lg font-bold text-stone-700">Comece sua jornada</h3>
                        <p className="text-stone-500 mt-2">Você ainda não está matriculado em nenhum curso.</p>
                    </div>
                )}
            </section>

            {/* Section: Catalog */}
            {catalogCourses.length > 0 && (
                <section className="space-y-6">
                    <header className="flex items-center gap-3 border-b border-stone-100 pb-4">
                        <Library className="text-stone-400" />
                        <div>
                            <h2 className="font-serif text-2xl text-stone-800">Catálogo Disponível</h2>
                            <p className="text-stone-500 text-sm">Novos conhecimentos esperando por você.</p>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {catalogCourses.map(course => (
                            <CourseCard key={course.id} course={course} isCatalog={true} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
