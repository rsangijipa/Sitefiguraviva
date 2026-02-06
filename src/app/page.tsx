import { Suspense } from 'react';
import HomeClient from '../components/HomeClient';
import { db } from '@/lib/firebase/admin';

// Revalidate every hour
export const revalidate = 3600;

async function getHomeData() {
    try {
        // Parallel fetching
        const [coursesSnap, postsSnap, gallerySnap] = await Promise.all([
            db.collection('courses').get(),
            db.collection('posts').where('isPublished', '==', true).get(), // Get posts without order to avoid index
            db.collection('gallery').get() // Get gallery without order to avoid index
        ]);

        const toISO = (val: any) => {
            if (!val) return null;
            if (typeof val.toDate === 'function') return val.toDate().toISOString();
            if (val instanceof Date) return val.toISOString();
            if (typeof val === 'string') return new Date(val).toISOString();
            return null;
        };

        const sanitize = (obj: any) => JSON.parse(JSON.stringify(obj));

        const rawCourses = coursesSnap.docs.map(doc => {
            const data = doc.data();
            return sanitize({
                id: doc.id,
                title: data.title || '',
                subtitle: data.subtitle || '',
                description: data.description || '',
                image: (data.image && data.image.trim() !== "") ? data.image : null,
                coverImage: data.coverImage || '',
                status: data.status || '',
                details: data.details || {},
                isPublished: data.isPublished === true,
                created_at: toISO(data.created_at),
                updated_at: toISO(data.updated_at)
            });
        });

        // Public availability: status=open OR legacy isPublished=true
        const courses = rawCourses.filter((c: any) => c?.status === 'open' || c?.isPublished === true);

        const posts = postsSnap.docs.map(doc => {
            const data = doc.data();
            return sanitize({
                id: doc.id,
                title: data.title || '',
                excerpt: data.excerpt || '',
                content: data.content || '',
                type: data.type || 'blog',
                image: data.image || '',
                created_at: toISO(data.created_at),
                updated_at: toISO(data.updated_at)
            });
        }).sort((a: any, b: any) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
        }).slice(0, 4);

        const gallery = gallerySnap.docs.map(doc => {
            const data = doc.data();
            return sanitize({
                id: doc.id,
                url: data.url || '',
                title: data.title || '',
                created_at: toISO(data.created_at),
                updated_at: toISO(data.updated_at)
            });
        }).sort((a: any, b: any) => {
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
