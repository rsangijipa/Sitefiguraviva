"use client";

import { useState, useEffect } from 'react';
import { Camera, Save, Image as ImageIcon, Hash, FileText, Info, RefreshCw, CheckCircle2, AlertCircle, Trash2, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryService } from '../../../services/galleryServiceSupabase';
import { uploadFiles } from '../../../services/uploadServiceSupabase';

export default function GalleryManager() {
    const [gallery, setGallery] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        tags: '',
        caption: '',
        src: '',
        id: '' // Used for tracking editing
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        setLoading(true);
        try {
            const data = await galleryService.getAll();
            setGallery(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (item: any) => {
        setFormData({
            id: item.id,
            title: item.title || '',
            tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
            caption: item.caption || '',
            src: item.src || ''
        });
        setStatus({ type: '', message: '' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const urls = await uploadFiles(files, 'gallery');
            setFormData(prev => ({ ...prev, src: urls[0] }));
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Erro ao fazer upload da imagem.' });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.src || !formData.title) {
            setStatus({ type: 'error', message: 'Por favor, envie uma imagem e preencha o título.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Salvando...' });

        try {
            const payload = {
                title: formData.title,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
                caption: formData.caption,
                src: formData.src
            };

            if (formData.id) {
                await galleryService.update(formData.id, payload);
            } else {
                await galleryService.create(payload);
            }

            setStatus({ type: 'success', message: 'Dados salvos com sucesso!' });
            setFormData({ title: '', tags: '', caption: '', src: '', id: '' });
            fetchGallery();
        } catch (error) {
            console.error('Save error:', error);
            setStatus({ type: 'error', message: 'Erro ao salvar dados.' });
        }
    };

    const handleDelete = async (id: string | number) => {
        if (!confirm('Deseja excluir esta imagem da galeria?')) return;
        try {
            await galleryService.delete(id);
            fetchGallery();
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir.');
        }
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-serif text-primary mb-2">Gerenciador da Galeria</h2>
                    <p className="text-primary/60">
                        Selecione uma imagem para editar ou adicione uma nova.
                    </p>
                </div>
                <button
                    onClick={() => { setFormData({ title: '', tags: '', caption: '', src: '', id: '' }); setStatus({ type: '', message: '' }); }}
                    className="flex items-center gap-2 px-6 py-4 bg-primary text-paper rounded-xl hover:bg-gold transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg"
                >
                    <Plus size={16} /> Limpar Formuário
                </button>
            </header>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* FORM */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-primary/5 space-y-6 h-fit sticky top-6">
                    <div className="space-y-4">
                        <label className="block text-xs font-bold uppercase tracking-widest text-primary/40 ml-2">Imagem</label>
                        <div className="flex gap-4 items-center">
                            <div className="flex-1 relative group">
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-gold transition-colors" size={18} />
                                <input
                                    type="text"
                                    name="src"
                                    value={formData.src}
                                    onChange={handleChange}
                                    placeholder="URL da imagem..."
                                    className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-gold/50 transition-all font-mono text-sm text-primary"
                                />
                            </div>
                            <div className="relative">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={uploading} />
                                <button type="button" className="px-6 py-4 bg-paper border border-primary/10 rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                    {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                    Upload
                                </button>
                            </div>
                        </div>
                        {formData.src && (
                            <div className="w-32 h-32 rounded-2xl overflow-hidden border border-gray-100 mx-auto md:mx-0">
                                <img src={formData.src} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-primary/40 mb-2 ml-2">Titulo</label>
                        <div className="relative group">
                            <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-gold transition-colors" size={18} />
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Título da foto"
                                className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-gold/50 transition-all text-primary font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-primary/40 mb-2 ml-2">Tags</label>
                        <div className="relative group">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-gold transition-colors" size={18} />
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="Natureza, Workshop, 2024"
                                className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-gold/50 transition-all text-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-primary/40 mb-2 ml-2">Legenda</label>
                        <div className="relative group">
                            <FileText className="absolute left-4 top-6 text-primary/30 group-focus-within:text-gold transition-colors" size={18} />
                            <textarea
                                name="caption"
                                value={formData.caption}
                                onChange={handleChange}
                                rows={5}
                                placeholder="Texto descritivo..."
                                className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-gold/50 transition-all text-primary resize-none font-light"
                            />
                        </div>
                    </div>

                    {status.message && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${status.type === 'error' ? 'bg-red-50 text-red-600' :
                            status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                            {status.type === 'error' && <AlertCircle size={18} />}
                            {status.type === 'success' && <CheckCircle2 size={18} />}
                            {status.type === 'loading' && <Loader2 className="animate-spin" size={18} />}
                            {status.message}
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={status.type === 'loading'}
                        className="w-full py-5 bg-primary text-white rounded-xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-gold transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {formData.id ? 'Atualizar Dados' : 'Criar Nova Entrada'}
                    </button>
                </div>

                {/* IMAGENS EXISTENTES */}
                <div className="space-y-6">
                    <h3 className="text-xl font-serif text-primary flex items-center gap-2">
                        <ImageIcon size={20} className="text-gold" /> Imagens na Galeria
                    </h3>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-gold" size={40} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-6">
                            {gallery.map((item) => (
                                <div
                                    key={item.id}
                                    className={`group relative aspect-square rounded-[2rem] overflow-hidden cursor-pointer border-2 transition-all ${formData.id === item.id ? 'border-gold shadow-lg ring-4 ring-gold/10' : 'border-transparent hover:border-gold/30 shadow-sm'}`}
                                >
                                    <img src={item.src} alt={item.title} className="w-full h-full object-cover" onClick={() => handleImageSelect(item)} />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 pointer-events-none">
                                        <p className="text-white text-sm font-bold truncate mb-1">{item.title}</p>
                                        <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest mb-4">Ver Detalhes</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-xl transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Plus({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    )
}
