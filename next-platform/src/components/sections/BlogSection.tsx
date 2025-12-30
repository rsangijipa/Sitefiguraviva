"use client";

import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '../ui/Skeleton';
import { Card, CardContent } from '../ui/Card';
import EmptyState from '../ui/EmptyState';

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

export default function BlogSection({ blogPosts = [], onSelectPost, loading = false }: BlogSectionProps) {
    return (
        <section id="blog" className="py-16 md:py-24 bg-white border-t border-stone-100">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-xl">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block">Reflexões & Saberes</span>
                        <h2 className="heading-section">Blog Figura Viva</h2>
                        <p className="text-lg text-text/60 mt-4">
                            Artigos, ensaios e pílulas de awareness sobre a clínica, a vida e o encontro.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
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
                            {blogPosts.filter(post => post.type === 'library').map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="rounded-[2rem] overflow-hidden group h-full flex flex-col border-gray-100 hover:border-gold/30 cursor-pointer" onClick={() => onSelectPost(post)}>
                                        <div className={`h-64 ${index % 2 === 0 ? 'bg-paper/50' : 'bg-accent/5'} flex items-center justify-center relative overflow-hidden p-8 shrink-0`}>
                                            <span className="absolute top-6 left-6 z-10 px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded bg-white shadow-sm text-primary">
                                                Biblioteca
                                            </span>
                                            <div className={`text-primary/10 font-serif text-8xl absolute -right-4 -bottom-4 select-none group-hover:text-gold/10 transition-colors`}>
                                                {post.title.substring(0, 4).toUpperCase()}
                                            </div>
                                            <h3 className={`font-serif text-6xl ${index % 2 === 0 ? 'text-gold' : 'text-accent'} group-hover:scale-105 transition-transform duration-700 select-none`}>
                                                {post.title.substring(0, 4).toUpperCase()}
                                            </h3>
                                        </div>
                                        <CardContent className="p-8 flex flex-col flex-1">
                                            <div className="flex items-center gap-2 text-text/40 text-[10px] font-bold uppercase tracking-widest mb-4">
                                                <FileText size={14} /> {post.category || 'Artigo Técnico'}
                                            </div>
                                            <h4 className="font-serif text-2xl text-primary leading-tight mb-4 group-hover:text-gold transition-colors">
                                                {post.title}
                                            </h4>
                                            <p className="text-sm text-text/60 mb-8 leading-relaxed line-clamp-3">
                                                {post.excerpt || "Clique para ler o artigo completo extraído do arquivo PDF original."}
                                            </p>
                                            <span
                                                className="mt-auto text-primary font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:text-gold transition-colors"
                                            >
                                                Ler Artigo <ArrowRight size={14} />
                                            </span>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}

                            {blogPosts.filter(post => post.type === 'blog' || !post.type).map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div onClick={() => onSelectPost(post)} className="group block h-full cursor-pointer">
                                        <Card className="h-full border-transparent shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-0 overflow-hidden rounded-2xl bg-transparent hover:bg-white group-hover:border-gray-100/50">
                                            <div className="relative mb-6 overflow-hidden aspect-[16/10] bg-paper rounded-2xl">
                                                <Image
                                                    src={post.image || `https://images.unsplash.com/photo-${1550000000000 + index}?auto=format&fit=crop&q=80&w=800`}
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
                                            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-bold tracking-widest uppercase text-gold">
                                                            {post.category || 'Gestalt-Terapia'}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                        <span className="text-[10px] font-bold tracking-widest uppercase text-text/40">
                                                            {post.date}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-serif text-2xl text-primary leading-snug group-hover:text-gold transition-colors duration-300">
                                                        {post.title}
                                                    </h3>
                                                    <p className="text-sm text-text/60 line-clamp-2 leading-relaxed">
                                                        {post.excerpt}
                                                    </p>
                                                    <div className="pt-2 flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest group-hover:gap-3 transition-all">
                                                        Continuar Lendo <ArrowUpRight size={12} />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </motion.div>
                            ))}
                            {blogPosts.length === 0 && (
                                <div className="col-span-full">
                                    <EmptyState
                                        title="Nenhum artigo encontrado"
                                        message="Nossa biblioteca está sendo atualizada. Volte em breve para novas reflexões."
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
{
    blogPosts.length === 0 && (
        <div className="col-span-full">
            <EmptyState
                title="Nenhum artigo encontrado"
                message="Nossa biblioteca está sendo atualizada. Volte em breve para novas reflexões."
            />
        </div>
    )
}
                        </>
                    )}
                </div >
            </div >
        </section >
    );
}
