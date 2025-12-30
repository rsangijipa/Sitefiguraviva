"use client";

import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '@/context/ToastContext';
import { Plus, Trash2, Edit, Save, X, FileText, Calendar, Type, Loader2, Upload, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadFiles } from '../../../services/uploadServiceSupabase'; // Ensure this is imported

export default function BlogManager() {
    const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost, loading } = useApp();
    const { addToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [currentPost, setCurrentPost] = useState<any>(null);

    const initialForm = {
        title: '',
        date: new Date().toISOString().split('T')[0],
        excerpt: '',
        content: '',
        author: 'Richard Sangi',
        readingTime: '6 min',
        type: 'blog',
        pdf_url: ''
    };
    const [formData, setFormData] = useState(initialForm);
    const [uploading, setUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        // Validate PDF if type is library
        if (formData.type === 'library' && file.type !== 'application/pdf') {
            addToast('Por favor, envie um arquivo PDF.', 'error');
            return;
        }

        setUploading(true);
        try {
            // Use 'courses' bucket as established in other components, or 'public' if available. 
            // Using 'courses' for consistency with CourseManager/GalleryManager which work.
            const urls = await uploadFiles([file], 'courses');
            setFormData(prev => ({ ...prev, pdf_url: urls[0] }));
            addToast('Arquivo enviado com sucesso!', 'success');
        } catch (error) {
            console.error("Upload error:", error);
            addToast("Erro ao enviar arquivo.", 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const success = await addBlogPost(formData);
            if (success) {
                setFormData(initialForm);
                setIsEditing(false);
                addToast('Publicação salva com sucesso!', 'success');
            } else {
                addToast('Erro ao salvar publicação.', 'error');
            }
        } catch (error) {
            console.error("Error saving post:", error);
            addToast("Erro ao salvar publicação.", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h3 className="font-serif text-3xl mb-2 text-primary">Blog & Biblioteca</h3>
                    <p className="text-primary/40 text-sm max-w-lg">Gerencie artigos do blog e materiais da biblioteca (PDFs).</p>
                </div>
                <button
                    onClick={() => { setIsEditing(true); setFormData(initialForm); }}
                    className="bg-primary text-paper px-6 py-4 rounded-xl flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-soft hover:shadow-lg transform active:scale-95 shadow-xl"
                >
                    <Plus size={16} /> Nova Publicação
                </button>
            </header>

            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm"
                    >
                        <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-stone-50/50">
                                <div>
                                    <h3 className="font-serif text-2xl text-primary">Nova Publicação</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mt-1">Artigo ou Material</p>
                                </div>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} className="text-primary/40" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar bg-[#FDFCF9] space-y-6">
                                {/* Type Toggle */}
                                <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                                    <button type="button" onClick={() => setFormData({ ...formData, type: 'blog' })} className={`px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${formData.type === 'blog' ? 'bg-white text-primary shadow-sm' : 'text-primary/40 hover:text-primary'}`}>
                                        Post do Blog
                                    </button>
                                    <button type="button" onClick={() => setFormData({ ...formData, type: 'library' })} className={`px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${formData.type === 'library' ? 'bg-white text-primary shadow-sm' : 'text-primary/40 hover:text-primary'}`}>
                                        Material (PDF)
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Título</label>
                                    <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-primary font-serif text-lg" placeholder="Título do artigo ou documento" />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Data</label>
                                        <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm font-bold text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Autor</label>
                                        <input value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm text-primary" placeholder="Richard Sangi" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Resumo / Descrição</label>
                                    <textarea rows={3} value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm text-primary/80" placeholder="Breve introdução..." />
                                </div>

                                {formData.type === 'blog' ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Conteúdo (HTML/Markdown)</label>
                                            <textarea rows={10} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm text-primary/80 font-mono" placeholder="Inicie o texto..." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Tempo de Leitura</label>
                                            <input value={formData.readingTime} onChange={e => setFormData({ ...formData, readingTime: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm text-primary" placeholder="5 min" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2"><FileText size={12} /> Arquivo PDF</label>
                                        <div className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center relative group overflow-hidden hover:border-gold/50 transition-colors">
                                            {formData.pdf_url ? (
                                                <div className="text-center p-6">
                                                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3 text-green-500">
                                                        <FileText size={20} />
                                                    </div>
                                                    <p className="text-sm text-green-600 font-bold">PDF Anexado com Sucesso</p>
                                                    <p className="text-xs text-primary/30 mt-1 truncate max-w-xs">{formData.pdf_url}</p>
                                                </div>
                                            ) : (
                                                <div className="text-center p-6">
                                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-primary/20 group-hover:text-gold group-hover:scale-110 transition-all">
                                                        <Upload size={20} />
                                                    </div>
                                                    <p className="text-sm text-primary/40 font-bold">Upload do PDF</p>
                                                </div>
                                            )}
                                            <input type="file" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={uploading} />
                                            {uploading && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                                    <Loader2 size={32} className="animate-spin text-gold" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 flex justify-end gap-4">
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:bg-gray-50 transition-colors" disabled={isSubmitting}>Cancelar</button>
                                    <button type="submit" disabled={isSubmitting || (formData.type === 'library' && !formData.pdf_url)} className="bg-primary text-paper px-8 py-3 rounded-xl flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-soft shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                                        <Save size={16} /> {isSubmitting ? 'Salvando...' : 'Publicar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-6">
                {blogPosts.map((post: any, idx: number) => (
                    <motion.div
                        key={post.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white p-6 rounded-[2rem] border border-primary/5 hover:border-gold/30 shadow-sm hover:shadow-md transition-all flex items-center gap-8 group"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-primary/20 shrink-0">
                            {post.type === 'library' || post.pdf_url ? <FileText size={24} /> : <BookOpen size={24} />}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${post.type === 'library' ? 'bg-blue-50 text-blue-500' : 'bg-gold/10 text-gold'}`}>
                                    {post.type === 'library' ? 'Biblioteca' : 'Blog'}
                                </span>
                                <span className="text-xs text-primary/40">{post.date}</span>
                            </div>
                            <h4 className="font-serif text-xl text-primary">{post.title}</h4>
                            <p className="text-primary/60 text-sm line-clamp-1 mt-1">{post.excerpt}</p>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => { if (confirm('Excluir?')) deleteBlogPost(post.id) }} className="p-3 rounded-xl hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors" title="Excluir">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
