import { db } from '@/lib/firebase/admin';
import { notFound } from 'next/navigation';
import BlogDetailClient from './BlogDetailClient';

async function BlogContent({ id }: { id: string }) {
    try {
        const docRef = db.collection('posts').doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            notFound();
        }

        const post = {
            id: docSnap.id,
            ...docSnap.data(),
            created_at: docSnap.data()?.created_at?.toDate().toISOString() || null,
            updated_at: docSnap.data()?.updated_at?.toDate().toISOString() || null
        };

        return <BlogDetailClient post={post} />;
    } catch (error) {
        console.error('❌ Blog Fetch Error:', error);
        notFound();
    }
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
