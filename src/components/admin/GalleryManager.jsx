import React, { useState } from 'react';
import { Camera, Save, Image as ImageIcon, Hash, FileText, Info, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import galleryData from '../../data/gallery.json';

// Ensure we have data
const safeGallery = Array.isArray(galleryData) ? galleryData : [];

export default function GalleryManager() {
    const { addToast } = useApp();
    const [formData, setFormData] = useState({
        filename: '',
        title: '',
        tags: '',
        caption: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [previewImage, setPreviewImage] = useState(null);

    const handleImageSelect = (item) => {
        setFormData({
            filename: item.id,
            title: item.title,
            tags: item.tags.join(', '),
            caption: item.caption
        });
        setPreviewImage(item.src);
        setStatus({ type: '', message: '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.filename || !formData.title) {
            setStatus({ type: 'error', message: 'Por favor, preencha o nome do arquivo e o título.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Salvando...' });

        try {
            const response = await fetch('/api/save-gallery-meta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: formData.filename,
                    title: formData.title,
                    tags: formData.tags,
                    caption: formData.caption
                }),
            });

            if (response.ok) {
                setStatus({ type: 'success', message: 'Dados salvos com sucesso! A galeria será atualizada.' });
                // Reload or just clear status logic
                setTimeout(() => {
                    setStatus({ type: 'success', message: 'Salvo! Recarregue a página para ver na lista atualizada.' });
                }, 1500);
            } else {
                const err = await response.json();
                setStatus({ type: 'error', message: `Erro ao salvar: ${err.error || 'Erro desconhecido'}` });
            }
        } catch (error) {
            console.error('Save error:', error);
            setStatus({ type: 'error', message: 'Erro de conexão com o servidor local.' });
        }
    };

    const handleRefresh = async () => {
        setStatus({ type: 'loading', message: 'Sincronizando pasta de imagens...' });
        try {
            const response = await fetch('/api/sync-gallery');
            if (response.ok) {
                setStatus({ type: 'success', message: 'Sincronização concluída! Recarregando...' });
                setTimeout(() => window.location.reload(), 1000);
            } else {
                setStatus({ type: 'error', message: 'Erro ao sincronizar galeria.' });
            }
        } catch (e) {
            console.error(e);
            setStatus({ type: 'error', message: 'Erro de conexão.' });
        }
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-serif text-primary mb-2">Gerenciador da Galeria</h2>
                    <p className="text-primary/60">
                        Selecione uma imagem abaixo para editar ou adicione uma nova manualmente.
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600 transition-colors text-xs font-bold uppercase tracking-wider"
                >
                    <RefreshCw size={16} /> Atualizar Lista
                </button>
            </header>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* FORM */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-primary/5 space-y-6 h-fit sticky top-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-primary/40 mb-2">Nome do Arquivo</label>
                        <div className="relative group">
                            <div className="relative flex-grow">
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-gold transition-colors" size={18} />
                                <input
                                    type="text"
                                    name="filename"
                                    value={formData.filename}
                                    onChange={handleChange}
                                    placeholder="ex: foto-nova.jpg"
                                    className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-gold/50 transition-all font-mono text-sm text-primary"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-primary/40 mt-2 ml-2">Para adicionar nova, coloque o arquivo na pasta images e digite o nome aqui.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-primary/40 mb-2">Titulo</label>
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
                        <label className="block text-xs font-bold uppercase tracking-widest text-primary/40 mb-2">Tags</label>
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
                        <label className="block text-xs font-bold uppercase tracking-widest text-primary/40 mb-2">Legenda</label>
                        <div className="relative group">
                            <FileText className="absolute left-4 top-6 text-primary/30 group-focus-within:text-gold transition-colors" size={18} />
                            <textarea
                                name="caption"
                                value={formData.caption}
                                onChange={handleChange}
                                rows={5}
                                placeholder="Texto descritivo..."
                                className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-gold/50 transition-all text-primary resize-none"
                            />
                        </div>
                    </div>

                    {status.message && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${status.type === 'error' ? 'bg-red-50 text-red-600' :
                                status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                            {status.type === 'error' && <AlertCircle size={18} />}
                            {status.type === 'success' && <CheckCircle2 size={18} />}
                            {status.message}
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        className="w-full py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-gold transition-all shadow-lg flex items-center justify-center gap-3"
                    >
                        <Save size={20} />
                        Salvar Alterações
                    </button>
                </div>

                {/* IMAGENS EXISTENTES */}
                <div className="space-y-6">
                    <h3 className="text-xl font-serif text-primary flex items-center gap-2">
                        <ImageIcon size={20} className="text-gold" /> Imagens na Galeria
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        {safeGallery.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleImageSelect(item)}
                                className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${formData.filename === item.id ? 'border-gold shadow-lg ring-2 ring-gold/20' : 'border-transparent hover:border-gold/50'}`}
                            >
                                <img src={item.src} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                    <p className="text-white text-xs font-medium truncate">{item.title}</p>
                                    <p className="text-white/60 text-[10px] truncate">{item.id}</p>
                                </div>
                            </div>
                        ))}
                        {safeGallery.length === 0 && (
                            <div className="col-span-2 py-12 text-center text-primary/40 bg-stone-50 rounded-2xl border border-dashed border-primary/10">
                                <Info size={32} className="mx-auto mb-2 opacity-50" />
                                <p>Nenhuma imagem encontrada na pasta.</p>
                                <p className="text-xs mt-1">Adicione arquivos em 'public/images' e clique em Atualizar.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
