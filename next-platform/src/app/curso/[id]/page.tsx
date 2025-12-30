import { createClient } from '@/utils/supabase/server';
import { getMediatorDetails } from '@/data/mediators';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseDetailClient from './CourseDetailClient';
import { notFound } from 'next/navigation';

export default async function CourseDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch data on the server
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
