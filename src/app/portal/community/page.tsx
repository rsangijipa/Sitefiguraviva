
import { auth, db } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Post } from '@/types/community';
import { PostCard } from '@/components/portal/community/PostCard';
import { MessageSquare, Search } from 'lucide-react';
import { Timestamp } from 'firebase-admin/firestore';
import Button from '@/components/ui/Button';
import { NewTopicButton } from '@/components/portal/community/NewTopicButton';

export default async function CommunityPage() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) redirect('/login');

    let uid;
    try { await auth.verifySessionCookie(sessionCookie, true); } catch { redirect('/login'); }

    // Fetch Posts (Removed orderBy to avoid index requirements)
    const postsSnap = await db.collection('posts')
        .limit(50) // Fetch a larger window to sort in memory
        .get();

    let posts: Post[] = postsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt,
        updatedAt: doc.data().updatedAt
    } as Post));

    // Sort in memory: Pinned first, then by date descending
    posts.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        const tA = (a.createdAt as any)?._seconds || 0;
        const tB = (b.createdAt as any)?._seconds || 0;
        return tB - tA;
    });

    // Mock Data if empty
    if (posts.length === 0) {
        posts = [
            {
                id: 'welcome',
                channel: 'announcements',
                title: 'Bem-vindo à Comunidade Figura Viva!',
                content: 'Este é o espaço para trocarmos experiências, dúvidas e evoluirmos juntos na jornada. Respeito e colaboração são a base.',
                author: { uid: 'admin', displayName: 'Equipe Figura Viva', role: 'admin' },
                likesCount: 124,
                commentsCount: 42,
                isPinned: true,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            },
            {
                id: 'thread-1',
                channel: 'general',
                title: 'Dúvida sobre a Aula 03: Proporção Áurea',
                content: 'Alguém conseguiu aplicar a regra no exercício prático de paisagem? Achei a explicação um pouco rápida nessa parte.',
                author: { uid: 'u1', displayName: 'Carlos Silva', role: 'student' },
                likesCount: 5,
                commentsCount: 2,
                createdAt: Timestamp.fromDate(new Date(Date.now() - 3600000 * 2)), // 2h ago
                updatedAt: Timestamp.now()
            },
            {
                id: 'thread-2',
                channel: 'projects',
                title: 'Meu projeto final do Módulo 1 (Feedback?)',
                content: 'Postei na galeria mas queria saber a opinião de vocês sobre a paleta de cores que escolhi.',
                author: { uid: 'u2', displayName: 'Ana Beatriz', role: 'student' },
                likesCount: 18,
                commentsCount: 7,
                createdAt: Timestamp.fromDate(new Date(Date.now() - 3600000 * 24)), // 1 day ago
                updatedAt: Timestamp.now()
            }
        ];
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in-up">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-800 mb-1">Comunidade</h1>
                    <p className="text-stone-500">Troque experiências e aprenda com outros alunos.</p>
                </div>


                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                        <input
                            placeholder="Buscar tópicos..."
                            className="pl-9 pr-4 py-2 rounded-lg border border-stone-200 bg-white text-sm focus:border-primary outline-none w-full md:w-64"
                        />
                    </div>
                    <NewTopicButton />
                </div>
            </header>


            {/* Channels / Tabs (Static for now) */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                <button className="px-4 py-1.5 rounded-full bg-stone-800 text-white text-sm font-medium whitespace-nowrap">Tudo</button>
                <button className="px-4 py-1.5 rounded-full bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm font-medium whitespace-nowrap">Anúncios</button>
                <button className="px-4 py-1.5 rounded-full bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm font-medium whitespace-nowrap">Geral</button>
                <button className="px-4 py-1.5 rounded-full bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm font-medium whitespace-nowrap">Dúvidas</button>
                <button className="px-4 py-1.5 rounded-full bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm font-medium whitespace-nowrap">Projetos</button>
            </div>

            {/* Feed */}
            <div className="space-y-4">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>

        </div>
    );
}
