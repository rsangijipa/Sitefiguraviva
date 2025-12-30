"use client";

import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Plus, Trash2, Edit, Save, X, Calendar, Link as LinkIcon, Image as ImageIcon, Upload, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadFiles } from '../../../services/uploadServiceSupabase';

export default function CoursesManager() {
    const { courses, addCourse, updateCourse, deleteCourse } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [currentCourse, setCurrentCourse] = useState(null);
    const initialForm = { title: '', date: '', status: 'Aberto', link: '', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000' };
    const [formData, setFormData] = useState(initialForm);
    const [uploading, setUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);

        setUploading(true);
        try {
            const urls = await uploadFiles(files, 'courses');
            setFormData({ ...formData, image: urls[0] });
        } catch (error) {
            console.error("Upload error:", error);
            alert("Erro ao enviar imagem.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (currentCourse) {
                await updateCourse(currentCourse.id, formData);
            } else {
                await addCourse(formData);
            }
            setIsEditing(false);
            setFormData(initialForm);
            setCurrentCourse(null);
        } catch (error) {
            console.error("Submit error:", error);
            alert("Erro ao salvar curso.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEdit = (course) => {
        setCurrentCourse(course);
        setFormData(course);
        setIsEditing(true);
    };

    return (
        <div className="space-y-12">
            <header className="flex justify-between items-end">
                <div>
                    <h3 className="font-serif text-3xl mb-2">Gestão de Cursos</h3>
                    <p className="text-primary/40 text-sm max-w-lg">Adicione e gerencie os cursos visíveis na seção "Instituto".</p>
                </div>
                <button
                    onClick={() => { setIsEditing(true); setCurrentCourse(null); setFormData(initialForm); }}
                    className="bg-primary text-paper px-6 py-4 rounded-xl flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-soft hover:shadow-lg transform active:scale-95"
                >
                    <Plus size={16} /> Novo Curso
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
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-serif text-xl">{currentCourse ? 'Editar Curso' : 'Criar Novo Curso'}</h3>
                            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 grid md:grid-cols-2 gap-8">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 ml-2">Título do Curso</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-primary font-serif text-lg"
                                    placeholder="Ex: Formação em Gestalt-Terapia"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 ml-2">
                                    <Calendar size={12} /> Data/Horário
                                </label>
                                <input
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                                    placeholder="Ex: Início Março/2024"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 ml-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all appearance-none"
                                >
                                    <option value="Aberto">Aberto (Verde)</option>
                                    <option value="Esgotado">Esgotado (Vermelho)</option>
                                    <option value="Encerrado">Encerrado (Cinza)</option>
                                </select>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 ml-2">
                                    <LinkIcon size={12} /> Link Externo (Sympla/Form)
                                </label>
                                <input
                                    value={formData.link}
                                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm font-mono text-primary/80"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 ml-2">
                                    <ImageIcon size={12} /> Imagem do Curso
                                </label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        value={formData.image}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm font-mono text-primary/80"
                                        placeholder="URL da Imagem..."
                                    />
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                        />
                                        <button
                                            type="button"
                                            className="bg-paper border border-primary/10 px-6 py-4 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                                        >
                                            {uploading ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />}
                                            Upload
                                        </button>
                                    </div>
                                </div>
                                {formData.image && (
                                    <div className="mt-4 w-32 h-32 rounded-2xl overflow-hidden border border-gray-100">
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-4 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:bg-gray-50 transition-colors" disabled={isSubmitting}>Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="bg-primary text-paper px-8 py-4 rounded-xl flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-soft shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                                    <Save size={16} /> {isSubmitting ? 'Salvando...' : 'Salvar Curso'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-6">
                {courses.map((course, idx) => (
                    <motion.div
                        key={course.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white p-6 rounded-[2rem] border border-primary/5 hover:border-gold/30 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-8 group"
                    >
                        <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0 relative">
                            <img src={course.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                            <div className={`absolute top-2 left-2 w-3 h-3 rounded-full border border-white shadow-sm ${course.status === 'Aberto' ? 'bg-green-500' : course.status === 'Esgotado' ? 'bg-red-500' : 'bg-gray-400'}`} />
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h4 className="font-serif text-2xl text-primary mb-2">{course.title}</h4>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] font-bold uppercase tracking-widest text-primary/40">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {course.date}</span>
                                <span className="bg-gray-100 px-2 py-1 rounded-md text-primary/60">{course.status}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => startEdit(course)} className="p-3 rounded-xl hover:bg-primary/5 text-primary/60 hover:text-primary transition-colors" title="Editar">
                                <Edit size={18} />
                            </button>
                            <button onClick={() => deleteCourse(course.id)} className="p-3 rounded-xl hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors" title="Excluir">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
