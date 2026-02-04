
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth, db } from '@/lib/firebase/admin';
import Link from 'next/link';
import { FieldPath } from 'firebase-admin/firestore';
import { BookOpen, Calendar, ArrowRight, Clock, AlertCircle, Ban, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Reusable Course Card (Inline for now, extract later) ---
const CourseCard = ({ course, enrollment }: { course: any, enrollment: any }) => {
    const status = enrollment?.status || 'pending';
    const isActive = status === 'active';
    const progress = enrollment?.progressSummary?.percent || 0; // Assuming sync worked
    const lastAccess = enrollment?.lastAccessedAt?.toDate?.().toLocaleDateString();

    const getStatusChip = () => {
        switch (status) {
            case 'active': return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">Ativo</span>;
            case 'completed': return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full">Concluído</span>;
            case 'expired': return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded-full">Expirado</span>;
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
                        <p className="text-xs text-stone-500 italic">Acesso restrito ou pendente.</p>
                        <Link
                            href={`/portal/course/${course.id}`}
                            className="block w-full py-2 border border-stone-200 text-stone-500 text-center text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-stone-50 transition-colors mt-3"
                        >
                            Ver Detalhes
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

    // Fetch Enrollments
    const enrollmentsSnap = await db.collection('enrollments').where('userId', '==', uid).get();
    const enrollments = enrollmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let courses = [];
    if (enrollments.length > 0) {
        const courseIds = enrollments.map((e: any) => e.courseId);
        // Simplified fetch for demo (chunking omitted for brevity, assume < 10 for now in this MVP step)
        // In prod, use the chunking logic from dashboard
        if (courseIds.length > 0) {
            const courseSnap = await db.collection('courses').where(FieldPath.documentId(), 'in', courseIds.slice(0, 10)).get();
            courses = courseSnap.docs.map(doc => {
                const enrollment = enrollments.find((e: any) => e.courseId === doc.id);
                return { id: doc.id, ...doc.data(), enrollment };
            });
        }
    }

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-3xl text-stone-800">Meus Cursos</h1>
                    <p className="text-stone-500 mt-1">Biblioteca de aprendizado</p>
                </div>
                {/* Search/Filter Placeholder */}
                <div className="hidden md:flex gap-3">
                    <input type="text" placeholder="Buscar curso..." className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-400" />
                    <select className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm outline-none text-stone-600">
                        <option>Todos</option>
                        <option>Ativos</option>
                        <option>Concluídos</option>
                    </select>
                </div>
            </header>

            {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map(course => (
                        <CourseCard key={course.id} course={course} enrollment={course.enrollment} />
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-stone-100 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                        <BookOpen size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-stone-800">Nenhum curso encontrado</h3>
                    <p className="text-stone-500 mt-2 max-w-md mx-auto">Você ainda não se inscreveu em nenhum curso. Explore nossa biblioteca para começar.</p>
                </div>
            )}
        </div>
    );
}
