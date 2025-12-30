import { Suspense } from 'react';
import HomeClient from '../components/HomeClient';
import { getCourses, getBlogPosts, getGallery } from '../services/serverData';

// export const revalidate = 3600; // Revalidar a cada 1 hora (ISR)
export const dynamic = 'force-dynamic'; // Forçar renderização dinâmica para debug e consistência imediata

export default async function Home() {
    // Fetch data in parallel
    const [courses, blogPosts, gallery] = await Promise.all([
        getCourses(),
        getBlogPosts(),
        getGallery()
    ]);

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                    <p className="text-primary/60 font-serif animate-pulse">Carregando o campo...</p>
                </div>
            </div>
        }>
            <HomeClient
                courses={courses}
                blogPosts={blogPosts}
                gallery={gallery}
            />
        </Suspense>
    );
}
