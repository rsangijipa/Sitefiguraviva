"use client";

import { motion } from 'framer-motion';
import { X, Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import { Modal, ModalContent } from './ui/Modal';

interface BlogPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: any;
}

export default function BlogPostModal({ isOpen, onClose, post }: BlogPostModalProps) {
    if (!post) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent size="lg" className="bg-paper overflow-y-auto max-h-[90vh]">
                <div className="relative">
                    {/* Header Image */}
                    {post.image && (
                        <div className="h-64 md:h-80 w-full relative overflow-hidden">
                            <img
                                src={post.image}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-paper via-transparent to-transparent" />
                        </div>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-stone-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                        <X size={20} />
                    </button>

                    <div className="px-6 py-8 md:px-12 md:py-12 -mt-12 relative z-10">
                        <div className="max-w-3xl mx-auto">
                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gold mb-6">
                                <span className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-stone-100">
                                    <Tag size={12} /> {post.category || 'Gestalt-Terapia'}
                                </span>
                                <span className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-stone-100">
                                    <Calendar size={12} /> {post.date}
                                </span>
                                {post.author && (
                                    <span className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-stone-100">
                                        <User size={12} /> {post.author}
                                    </span>
                                )}
                            </div>

                            <h1 className="font-serif text-3xl md:text-5xl text-primary leading-tight mb-8">
                                {post.title}
                            </h1>

                            <div className="prose prose-stone max-w-none prose-lg">
                                <div
                                    className="text-primary/80 font-light leading-relaxed whitespace-pre-line text-lg"
                                    dangerouslySetInnerHTML={{ __html: post.content || post.excerpt }}
                                />
                            </div>

                            {/* Tags */}
                            {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                                <div className="mt-12 pt-8 border-t border-stone-100 flex flex-wrap gap-2">
                                    {post.tags.map((tag: string) => (
                                        <span key={tag} className="px-3 py-1 bg-white border border-stone-100 rounded text-[10px] uppercase font-bold text-stone-400">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Navigation back */}
                            <div className="mt-16 flex justify-center">
                                <button
                                    onClick={onClose}
                                    className="flex items-center gap-2 text-stone-400 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs"
                                >
                                    <ArrowLeft size={16} /> Voltar para o Blog
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </ModalContent>
        </Modal>
    );
}
