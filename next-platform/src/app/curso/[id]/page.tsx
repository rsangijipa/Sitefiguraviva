import { createClient } from '@/utils/supabase/server';
import { getMediatorDetails } from '@/data/mediators';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseDetailClient from './CourseDetailClient';
import { notFound } from 'next/navigation';

export default async function CourseDetail({ params }: { params: { id: string } }) {
    const { id } = await params;

    // Fetch data on the server
    const supabase = await createClient();

    // Try UUID first
    let { data: course, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    // If not found by ID, try if ID is actually a slug (if we ever add slugs)
    // Or if the ID passed was an old-style ID
    if (!course) {
        // Fallback or handle null
    }

    if (!course) {
        notFound();
    }

    return <CourseDetailClient course={course} />;
}
