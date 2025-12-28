"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { blogService } from '../../../services/blogService';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Share2, Heart, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function BlogDetail() {
    const params = useParams(); // { slug: string }
    const router = useRouter();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params?.slug) return;
        const fetchPost = async () => {
            setLoading(true);
            const data = await blogService.getBySlug(params.slug);
            setPost(data);
            setLoading(false);
        };
        fetchPost();
    }, [params]);

    if (loading) {
        return (
            <div className="min-h-screen bg-paper flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-paper flex flex-col items-center justify-center font-serif text-3xl">
                <p>Post não encontrado.</p>
                <Link href="/" className="text-sm font-sans mt-4 text-accent hover:underline">Voltar para Home</Link>
            </div>
        );
    }

    return (
        <div className="bg-paper min-h-screen pb-32">
            {/* Breadcrumbs */}
            <div className="container mx-auto px-6 py-6 border-b border-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/40">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight size={12} />
                    <span className="text-gold">Diário Visual</span>
                </div>

                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-primary/40 font-bold uppercase tracking-widest text-[10px] hover:text-primary transition-colors"
                >
                    <ArrowLeft size={14} /> Voltar
                </button>
            </div>

            <article className="max-w-3xl mx-auto px-6 pt-20">
                <header className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-8"
                    >
                        <span className="flex items-center gap-2"><Calendar size={12} /> {post.date}</span>
                        <span className="flex items-center gap-2"><Clock size={12} /> 5 min de leitura</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-serif text-5xl md:text-7xl text-primary leading-tight mb-8 text-balance"
                    >
                        {post.title}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl px-1 md:px-12 text-primary/60 font-light italic"
                    >
                        {post.excerpt}
                    </motion.p>
                </header>

                <div className="w-full h-[400px] md:h-[500px] bg-gray-100 rounded-[3rem] overflow-hidden mb-20 shadow-xl">
                    <img
                        src={`https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=2000`}
                        alt="Blog Cover"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="prose prose-lg prose-p:font-light prose-headings:font-serif prose-headings:font-normal text-primary/80 mx-auto mb-20">
                    <p className="first-letter:text-5xl first-letter:font-serif first-letter:text-gold first-letter:mr-3 first-letter:float-left">
                        {post.content}
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                    <h3>A Fenomenologia na Prática</h3>
                    <p>
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
                        totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                    </p>
                </div>

                <div className="border-t border-primary/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-primary/10">
                            <img src="https://i.pravatar.cc/100?img=33" alt="Author" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="font-serif text-lg text-primary">Dra. Ana Silva</p>
                            <p className="text-[10px] uppercase tracking-widest text-primary/40">Gestalt-Terapeuta</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="w-12 h-12 rounded-full border border-primary/10 flex items-center justify-center hover:bg-gold hover:text-white transition-soft group">
                            <Heart size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                        <button className="w-12 h-12 rounded-full border border-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-soft group">
                            <Share2 size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </article>
        </div>
    );
}
