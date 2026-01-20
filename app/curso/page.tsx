import { db } from '@/lib/firebase/admin';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';

// Revalidate every hour
export const revalidate = 3600;

async function getCourses() {
    try {
        const coursesSnap = await db.collection('courses')
            .where('isPublished', '==', true)
            .orderBy('created_at', 'desc')
            .get();

        return coursesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date || 'Data a definir'
        }));
    } catch (error) {
        console.error("Error fetching courses:", error);
        return [];
    }
}

export default async function CoursesPage() {
    const courses = await getCourses();

    return (
        <div className="min-h-screen bg-[#FDFCF9] pb-20 pt-32">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <header className="mb-16 text-center">
                    <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4">Nossas Formações</h1>
                    <p className="text-stone-500 font-light max-w-2xl mx-auto text-lg">
                        Cursos, grupos de estudos e vivências em Gestalt-Terapia.
                    </p>
                </header>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <Link key={course.id} href={`/curso/${course.id}`} className="group block h-full">
                            <Card className="h-full border border-stone-100 hover:border-gold/50 transition-all duration-300 overflow-hidden flex flex-col">
                                <div className="h-64 overflow-hidden relative bg-stone-100">
                                    {course.image ? (
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-300 opacity-30">
                                            <BookOpen size={48} />
                                        </div>
                                    )}
                                    {course.enrollmentOpen && (
                                        <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                                            Matrículas Abertas
                                        </div>
                                    )}
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <h2 className="font-serif text-2xl text-primary mb-2 group-hover:text-gold transition-colors leading-tight">
                                        {course.title}
                                    </h2>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gold mb-4">
                                        {course.subtitle}
                                    </p>
                                    <p className="text-stone-500 font-light text-sm line-clamp-3 mb-6 flex-1">
                                        {course.description}
                                    </p>

                                    <div className="flex items-center justify-between border-t border-stone-100 pt-6 mt-auto">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-primary/40 flex items-center gap-2">
                                            <Calendar size={12} />
                                            {course.date}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:translate-x-1 transition-transform">
                                            Saiba Mais <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                {courses.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-stone-400 font-light">Nenhum curso disponível no momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
