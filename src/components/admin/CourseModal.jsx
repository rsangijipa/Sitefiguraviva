import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Folder, FileText, ChevronRight, Upload, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { auth } from '../../services/firebase';
import { uploadFiles } from '../../services/uploadService';
// Import the generated manifest (if you are running the node script)
// import courseAssets from '../../data/courseAssets.json';

// Fallback if json not found or for dynamic usage. 
// In a real app, you'd fetch this from an API or Context.
// We will use the one we just generated.
import localAssets from '../../data/courseAssets.json';

const AVAILABLE_ASSETS = localAssets || [];

export default function CourseModal({ isOpen, onClose, courseToEdit = null }) {
    const { addCourse, updateCourse, showToast } = useApp();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('details'); // details, media, content
    const [assetFilter, setAssetFilter] = useState('');

    const initialForm = {
        title: '',
        subtitle: '',
        category: 'Curso',
        status: 'Aberto',
        date: '',
        fullDate: '', // For detailed view
        image: '',
        images: [],
        description: '',
        link: '',
        mediators: [],
        tags: [],
        details: {
            intro: '',
            format: [],
            schedule: []
        }
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (courseToEdit) {
            setFormData({
                ...initialForm,
                ...courseToEdit,
                images: courseToEdit.images || (courseToEdit.image ? [courseToEdit.image] : []),
                mediators: courseToEdit.mediators || [],
                tags: courseToEdit.tags || [],
                details: {
                    intro: courseToEdit.details?.intro || courseToEdit.description || '',
                    format: courseToEdit.details?.format || [],
                    schedule: courseToEdit.details?.schedule || []
                }
            });
        } else {
            setFormData(initialForm);
        }
    }, [courseToEdit, isOpen]);

    // Format handling helpers
    const handleArrayInput = (field, value) => {
        // Simple comma separated for now, or new line
        // For mediators and tags
        setFormData(prev => ({
            ...prev,
            [field]: value.split(',').map(item => item.trim()).filter(Boolean)
        }));
    };

    const handleDetailArray = (field, value) => {
        // New line separated
        setFormData(prev => ({
            ...prev,
            details: {
                ...prev.details,
                [field]: value.split('\n').filter(Boolean)
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Usuário não autenticado");

            const dataToSave = {
                ...formData,
                image: formData.images[0] || formData.image || '', // Ensure cover is first image
                updatedAt: new Date().toISOString(),
                updatedBy: user.email
            };

            // Remove id from dataToSave if it exists to avoid overwriting it in the doc data (Firestore handles ID separately usually, but good practice)
            // But we need it for update.

            if (courseToEdit && courseToEdit.id) {
                // Determine if it's a static course we are "overriding" or a firestore course
                // If the ID is string/number that exists in static, we might need to creating a new doc with that ID in firestore?
                // The service handles update.
                await updateCourse(courseToEdit.id, dataToSave);
                showToast("Curso atualizado com sucesso!", "success");
            } else {
                await addCourse(dataToSave);
                showToast("Curso criado com sucesso!", "success");
            }
            onClose();
        } catch (error) {
            console.error("Save error:", error);
            showToast("Erro ao salvar: " + error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-serif text-primary">
                            {courseToEdit ? 'Editar Atividade' : 'Nova Atividade'}
                        </h2>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mt-1">
                            Gerenciamento Acadêmico
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-6">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Detalhes Gerais
                    </button>
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'content' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Conteúdo & Formato
                    </button>
                    <button
                        onClick={() => setActiveTab('media')}
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'media' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Biblioteca de Mídia
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <form id="course-form" onSubmit={handleSubmit} className="space-y-8">

                        {activeTab === 'details' && (
                            <div className="grid md:grid-cols-2 gap-6 animate-slide-in">
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Título da Atividade</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="Ex: Formação em Gestalt"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Subtítulo (Opcional)</label>
                                    <input
                                        value={formData.subtitle}
                                        onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="Breve frase de efeito..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Categoria</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                    >
                                        <option value="Curso">Curso Livre</option>
                                        <option value="Formacao">Formação</option>
                                        <option value="GrupoEstudos">Grupo de Estudos</option>
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                    >
                                        <option value="Aberto">Inscrições Abertas</option>
                                        <option value="Esgotado">Esgotado</option>
                                        <option value="Encerrado">Encerrado</option>
                                        <option value="Breve">Em Breve</option>
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Data Resumida (Card)</label>
                                    <input
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="Ex: Início 20 de Março"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Data Completa / Local</label>
                                    <input
                                        value={formData.fullDate}
                                        onChange={e => setFormData({ ...formData, fullDate: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="Ex: Encontros Quinzenais | On-line"
                                    />
                                </div>

                                <div className="col-span-2 space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Mediadores (Separar por vírgula)</label>
                                    <input
                                        value={formData.mediators.join(', ')}
                                        onChange={e => handleArrayInput('mediators', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="Ex: Lílian Gusmão, Wanne Belmino"
                                    />
                                </div>

                                <div className="col-span-2 space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Link de Inscrição (WhatsApp/Sympla)</label>
                                    <input
                                        value={formData.link}
                                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'content' && (
                            <div className="space-y-6 animate-slide-in">
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Descrição Curta (Intro)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="Aparece no card da home..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Introdução Detalhada</label>
                                    <textarea
                                        rows={4}
                                        value={formData.details.intro}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, intro: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="Texto principal da página de detalhes..."
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Formato/Metodologia (Um por linha)</label>
                                        <textarea
                                            rows={6}
                                            value={formData.details.format.join('\n')}
                                            onChange={e => handleDetailArray('format', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none font-mono text-sm"
                                            placeholder="• Aulas gravadas&#10;• Encontros ao vivo"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Cronograma (Um por linha)</label>
                                        <textarea
                                            rows={6}
                                            value={formData.details.schedule.join('\n')}
                                            onChange={e => handleDetailArray('schedule', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none font-mono text-sm"
                                            placeholder="20/03 - Abertura&#10;15/04 - Módulo 2"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'media' && (
                            <div className="space-y-8 animate-slide-in">
                                {/* Current Images */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Imagens Selecionadas</label>
                                    <div className="grid grid-cols-4 gap-4">
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                                {idx === 0 && <div className="absolute bottom-0 w-full bg-black/50 text-white text-[9px] font-bold text-center py-1">CAPA</div>}
                                            </div>
                                        ))}
                                        {formData.images.length === 0 && (
                                            <div className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                                Sem imagens
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Local Assets Library */}
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-primary">
                                            <Folder size={18} className="text-gold" />
                                            <h4 className="font-bold text-sm uppercase tracking-wider">Biblioteca Local (/public/cursos)</h4>
                                        </div>
                                        <div className="relative">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Filtrar arquivos..."
                                                className="pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-accent"
                                                value={assetFilter}
                                                onChange={e => setAssetFilter(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-2">
                                        {AVAILABLE_ASSETS
                                            .filter(asset => asset.toLowerCase().includes(assetFilter.toLowerCase()))
                                            .map((asset, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setFormData(p => ({ ...p, images: [...p.images, asset] }))}
                                                    className="flex flex-col gap-2 p-2 hover:bg-white rounded-lg transition-colors group text-left border border-transparent hover:border-gray-200"
                                                >
                                                    <div className="aspect-video bg-gray-200 rounded overflow-hidden relative">
                                                        <img src={asset} alt="asset" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Upload size={16} className="text-white drop-shadow-md" />
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-gray-500 font-medium truncate w-full" title={asset}>
                                                        {asset.split('/').pop()}
                                                    </span>
                                                </button>
                                            ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-3 text-center">
                                        * Adicione arquivos em <code>public/cursos</code> e reinicie o servidor para atualizar a lista.
                                    </p>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="course-form"
                        disabled={loading}
                        className={`px-8 py-3 rounded-xl bg-primary text-white font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors shadow-lg flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Salvando...' : (<><Save size={16} /> Salvar Curso</>)}
                    </button>
                </div>
            </div>
        </div>
    );
}
