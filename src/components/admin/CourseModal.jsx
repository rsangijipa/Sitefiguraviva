import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Folder, FileText, ChevronRight, Upload, Search, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { auth } from '../../services/firebase';
import { uploadFiles, uploadFile } from '../../services/uploadService';

export default function CourseModal({ isOpen, onClose, courseToEdit = null }) {
    const { addCourse, updateCourse, showToast } = useApp();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('details'); // details, media, content

    const initialForm = {
        title: '',
        subtitle: '',
        category: 'Curso',
        status: 'Aberto',
        date: '',
        image: '',
        images: [],
        description: '',
        link: '',
        mediator1: '',
        mediator2: '',
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
            // Helper to parsing mediators back to string if needed
            let m1 = '';
            let m2 = '';
            if (courseToEdit.mediators && courseToEdit.mediators.length > 0) {
                m1 = `${courseToEdit.mediators[0].name}${courseToEdit.mediators[0].bio ? ' | ' + courseToEdit.mediators[0].bio : ''}`;
                if (courseToEdit.mediators.length > 1) {
                    m2 = `${courseToEdit.mediators[1].name}${courseToEdit.mediators[1].bio ? ' | ' + courseToEdit.mediators[1].bio : ''}`;
                }
            } else {
                // Fallback to legacy fields
                m1 = courseToEdit.mediator1 || '';
                m2 = courseToEdit.mediator2 || '';
            }

            setFormData({
                ...initialForm,
                ...courseToEdit,
                images: courseToEdit.images || (courseToEdit.image ? [courseToEdit.image] : []),
                mediator1: m1,
                mediator2: m2,
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
        setFormData(prev => ({
            ...prev,
            [field]: value.split(',').map(item => item.trim()).filter(Boolean)
        }));
    };

    const handleDetailArray = (field, value) => {
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
            if (!user) {
                // Allow save if strict auth is off or for testing, otherwise throw
                // throw new Error("Usuário não autenticado");
            }

            // Reconstruct mediators array from fields
            const mediators = [];
            if (formData.mediator1) {
                const [name, ...bioParts] = formData.mediator1.split('|');
                mediators.push({ name: name.trim(), bio: bioParts.join('|').trim() });
            }
            if (formData.mediator2) {
                const [name, ...bioParts] = formData.mediator2.split('|');
                mediators.push({ name: name.trim(), bio: bioParts.join('|').trim() });
            }

            const dataToSave = {
                ...formData,
                mediators, // Save structured mediators
                image: formData.images[0] || formData.image || '',
                updatedAt: new Date().toISOString(),
                updatedBy: user?.email || 'admin',
                // Pass existing ID if editing to overwrite folder
                id: courseToEdit ? courseToEdit.id : undefined
            };

            // Remove temporary fields
            delete dataToSave.mediator1;
            delete dataToSave.mediator2;

            // SAVE TO FIREBASE (Primary)
            if (courseToEdit && courseToEdit.id) {
                await updateCourse(courseToEdit.id, dataToSave);
            } else {
                await addCourse(dataToSave);
            }

            showToast("Salvo com sucesso!", "success");
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
                        Uploads & Capa
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <form id="course-form" onSubmit={handleSubmit} className="space-y-8">

                        {activeTab === 'details' && (
                            <div className="grid md:grid-cols-2 gap-6 animate-slide-in">
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Title (Título)</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="Ex: Formação em Gestalt"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Subtitle</label>
                                    <input
                                        value={formData.subtitle}
                                        onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="Breve frase de efeito..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Category</label>
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
                                        <option value="Aberto">Aberto</option>
                                        <option value="Esgotado">Esgotado</option>
                                        <option value="Encerrado">Encerrado</option>
                                        <option value="Breve">Em Breve</option>
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Date</label>
                                    <input
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="Ex: Início 20 de Março"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Tags (Separadas por vírgula)</label>
                                    <input
                                        value={formData.tags.join(', ')}
                                        onChange={e => handleArrayInput('tags', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="Ex: gestalt, psicologia, online"
                                    />
                                </div>

                                <div className="space-y-4 md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Mediador 1 (Nome | Bio)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.mediator1}
                                        onChange={e => setFormData({ ...formData, mediator1: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="Nome Sobrenome | Breve biografia do mediador..."
                                    />
                                </div>

                                <div className="space-y-4 md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Mediador 2 (Nome | Bio)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.mediator2}
                                        onChange={e => setFormData({ ...formData, mediator2: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="Nome Sobrenome | Breve biografia do mediador..."
                                    />
                                </div>

                                <div className="col-span-2 space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Link</label>
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
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Description (Intro Curta)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="Aparece no card da home..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Intro (Detalhada)</label>
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
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Format (Um item por linha)</label>
                                        <textarea
                                            rows={6}
                                            value={formData.details.format.join('\n')}
                                            onChange={e => handleDetailArray('format', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none font-mono text-sm"
                                            placeholder="• Aulas gravadas&#10;• Encontros ao vivo"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Cronograma (Opcional - Um por linha)</label>
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
                                {/* Upload Zone */}
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Upload de Imagens</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                            onChange={async (e) => {
                                                if (!e.target.files?.length) return;
                                                // Quick mock preview & flag for upload
                                                const files = Array.from(e.target.files);
                                                setLoading(true);
                                                try {
                                                    // Upload with a generic path or timestamp based
                                                    const urls = await uploadFiles(files, `courses/${formData.id || 'draft'}`);
                                                    setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
                                                    showToast(`${urls.length} imagens enviadas!`, "success");
                                                } catch (err) {
                                                    console.error(err);
                                                    showToast("Erro no upload: " + err.message, "error");
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                        />
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <Upload size={32} />
                                            <span className="text-sm font-medium">Clique ou arraste imagens aqui</span>
                                            <span className="text-xs">JPG, PNG (Max 5MB)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Current Images Gallery */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Galeria do Curso</label>
                                    <div className="grid grid-cols-4 gap-4">
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                                {/* Cover Selection */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // Move to index 0
                                                        const newImages = [...formData.images];
                                                        newImages.splice(idx, 1);
                                                        newImages.unshift(img);
                                                        setFormData(p => ({ ...p, images: newImages }));
                                                    }}
                                                    className="absolute bottom-1 right-1 bg-white/80 text-primary text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 font-bold"
                                                >
                                                    Definir Capa
                                                </button>
                                                {idx === 0 && <div className="absolute top-0 left-0 bg-gold text-white text-[9px] font-bold px-2 py-1">CAPA</div>}
                                            </div>
                                        ))}
                                    </div>
                                    {formData.images.length === 0 && (
                                        <p className="text-center text-xs text-gray-400 mt-4">Nenhuma imagem carregada.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Footer Warning */}
                        <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-800 border border-blue-100">
                            Os dados serão salvos diretamente no banco de dados. Imagens são enviadas para o armazenamento em nuvem.
                        </div>

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
                        {loading ? 'Processando...' : (<><Save size={16} /> Salvar Curso</>)}
                    </button>
                </div>
            </div>
        </div>
    );
}
