import { createClient } from '@/utils/supabase/server';
import { Suspense } from 'react';
import BlogDetailClient from './BlogDetailClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function BlogContent({ id }: { id: string }) {
    const supabase = await createClient();

    const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error('❌ Blog Fetch Error:', error.message);
    }

    if (!post) {
        notFound();
    }

    return <BlogDetailClient post={post} />;
}

export default async function BlogDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                    <p className="text-primary/60 font-serif animate-pulse text-xs tracking-widest uppercase">Lendo o Diário...</p>
                </div>
            </div>
        }>
            <BlogContent id={id} />
        </Suspense>
    );
}
