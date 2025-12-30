"use client";

import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Plus, Trash2, Edit, Save, X, Calendar, Link as LinkIcon, Image as ImageIcon, Upload, RefreshCw, User, Users, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadFiles } from '../../../services/uploadServiceSupabase';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export default function CoursesManager() {
    const { courses, addCourse, updateCourse, deleteCourse } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [currentCourse, setCurrentCourse] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('details'); // details, content, mediators

    const initialForm = {
        title: '',
        subtitle: '',
        date: '',
        status: 'Aberto',
        link: '',
        image: '',
        description: '', // Short intro
        tags: '',
        details: {
            intro: '',
            format: '',
            schedule: ''
        },
        mediators: [] as { name: string, bio: string, photo: string }[]
    };

    const [formData, setFormData] = useState(initialForm);
    const [uploading, setUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper to handle nested state
    const setDetail = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            details: { ...prev.details, [field]: value }
        }));
    };

    // --- HANDLERS ---
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | number) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);

        setUploading(true);
        try {
            const urls = await uploadFiles(files, target === 'cover' ? 'courses' : 'mediators');
            const url = urls[0];

            if (target === 'cover') {
                setFormData(prev => ({ ...prev, image: url }));
            } else if (typeof target === 'number') {
                const newMediators = [...formData.mediators];
                newMediators[target] = { ...newMediators[target], photo: url };
                setFormData(prev => ({ ...prev, mediators: newMediators }));
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Erro ao enviar imagem.");
        } finally {
            setUploading(false);
        }
    };

    const handleMediatorChange = (idx: number, field: string, value: string) => {
        const newMediators = [...formData.mediators];
        // @ts-ignore
        newMediators[idx][field] = value;
        setFormData(prev => ({ ...prev, mediators: newMediators }));
    };

    const addMediator = () => {
        setFormData(prev => ({
            ...prev,
            mediators: [...prev.mediators, { name: '', bio: '', photo: '' }]
        }));
    };

    const removeMediator = (idx: number) => {
        const newMediators = formData.mediators.filter((_, i) => i !== idx);
        setFormData(prev => ({ ...prev, mediators: newMediators }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Prepare payload
            const payload = {
                ...formData,
                // Ensure tags is array if needed by backend, or keep as string if that's how we implemented schema (schema said text[])
                // Let's split by comma for schema compliance if backend expects array, but context might handle it.
                // context addCourse typically just passes data to supabase.
                tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : formData.tags
            };

            if (currentCourse) {
                await updateCourse(currentCourse.id, payload);
            } else {
                await addCourse(payload);
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

    const startEdit = (course: any) => {
        setCurrentCourse(course);
        // Map backend data to form
        setFormData({
            ...initialForm,
            ...course,
            tags: Array.isArray(course.tags) ? course.tags.join(', ') : (course.tags || ''),
            details: {
                intro: course.details?.intro || '',
                format: course.details?.format || '',
                schedule: course.details?.schedule || ''
            },
            mediators: course.mediators || []
        });
        setIsEditing(true);
        setActiveTab('details');
    };

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h3 className="font-serif text-3xl mb-2 text-primary">Gestão de Cursos</h3>
                    <p className="text-primary/40 text-sm max-w-lg">Adicione e gerencie os cursos, formações e grupos de estudos.</p>
                </div>
                <Button
                    onClick={() => { setIsEditing(true); setCurrentCourse(null); setFormData(initialForm); setActiveTab('details'); }}
                    leftIcon={<Plus size={16} />}
                    className="shadow-xl"
                >
                    Novo Curso
                </Button>
            </header>

            <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
                <ModalContent size="xl">
                    <ModalHeader>
                        <h3 className="font-serif text-2xl text-primary">{currentCourse ? 'Editar Atividade' : 'Nova Atividade'}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mt-1">Preencha os detalhes abaixo</p>
                    </ModalHeader>

                    {/* Tabs */}
                    <div className="flex px-8 border-b border-gray-100 shrink-0 bg-white">
                        <button onClick={() => setActiveTab('details')} className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'details' ? 'border-gold text-primary' : 'border-transparent text-primary/30 hover:text-primary/60'}`}>
                            Detalhes Gerais
                        </button>
                        <button onClick={() => setActiveTab('content')} className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'content' ? 'border-gold text-primary' : 'border-transparent text-primary/30 hover:text-primary/60'}`}>
                            Conteúdo & Formato
                        </button>
                        <button onClick={() => setActiveTab('mediators')} className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'mediators' ? 'border-gold text-primary' : 'border-transparent text-primary/30 hover:text-primary/60'}`}>
                            Mediadores & Equipe
                        </button>
                    </div>

                    <ModalBody className="bg-[#FDFCF9]">
                        <form id="course-form" onSubmit={handleSubmit} className="space-y-8">
                            {activeTab === 'details' && (
                                <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Título da Atividade</label>
                                        <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-primary font-serif text-xl placeholder:text-gray-300" placeholder="Ex: Formação em Gestalt-Terapia" />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Subtítulo (Frase de Efeito)</label>
                                        <input value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm italic text-primary/80" placeholder="Uma jornada de autoconhecimento..." />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2"><Calendar size={12} /> Data/Horário</label>
                                        <input required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm font-bold text-primary" placeholder="Ex: Início Março/2024" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Status</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all appearance-none text-sm font-bold text-primary cursor-pointer">
                                            <option value="Aberto">Aberto (Inscrições Abertas)</option>
                                            <option value="Esgotado">Esgotado (Lista de Espera)</option>
                                            <option value="Encerrado">Encerrado (Finalizado)</option>
                                            <option value="Breve">Em Breve (Pré-Lançamento)</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2"><LinkIcon size={12} /> Link Externo (Inscrição)</label>
                                        <input value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm font-mono text-primary/60" placeholder="https://sympla.com.br/..." />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2"><ImageIcon size={12} /> Imagem de Capa</label>
                                        <div className="flex gap-6 items-start">
                                            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 relative group">
                                                {formData.image ? (
                                                    <img src={formData.image} alt="Capa" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={32} /></div>
                                                )}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white text-[10px] font-bold uppercase">Trocar</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <input value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono text-gray-500 focus:outline-none focus:border-gold" placeholder="URL da imagem..." />
                                                <div className="relative inline-block">
                                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'cover')} disabled={uploading} />
                                                    <button type="button" className="bg-white border border-gray-200 px-6 py-3 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-colors">
                                                        {uploading ? <RefreshCw className="animate-spin" size={14} /> : <Upload size={14} />}
                                                        Fazer Upload
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'content' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Intro Curta (Card da Home)</label>
                                        <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm text-primary/80" placeholder="Um breve resumo que aparece nos cards..." />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Introdução Detalhada (Página do Curso)</label>
                                        <textarea rows={6} value={formData.details.intro} onChange={e => setDetail('intro', e.target.value)} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm text-primary/80 leading-relaxed" placeholder="O texto principal descrevendo a proposta do curso..." />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Formato das Aulas</label>
                                            <textarea rows={5} value={formData.details.format} onChange={e => setDetail('format', e.target.value)} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm text-primary/80" placeholder="Ex: • Aulas gravadas&#10;• Encontros quinzenais via Zoom" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Cronograma / Módulos</label>
                                            <textarea rows={5} value={formData.details.schedule} onChange={e => setDetail('schedule', e.target.value)} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm text-primary/80" placeholder="Ex: Módulo 1: Introdução (Março)&#10;Módulo 2: Aprofundamento (Abril)" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Tags (Separadas por vírgula)</label>
                                        <input value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm text-primary/60" placeholder="gestalt, psicologia, online, iniciante" />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'mediators' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-sm text-primary/60">Adicione os professores ou mediadores deste curso.</p>
                                        <Button variant="ghost" onClick={addMediator} size="sm" className="text-gold" leftIcon={<Plus size={14} />}>
                                            Adicionar Mediador
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.mediators.map((mediator, idx) => (
                                            <Card key={idx} className="bg-white border-gray-100 rounded-2xl p-6 relative group hover:border-gold/30 transition-all shadow-sm">
                                                <button type="button" onClick={() => removeMediator(idx)} className="absolute top-4 right-4 p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                                    <div className="space-y-2 text-center mx-auto sm:mx-0">
                                                        <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-200 overflow-hidden relative group/img cursor-pointer">
                                                            {mediator.photo ? (
                                                                <img src={mediator.photo} alt={mediator.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-300"><User size={24} /></div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                <Upload size={16} className="text-white" />
                                                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, idx)} />
                                                            </div>
                                                        </div>
                                                        <p className="text-[9px] font-bold uppercase text-gray-400">Foto</p>
                                                    </div>
                                                    <div className="flex-1 w-full grid md:grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold uppercase tracking-wider text-primary/30">Nome</label>
                                                            <input value={mediator.name} onChange={e => handleMediatorChange(idx, 'name', e.target.value)} className="w-full bg-gray-50 border-transparent focus:bg-white border focus:border-gold rounded-lg px-3 py-3 text-sm font-bold text-primary outline-none transition-all" placeholder="Nome do Mediador" />
                                                        </div>
                                                        <div className="space-y-1 md:col-span-2">
                                                            <label className="text-[9px] font-bold uppercase tracking-wider text-primary/30">Minibio / Credenciais</label>
                                                            <textarea rows={2} value={mediator.bio} onChange={e => handleMediatorChange(idx, 'bio', e.target.value)} className="w-full bg-gray-50 border-transparent focus:bg-white border focus:border-gold rounded-lg px-3 py-3 text-xs text-primary/70 outline-none transition-all" placeholder="Psicóloga, Mestre em..." />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                        {formData.mediators.length === 0 && (
                                            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl text-primary/30 text-sm">
                                                Nenhum mediador adicionado.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </form>
                    </ModalBody>
                    <ModalFooter className="flex justify-end gap-4 bg-white">
                        <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button onClick={(e) => handleSubmit(e)} disabled={isSubmitting} leftIcon={<Save size={16} />} isLoading={isSubmitting}>
                            Salvar Curso
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* List */}
            <div className="grid gap-6">
                {courses.map((course, idx) => (
                    <motion.div
                        key={course.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card className="p-6 rounded-[2rem] border-primary/5 hover:border-gold/30 flex flex-col md:flex-row items-center gap-8 group">
                            <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0 relative">
                                <img src={course.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                <div className={`absolute top-2 left-2 w-3 h-3 rounded-full border border-white shadow-sm ${course.status === 'Aberto' ? 'bg-green-500' : course.status === 'Esgotado' ? 'bg-red-500' : 'bg-gray-400'}`} />
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <h4 className="font-serif text-2xl text-primary mb-2 line-clamp-1">{course.title}</h4>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] font-bold uppercase tracking-widest text-primary/40">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {course.date}</span>
                                    <span className={`px-2 py-1 rounded-md ${course.status === 'Aberto' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{course.status}</span>
                                    {course.mediators && course.mediators.length > 0 && (
                                        <span className="flex items-center gap-1"><Users size={12} /> {course.mediators.length} Mediadores</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => startEdit(course)} className="p-3 rounded-xl hover:bg-gold/10 text-primary/60 hover:text-gold transition-colors" title="Editar">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => { if (confirm('Tem certeza?')) deleteCourse(course.id) }} className="p-3 rounded-xl hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors" title="Excluir">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
                {courses.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <p>Nenhum curso encontrado.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
