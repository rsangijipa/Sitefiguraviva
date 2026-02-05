"use client";

import { useState, useEffect } from 'react';
import { Camera, Save, Image as ImageIcon, Hash, FileText, Info, RefreshCw, CheckCircle2, AlertCircle, Trash2, Upload, Loader2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// import { galleryService } from '../../../services/galleryServiceSupabase'; // REMOVE
// import { uploadFiles } from '../../../services/uploadServiceSupabase'; // REMOVE
import { useAuth } from '@/context/AuthContext';
import { useGallery } from '@/hooks/useContent';
import { useToast } from '@/context/ToastContext';
import ImageUpload from '@/components/admin/ImageUpload';
import { db } from '@/lib/firebase/client';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

export default function GalleryManager() {
    // const [gallery, setGallery] = useState<any[]>([]);
    // const [loading, setLoading] = useState(true);
    const { data: gallery = [], isLoading: loading, refetch } = useGallery();
    const { user } = useAuth();
    const { addToast } = useToast();

    const initialForm = {
        title: '',
        category: 'Geral', // Added category
        tags: '',
        caption: '',
        src: '',
        id: '' // Used for tracking editing
    };
    const [formData, setFormData] = useState(initialForm);
    const [isEditing, setIsEditing] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    // const [uploading, setUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // useEffect(() => {
    //    fetchGallery();
    // }, []);

    // const fetchGallery = async () => { ... } // Replaced by hook


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Prepare payload
            const payload = {
                ...formData,
                // The database schema uses TEXT for tags. formData.tags is always string in our state.
                tags: formData.tags,
                updated_at: serverTimestamp(),
                isPublished: true
            };

            // Remove ID from payload to avoid saving it in doc data if new
            const { id, ...savePayload } = payload;

            if (formData.id) {
                await updateDoc(doc(db, 'gallery', formData.id), savePayload);
                addToast('Imagem atualizada com sucesso!', 'success');
            } else {
                await addDoc(collection(db, 'gallery'), {
                    ...savePayload,
                    created_at: serverTimestamp()
                });
                addToast('Imagem salva com sucesso!', 'success');
            }

            refetch();
            setFormData(initialForm);
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving gallery item:", error);
            addToast('Erro ao salvar item.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;
        try {
            await deleteDoc(doc(db, 'gallery', id));
            refetch();
            addToast('Imagem excluída!', 'success');
        } catch (error) {
            console.error("Delete error:", error);
            addToast("Erro ao excluir.", 'error');
        }
    };


    const handleEdit = (item: any) => {
        setFormData({
            ...item,
            tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || '')
        });
        setIsEditing(true);
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    const filteredGallery = gallery
        .filter(item => {
            const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.caption?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a: any, b: any) => {
            const dateA = a.created_at?.seconds || 0;
            const dateB = b.created_at?.seconds || 0;
            return dateB - dateA; // Descending
        });

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h3 className="font-serif text-3xl mb-2 text-primary">Galeria de Imagens</h3>
                    <p className="text-primary/40 text-sm max-w-lg">Gerencie as imagens exibidas na galeria do site. Adicione fotos de encontros e momentos especiais.</p>
                </div>
                <button
                    onClick={() => { setIsEditing(true); setFormData(initialForm); }}
                    className="bg-primary text-paper px-8 py-4 rounded-xl flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-soft hover:shadow-xl transform active:scale-95 shadow-lg border border-primary/10"
                >
                    <Plus size={16} /> Nova Imagem
                </button>
            </header>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-6 items-end bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-stone-200/60 shadow-sm">
                <div className="flex-1 w-full space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 ml-2">Buscar</label>
                    <input
                        type="text"
                        placeholder="Filtrar por título ou legenda..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                    />
                </div>
                <div className="w-full md:w-64 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 ml-2">Filtrar Categoria</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-gold cursor-pointer"
                    >
                        <option value="Todos">Todas as Categorias</option>
                        <option value="Geral">Geral</option>
                        <option value="Eventos">Eventos</option>
                        <option value="Workshops">Workshops</option>
                        <option value="Espaço">Espaço</option>
                    </select>
                </div>
            </div>

            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm"
                    >
                        <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-stone-50/50">
                                <div>
                                    <h3 className="font-serif text-2xl text-primary">{formData.id ? 'Editar Imagem' : 'Nova Imagem'}</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mt-1">Detalhes da foto</p>
                                </div>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} className="text-primary/40" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar bg-[#FDFCF9]">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Título / Evento</label>
                                    <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-primary font-serif text-lg" placeholder="Ex: Workshop de Gestalt" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Categoria</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm font-bold text-primary appearance-none cursor-pointer">
                                        <option value="Geral">Geral</option>
                                        <option value="Eventos">Eventos</option>
                                        <option value="Workshops">Workshops</option>
                                        <option value="Espaço">Espaço</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Imagem</label>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-full">
                                            <ImageUpload
                                                defaultImage={formData.src}
                                                onUpload={(url) => setFormData(prev => ({ ...prev, src: url }))}
                                                className="w-full h-64 rounded-2xl"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Legenda</label>
                                    <textarea rows={2} value={formData.caption} onChange={e => setFormData({ ...formData, caption: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm text-primary/80" placeholder="Descrição da imagem..." />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-2">Tags</label>
                                    <input value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm text-primary/60" placeholder="Separadas por vírgula" />
                                </div>

                                <div className="pt-4 flex justify-end gap-4 border-t border-gray-100">
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:bg-gray-50 transition-colors" disabled={isSubmitting}>Cancelar</button>
                                    <button type="submit" disabled={isSubmitting} className="bg-primary text-paper px-8 py-3 rounded-xl flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-soft shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                                        <Save size={16} /> {isSubmitting ? 'Salvando...' : 'Salvar Imagem'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {status.message && (
                <div className={`fixed bottom-8 right-8 z-50 p-4 rounded-xl flex items-center gap-3 text-sm font-medium shadow-2xl animate-in slide-in-from-right-10 duration-500 ${status.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                    {status.message}
                </div>
            )}

            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                    <ImageIcon size={20} className="text-gold" />
                    <h3 className="text-xl font-serif text-primary">Imagens na Galeria</h3>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-gold" size={40} />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredGallery.map((item) => (
                            <div
                                key={item.id}
                                className="group relative aspect-square rounded-[2rem] overflow-hidden cursor-pointer border-2 border-transparent hover:border-gold/30 shadow-sm transition-all"
                            >
                                <img src={item.src} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onClick={() => handleEdit(item)} />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 pointer-events-none">
                                    <p className="text-white text-sm font-bold truncate mb-1">{item.title}</p>
                                    <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest">Editar</p>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                    className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-md text-white rounded-xl transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all hover:bg-red-500 shadow-lg pointer-events-auto"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {filteredGallery.length === 0 && (
                            <div className="col-span-full py-20 text-center text-primary/30 border-2 border-dashed border-gray-100 rounded-[2rem]">
                                Nenhuma imagem encontrada com os filtros atuais.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
