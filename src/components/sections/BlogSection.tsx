"use client";

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '../ui/Skeleton';
import { Card, CardContent } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';

interface BlogPost {
    id: string | number;
    title: string;
    date: string;
    excerpt: string;
    image?: string;
    type?: string;
    category?: string;
}

interface BlogSectionProps {
    blogPosts: BlogPost[];
    onSelectPost: (post: BlogPost) => void;
    loading?: boolean;
}

const getDynamicStyle = (title: string, index: number) => {
    const gradients = [
        'bg-gradient-to-br from-amber-100 to-orange-50 text-amber-900',
        'bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-900',
        'bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-900',
        'bg-gradient-to-br from-rose-100 to-pink-50 text-rose-900',
        'bg-gradient-to-br from-violet-100 to-purple-50 text-violet-900',
        'bg-gradient-to-br from-cyan-100 to-sky-50 text-cyan-900',
        'bg-gradient-to-br from-fuchsia-100 to-pink-50 text-fuchsia-900',
        'bg-gradient-to-br from-lime-100 to-green-50 text-lime-900',
    ];
    // Use title + index to ensure consistent distribution but unique feel
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index;
    return gradients[hash % gradients.length];
};

export default function BlogSection({ blogPosts = [], onSelectPost, loading = false }: BlogSectionProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    return (
        <section id="blog" className="py-12 md:py-16 bg-white border-t border-stone-100 overflow-hidden transition-colors duration-500">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-xl">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block">Reflexões & Saberes</span>
                        <h2 className="heading-section text-primary">Blog Figura Viva</h2>
                        <p className="text-lg text-text/60 mt-4">
                            Artigos, ensaios e pílulas de awareness sobre a clínica, a vida e o encontro.
                        </p>
                    </div>
                </div>

                <div ref={scrollContainerRef} className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-6 md:gap-12 pb-8 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
                    {loading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i}>
                                <Skeleton className="aspect-[16/10] rounded-2xl mb-8 w-full" />
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <Skeleton className="h-3 w-1/4 rounded" />
                                        <Skeleton className="h-3 w-1/5 rounded" />
                                    </div>
                                    <Skeleton className="h-8 w-3/4 rounded" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full rounded" />
                                        <Skeleton className="h-4 w-2/3 rounded" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                            {blogPosts.map((post, index) => {
                                const isPdf = post.type === 'library' || post.category === 'Biblioteca' || !post.image;
                                const dynamicStyle = getDynamicStyle(post.title, index);

                                return (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="snap-center sm:w-[350px] md:w-auto w-[85vw] flex-shrink-0 h-full"
                                    >
                                        <div
                                            onClick={() => onSelectPost(post)}
                                            className="group block h-full cursor-pointer"
                                        >
                                            {isPdf ? (
                                                <Card className="rounded-[2rem] overflow-hidden group h-full flex flex-col border border-stone-100 shadow-lg hover:shadow-2xl transition-all duration-300">
                                                    <div className={`h-64 ${dynamicStyle} flex items-center justify-center relative overflow-hidden p-8 shrink-0`}>
                                                        <span className="absolute top-6 left-6 z-10 px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded bg-white/50 backdrop-blur-sm shadow-sm opacity-70">
                                                            {post.category || 'Biblioteca'}
                                                        </span>

                                                        {/* Decorative Background Letters */}
                                                        <div className="absolute -right-4 -bottom-8 opacity-10 font-serif text-[10rem] leading-none select-none pointer-events-none truncate max-w-full">
                                                            {post.title.charAt(0)}
                                                        </div>

                                                        {/* Main Typography */}
                                                        <div className="relative z-10 w-full text-center">
                                                            <h3 className="font-serif text-3xl md:text-4xl leading-tight font-bold mix-blend-overlay opacity-90 break-words line-clamp-3">
                                                                {post.title}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-8 flex flex-col flex-1">
                                                        <div className="flex items-center gap-2 text-text/40 text-[10px] font-bold uppercase tracking-widest mb-4">
                                                            <FileText size={14} /> {post.category || 'Biblioteca'}
                                                        </div>
                                                        <h4 className="font-serif text-2xl text-primary leading-tight mb-4 group-hover:text-gold transition-colors line-clamp-2 min-h-[3.5rem]">
                                                            {post.title}
                                                        </h4>
                                                        <p className="text-sm text-text/60 mb-8 leading-relaxed line-clamp-3">
                                                            {post.excerpt || "Clique para acessar este conteúdo."}
                                                        </p>
                                                        <span className="mt-auto text-primary font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:text-gold transition-colors">
                                                            Acessar Conteúdo <ArrowRight size={14} />
                                                        </span>
                                                    </CardContent>
                                                </Card>
                                            ) : (
                                                <Card className="h-full border border-stone-200/60 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-0 overflow-hidden rounded-2xl bg-white flex flex-col">
                                                    <div className="relative mb-6 overflow-hidden aspect-[16/10] bg-paper border-b border-stone-100 shrink-0">
                                                        <Image
                                                            src={post.image || `https://source.unsplash.com/random/800x600?nature,sig=${index}`}
                                                            alt={post.title}
                                                            fill
                                                            sizes="(max-width: 768px) 100vw, 33vw"
                                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                                            <span className="bg-white/90 backdrop-blur px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-primary">
                                                                Ler Artigo
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-6 pt-0 flex flex-col flex-1">
                                                        <div className="space-y-4 flex flex-col flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-bold tracking-widest uppercase text-gold">
                                                                    {post.category || 'Gestalt-Terapia'}
                                                                </span>
                                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                                <span className="text-[10px] font-bold tracking-widest uppercase text-text/40">
                                                                    {post.date}
                                                                </span>
                                                            </div>
                                                            <h3 className="font-serif text-2xl text-primary leading-snug group-hover:text-gold transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">
                                                                {post.title}
                                                            </h3>
                                                            <p className="text-sm text-text/60 line-clamp-3 leading-relaxed mb-4 flex-1">
                                                                {post.excerpt}
                                                            </p>
                                                            <div className="pt-2 flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest group-hover:gap-3 transition-all mt-auto">
                                                                Continuar Lendo <ArrowUpRight size={12} />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {blogPosts.length === 0 && (
                                <div className="col-span-full">
                                    <EmptyState
                                        icon={<FileText size={32} />}
                                        title="Nenhum artigo encontrado"
                                        description="Nossa biblioteca está sendo atualizada. Volte em breve para novas reflexões."
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Scroll Controls (Desktop/Mobile) - Consistent Style */}
                <div className="flex items-center justify-center gap-6 mt-6 opacity-70 hover:opacity-100 transition-opacity md:hidden">
                    <button
                        onClick={() => {
                            if (scrollContainerRef.current) {
                                scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                            }
                        }}
                        className="p-3 rounded-full hover:bg-stone-100 text-stone-400 hover:text-primary transition-colors border border-transparent hover:border-stone-200"
                        aria-label="Scroll Left"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="w-32 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary/30 rounded-full"
                            animate={{ x: ['-100%', '0%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        />
                    </div>

                    <button
                        onClick={() => {
                            if (scrollContainerRef.current) {
                                scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                            }
                        }}
                        className="p-3 rounded-full hover:bg-stone-100 text-stone-400 hover:text-primary transition-colors border border-transparent hover:border-stone-200"
                        aria-label="Scroll Right"
                    >
                        <ArrowRight size={24} />
                    </button>
                </div>
            </div>
        </section>
    );
}
