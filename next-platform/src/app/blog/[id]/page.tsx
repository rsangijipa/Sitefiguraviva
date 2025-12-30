import { createClient } from '@/utils/supabase/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogDetailClient from './BlogDetailClient';
import { notFound } from 'next/navigation';

export default async function BlogDetail({ params }: { params: { id: string } }) {
    const { id } = await params;

    const supabase = await createClient();

    const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (!post) {
        notFound();
    }

    return <BlogDetailClient post={post} />;
}
