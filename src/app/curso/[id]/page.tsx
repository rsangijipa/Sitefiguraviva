import { Suspense } from 'react';
import { db } from '@/lib/firebase/admin';
import { notFound } from 'next/navigation';
import CourseDetailClient from './CourseDetailClient';

async function CourseContent({ id }: { id: string }) {
    try {
        console.log(`🔍 Buscando detalhes do curso ID: ${id}`);
        const docRef = db.collection('courses').doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            console.warn(`⚠️ Curso não encontrado no banco para o ID: ${id}`);
            notFound();
        }

        const course: any = {
            id: docSnap.id,
            ...docSnap.data(),
            created_at: docSnap.data()?.created_at?.toDate().toISOString() || null,
            updated_at: docSnap.data()?.updated_at?.toDate().toISOString() || null
        };

        console.log(`✅ Detalhes carregados para: ${course.title}`);
        return <CourseDetailClient course={course} />;
    } catch (error) {
        console.error('❌ Blog Fetch Error:', error);
        notFound();
    }
}

export default async function CourseDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                    <p className="text-primary/60 font-serif animate-pulse text-xs tracking-widest uppercase">Tecendo o Encontro...</p>
                </div>
            </div>
        }>
            <CourseContent id={id} />
        </Suspense>
    );
}
