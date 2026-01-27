import { Suspense } from 'react';
import HomeClient from '../components/HomeClient';
import { db } from '@/lib/firebase/admin';

// Revalidate every hour
export const revalidate = 3600;

async function getHomeData() {
    try {
        // Parallel fetching
        const [coursesSnap, postsSnap, gallerySnap] = await Promise.all([
            db.collection('courses').where('isPublished', '==', true).get(),
            db.collection('posts').where('isPublished', '==', true).get(), // Get posts without order to avoid index
            db.collection('gallery').get() // Get gallery without order to avoid index
        ]);

        const courses = coursesSnap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                image: (data.image && data.image.trim() !== "") ? data.image : null,
                created_at: data.created_at?.toDate().toISOString() || null,
                updated_at: data.updated_at?.toDate().toISOString() || null
            };
        });

        const posts = postsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            created_at: doc.data().created_at?.toDate().toISOString() || null,
            updated_at: doc.data().updated_at?.toDate().toISOString() || null
        })).sort((a: any, b: any) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
        }).slice(0, 4);

        const gallery = gallerySnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            created_at: doc.data().created_at?.toDate().toISOString() || null,
            updated_at: doc.data().updated_at?.toDate().toISOString() || null
        })).sort((a: any, b: any) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
        }).slice(0, 12);

        return { courses, posts, gallery };
    } catch (error) {
        console.error("Error fetching home data:", error);
        return { courses: [], posts: [], gallery: [] };
    }
}

export default async function Home() {
    const data = await getHomeData();

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                    <p className="text-primary/60 font-serif animate-pulse">Carregando...</p>
                </div>
            </div>
        }>
            <HomeClient initialData={data} />
        </Suspense>
    );
}
