"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Share2, Heart } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function BlogDetail() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (data) setPost(data);
            } catch (err) {
                console.error("Error fetching post:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-paper flex items-center justify-center font-serif text-3xl">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!post) return (
        <div className="min-h-screen bg-paper flex flex-col items-center justify-center gap-6">
            <h1 className="font-serif text-3xl">Artigo não encontrado.</h1>
            <button onClick={() => router.push('/#diario')} className="text-accent underline uppercase tracking-widest text-xs font-bold">Voltar ao Diário</button>
        </div>
    );

    return (
        <div className="bg-paper min-h-screen">
            <Navbar />
            <main className="pt-40 pb-20">
                <article className="container mx-auto px-6 max-w-4xl">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-[10px] mb-12 hover:translate-x-[-5px] transition-transform">
                        <ArrowLeft size={14} /> Voltar ao Diário
                    </button>

                    <header className="mb-16">
                        <span className="text-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-6 block">{post.date}</span>
                        <h1 className="font-serif text-5xl md:text-7xl text-primary leading-[1.1] mb-10">{post.title}</h1>

                        <div className="flex items-center justify-between border-y border-primary/5 py-6">
                            <div className="flex items-center gap-6 text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <Clock size={14} /> {post.readingTime || '6 min'} de leitura
                                </div>
                                <span>Por {post.author || 'Richard Sangi'}</span>
                            </div>
                            <div className="flex items-center gap-4 text-primary/30">
                                <button className="hover:text-gold transition-colors"><Heart size={20} /></button>
                                <button className="hover:text-gold transition-colors"><Share2 size={20} /></button>
                            </div>
                        </div>
                    </header>

                    <div className="prose prose-xl prose-stone max-w-none font-light text-primary/80 leading-relaxed space-y-8">
                        {post.excerpt && (
                            <p className="text-2xl font-serif italic text-accent leading-relaxed">
                                "{post.excerpt}"
                            </p>
                        )}

                        <div dangerouslySetInnerHTML={{
                            __html: post.content || `
                            <p>A Gestalt-Terapia nos convida a uma postura de curiosidade radical. Não se trata de explicar o fenômeno, mas de habitá-lo.
                            Quando removemos as camadas de interpretação pré-concebida, o que resta é o encontro puro, a fronteira de contato onde o 'eu' e o 'outro' se co-constroem.</p>
                            
                            <div class="bg-primary/5 p-12 rounded-[2.5rem] border border-primary/5 my-16">
                                <h3 class="font-serif text-3xl text-primary mb-6">O Conceito de Fronteira</h3>
                                <p>É nesta zona de tensão que a vida acontece. Nem totalmente fundidos, nem totalmente isolados.
                                A saúde mental, nesta perspectiva, é a fluidez desta fronteira – a capacidade de trocar com o ambiente sem perder a própria integridade.</p>
                            </div>
                            
                            <p>Continuar este estudo exige uma disposição para o desaponto – o desaponto das certezas.
                            Somente no vazio fértil é que o novo pode emergir.</p>
                        ` }} />
                    </div>

                    <footer className="mt-24 pt-12 border-t border-primary/5">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-stone-100 overflow-hidden border border-stone-200">
                                <img src={post.authorImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facepad&focus=top&q=80&w=256&h=256"} alt="Author" />
                            </div>
                            <div>
                                <h4 className="font-bold text-primary">{post.author || 'Richard Sangi'}</h4>
                                <p className="text-xs text-accent uppercase tracking-widest font-bold">Psicoterapeuta & Diretor do Figura Viva</p>
                            </div>
                        </div>
                    </footer>
                </article>
            </main>
            <Footer />
        </div>
    );
}
