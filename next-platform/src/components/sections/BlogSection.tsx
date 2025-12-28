"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BlogPost {
    id: string | number;
    title: string;
    date: string;
    excerpt: string;
    image?: string;
}

interface BlogSectionProps {
    blogPosts: BlogPost[];
}

export default function BlogSection({ blogPosts }: BlogSectionProps) {
    const router = useRouter();

    return (
        <section className="py-24 md:py-48 bg-paper border-t border-primary/5 overflow-hidden">
            <div className="container mx-auto px-6 mb-20 flex justify-between items-end">
                <div>
                    <span className="text-accent font-bold uppercase tracking-[0.4em] text-[10px] mb-8 block">Arquivo de Sentidos</span>
                    <h2 className="font-serif text-5xl md:text-7xl text-primary leading-none">Diário Visual</h2>
                </div>
                <Link
                    href="/blog"
                    className="hidden md:flex items-center gap-3 text-primary font-bold text-[10px] tracking-[0.3em] uppercase hover:text-accent transition-soft"
                >
                    VER TODOS <ArrowRight size={14} />
                </Link>
            </div>

            <motion.div
                className="flex gap-10 overflow-x-auto pb-20 px-6 container mx-auto snap-x custom-scrollbar"
            >
                {blogPosts.map((post) => (
                    <motion.div
                        key={post.id}
                        whileHover={{ y: -15 }}
                        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                        className="min-w-[320px] md:min-w-[450px] snap-center cursor-pointer"
                        onClick={() => router.push(`/blog/${post.id}`)}
                    >
                        <div className="group bg-white p-12 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] border border-primary/5 h-full flex flex-col justify-between relative overflow-hidden transition-soft hover:shadow-[0_40px_80px_-20px_rgba(38,58,58,0.1)]">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-sage/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-soft" />

                            <div>
                                <span className="text-[9px] font-bold text-gold uppercase tracking-[0.3em] mb-8 block opacity-60">{post.date}</span>
                                <h3 className="font-serif text-4xl text-primary mb-6 leading-tight group-hover:text-accent transition-soft">{post.title}</h3>
                                <p className="text-primary/60 font-light leading-relaxed text-lg line-clamp-3">{post.excerpt}</p>
                            </div>

                            <div className="flex items-center justify-between mt-12">
                                <div className="flex items-center gap-2 text-primary/30 group-hover:text-accent transition-soft" onClick={(e) => { e.stopPropagation(); /* handle save */ }}>
                                    <Heart size={18} className="fill-current" />
                                    <span className="text-[10px] font-bold tracking-widest">GUARDAR</span>
                                </div>
                                <ArrowRight size={20} className="text-primary/20 group-hover:text-primary group-hover:translate-x-2 transition-soft" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
