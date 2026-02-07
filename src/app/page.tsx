import { Suspense } from 'react';
import HomeClient from '../components/HomeClient';
import { db } from '@/lib/firebase/admin';

// Revalidate every hour
export const revalidate = 3600;

async function getHomeData() {
    try {
        // Parallel fetching of all collections
        const [openCoursesSnap, publishedCoursesSnap, postsSnap, gallerySnap] = await Promise.all([
            db.collection('courses').where('status', '==', 'open').get(),
            db.collection('courses').where('isPublished', '==', true).get(),
            db.collection('posts').where('isPublished', '==', true).get(),
            db.collection('gallery').get()
        ]);

        const toISO = (val: any) => {
            if (!val) return null;
            if (typeof val.toDate === 'function') return val.toDate().toISOString();
            if (val instanceof Date) return val.toISOString();
            if (typeof val === 'string') return new Date(val).toISOString();
            return null;
        };

        const sanitize = (obj: any) => JSON.parse(JSON.stringify(obj));

        // Course Merge & Deduplication Strategy
        const coursesMap = new Map();
        [...openCoursesSnap.docs, ...publishedCoursesSnap.docs].forEach(doc => {
            if (!coursesMap.has(doc.id)) {
                const data = doc.data();
                coursesMap.set(doc.id, sanitize({
                    id: doc.id,
                    title: data.title || '',
                    subtitle: data.subtitle || '',
                    description: data.description || '',
                    image: (data.image && data.image.trim() !== "") ? data.image : null,
                    coverImage: data.coverImage || '',
                    status: data.status || '',
                    details: data.details || {},
                    isPublished: true,
                    created_at: toISO(data.created_at || data.createdAt),
                    updated_at: toISO(data.updated_at || data.updatedAt)
                }));
            }
        });

        const courses = Array.from(coursesMap.values()).sort((a: any, b: any) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
        });

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
