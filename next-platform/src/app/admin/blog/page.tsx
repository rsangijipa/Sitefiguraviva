"use client";

import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Plus, Trash2, Edit, Save, X, FileText, Calendar, Type, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BlogManager() {
    const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost, loading } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [currentPost, setCurrentPost] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialForm = {
        title: '',
        date: new Date().toLocaleDateString('pt-BR'),
        excerpt: '',
        content: '',
        author: 'Richard Sangi',
        readingTime: '6 min'
    };
    const [formData, setFormData] = useState(initialForm);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (currentPost) {
                await updateBlogPost(currentPost.id, formData);
            } else {
                await addBlogPost(formData);
            }
            setIsEditing(false);
            setFormData(initialForm);
            setCurrentPost(null);
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Erro ao salvar postagem.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEdit = (post: any) => {
        setCurrentPost(post);
        setFormData({
            title: post.title || '',
            date: post.date || '',
            excerpt: post.excerpt || '',
            content: post.content || '',
            author: post.author || 'Richard Sangi',
            readingTime: post.readingTime || '6 min'
        });
        setIsEditing(true);
    };

    return (
        <div className="space-y-12">
            <header className="flex justify-between items-end">
                <div>
                    <h3 className="font-serif text-3xl mb-2">Diário Visual (Blog)</h3>
                    <p className="text-primary/40 text-sm max-w-lg">Publique artigos e reflexões sobre Gestalt-Terapia.</p>
                </div>
                <button
                    onClick={() => { setIsEditing(true); setCurrentPost(null); setFormData(initialForm); }}
                    className="bg-primary text-paper px-6 py-4 rounded-xl flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-all"
                >
                    <Plus size={16} /> Novo Artigo
                </button>
            </header>

            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white rounded-[2rem] shadow-xl border border-gold/20 overflow-hidden"
                    >
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-stone-50/50">
                            <h3 className="font-serif text-xl">{currentPost ? 'Editar Artigo' : 'Criar Novo Artigo'}</h3>
                            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 ml-2">Título do Artigo</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-primary font-serif text-2xl"
                                        placeholder="Título impactante..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 ml-2">
                                        <Calendar size={12} /> Data de Publicação
                                    </label>
                                    <input
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 ml-2">Tempo de Leitura</label>
                                    <input
                                        value={formData.readingTime}
                                        onChange={e => setFormData({ ...formData, readingTime: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                                        placeholder="Ex: 5 min"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 ml-2">Resumo (Excerpt)</label>
                                <textarea
                                    rows={3}
                                    value={formData.excerpt}
                                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all italic text-accent"
                                    placeholder="Um breve resumo para atrair leitores..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 ml-2">Conteúdo (HTML)</label>
                                <textarea
                                    required
                                    rows={12}
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all font-mono text-sm"
                                    placeholder="<p>Texto do seu artigo...</p>"
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:bg-gray-50 transition-colors">Cancelar</button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-primary text-paper px-8 py-4 rounded-xl flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-all shadow-lg disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    Salvar Artigo
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-gold" size={40} />
                </div>
            ) : (
                <div className="grid gap-6">
                    {blogPosts.map((post: any, idx: number) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white p-6 rounded-[2rem] border border-primary/5 hover:border-gold/20 shadow-sm transition-all flex items-center gap-8"
                        >
                            <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-gold shrink-0">
                                <FileText size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-serif text-xl text-primary mb-1">{post.title}</h4>
                                <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-primary/30">
                                    <span>{post.date}</span>
                                    <span>{post.readingTime}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => startEdit(post)} className="p-3 rounded-xl hover:bg-stone-50 text-primary/40 hover:text-primary transition-colors">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => { if (confirm('Excluir este artigo?')) deleteBlogPost(post.id) }} className="p-3 rounded-xl hover:bg-red-50 text-red-100 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
