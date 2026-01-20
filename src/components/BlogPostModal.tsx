"use client";

import { motion } from 'framer-motion';
import { X, Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import { Modal, ModalContent, ModalBody } from './ui/Modal';

interface BlogPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: any;
}

export default function BlogPostModal({ isOpen, onClose, post }: BlogPostModalProps) {
    if (!post) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent size="lg" className="bg-paper p-0">
                <div className="relative h-full flex flex-col">
                    {/* Close Button - Premium Style */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-50 group flex items-center gap-2 bg-white/80 backdrop-blur border border-stone-200 pl-3 pr-2 py-2 rounded-full text-primary hover:bg-gold hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary shadow-sm hover:translate-y-[-1px]"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap">
                            Fechar
                        </span>
                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-stone-100 group-hover:bg-white/20 transition-colors">
                            <X size={14} />
                        </div>
                    </button>

                    <ModalBody className="p-0">
                        <div className="relative">
                            {/* Header Image */}

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
                                            {(Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? post.tags.split(',') : [])).map((tag: string) => (
                                                <span key={tag} className="px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                    {tag}
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
                    </ModalBody>
                </div>
            </ModalContent>
        </Modal>
    );
}
