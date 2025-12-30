import { createClient } from '@/utils/supabase/server';
import { Suspense } from 'react';
import CourseDetailClient from './CourseDetailClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function CourseContent({ id }: { id: string }) {
    const supabase = await createClient();

    console.log(`🔍 Buscando detalhes do curso ID: ${id}`);

    const { data: course, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error('❌ Erro Supabase no detalhe:', error.message);
    }

    if (!course) {
        console.warn(`⚠️ Curso não encontrado no banco para o ID: ${id}`);
        notFound();
    }

    console.log(`✅ Detalhes carregados para: ${course.title}`);
    return <CourseDetailClient course={course} />;
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
