import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, BookOpen, PenTool, Settings, LogOut,
    Plus, Trash2, Edit, Save, X, AlertTriangle,
    Globe, LayoutTemplate, Database, Youtube, Calendar, Menu, CheckCircle
} from 'lucide-react';

// DEBUG: Verify Icons
console.log("DEBUG: Lucide Icons Check:", {
    LayoutDashboard, BookOpen, PenTool, Settings, LogOut,
    Plus, Trash2, Edit, Save, X, AlertTriangle
});

import { useApp } from '../context/AppContext';
import { blogService } from '../services/blogService';
import { uploadFiles } from '../services/uploadService';
import { auth } from '../services/firebase';

// --- Sub-Components ---

// 1. Academic Manager (Courses, Formations, Groups)
function AcademicManager() {
    const context = useApp();
    console.log("DEBUG: AcademicManager context:", context);
    const { courses, addCourse, updateCourse, deleteCourse } = context || {};

    // Debug courses explicitly
    console.log("DEBUG: AcademicManager courses (type):", typeof courses, Array.isArray(courses), courses);

    const [isEditing, setIsEditing] = useState(false);
    const [currentCourse, setCurrentCourse] = useState(null);
    const [uploading, setUploading] = useState(false);

    // New state for file handling
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    const initialForm = {
        category: 'Curso',
        title: '',
        date: '',
        status: 'Aberto',
        link: '',
        description: '',
        images: []
    };
    const [formData, setFormData] = useState(initialForm);

    // Handle file selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);

        // Create local preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index, isExisting = false) => {
        if (isExisting) {
            // Remove from existing images in formData
            const newImages = formData.images.filter((_, i) => i !== index);
            setFormData({ ...formData, images: newImages });
        } else {
            // Remove from selected files
            const newSelected = selectedFiles.filter((_, i) => i !== index);
            const newPreviews = previewUrls.filter((_, i) => i !== index);
            setSelectedFiles(newSelected);
            setPreviewUrls(newPreviews);
        }
    };

    // Diagnostic: Check connection on mount
    useEffect(() => {
        const checkConnection = async () => {
            console.log("DIAGNOSTIC: Verificando status da conexão com Firebase...");
            try {
                // Try to read auth state
                const user = auth.currentUser;
                console.log("DIAGNOSTIC: Usuário Autenticado:", user ? user.email : "Nenhum (Problema se estiver tentando salvar)");

                // Try a dummy online check (optional, but good)
                const isOnline = window.navigator.onLine;
                console.log("DIAGNOSTIC: Navegador Online:", isOnline);

            } catch (err) {
                console.error("DIAGNOSTIC ERROR:", err);
            }
        };
        checkConnection();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(">>> [1/5] Iniciando submissão...");
        setUploading(true);

        // Safety Timeout extended to 30s
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout (30s): Servidor não respondeu. Verifique Firewall/Internet.")), 30000)
        );

        try {
            const submissionPromise = (async () => {
                const user = auth.currentUser;
                if (!user) throw new Error("Usuário não autenticado. Faça login novamente.");
                console.log(">>> [2/5] Auth OK:", user.email);

                if (formData.link && !formData.link.startsWith('http')) {
                    throw new Error("O link deve ser uma URL válida (http/https)");
                }

                // 1. Upload new files if any
                let uploadedUrls = [];
                if (selectedFiles.length > 0) {
                    console.log(">>> [3/5] Iniciando upload de imagens (Storage)...");
                    uploadedUrls = await uploadFiles(selectedFiles, 'courses');
                    console.log(">>> [3/5] Upload concluído! URLs:", uploadedUrls);
                } else {
                    console.log(">>> [3/5] Nenhuma imagem nova para enviar. Pulando Storage.");
                }

                // 2. Combine existing images with new uploaded URLs
                const finalImages = [...(formData.images || []), ...uploadedUrls];

                // Fallback for backward compatibility
                const mainImage = finalImages.length > 0 ? finalImages[0] : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000';

                const dataToSave = {
                    ...formData,
                    images: finalImages,
                    image: mainImage,
                    updatedAt: new Date().toISOString(),
                    updatedBy: user.email // Audit trail
                };

                console.log(">>> [4/5] Tentando salvar no Firestore (Banco de Dados)...", dataToSave);

                if (currentCourse) {
                    await updateCourse(currentCourse.id, dataToSave);
                } else {
                    await addCourse(dataToSave);
                }

                console.log(">>> [5/5] Firestore respondeu Sucesso!");
                return true;
            })();

            // Race between submission and timeout
            await Promise.race([submissionPromise, timeoutPromise]);

            console.log("Salvo com sucesso!");
            setIsEditing(false);
            setFormData(initialForm);
            setSelectedFiles([]);
            setPreviewUrls([]);
            setCurrentCourse(null);
            alert("Salvo com sucesso!");

        } catch (error) {
            console.error("Erro no processo de salvamento:", error);
            if (error.message.includes("permission-denied") || error.message.includes("Missing or insufficient permissions")) {
                alert("Erro de Permissão: Sua sessão pode ter expirado.\n\nClique em 'Desconectar' e faça login novamente.");
            } else {
                alert(`Erro ao salvar: ${error.message} (Veja Logs F12)`);
            }
        } finally {
            setUploading(false);
            console.log(">>> FIM DO PROCESSO (loading: false)");
        }
    };

    const startEdit = (course) => {
        setCurrentCourse(course);
        const existingImages = course.images || (course.image ? [course.image] : []);
        setFormData({ ...initialForm, ...course, images: existingImages });
        setSelectedFiles([]);
        setPreviewUrls([]);
        setIsEditing(true);
    };

    const getCategoryBadge = (cat) => {
        switch (cat) {
            case 'Formacao': return <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">Formação</span>;
            case 'GrupoEstudos': return <span className="bg-accent/20 text-accent px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">Grupo de Estudos</span>;
            default: return <span className="bg-gold/20 text-primary px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">Curso</span>;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-serif text-primary">Gestão Acadêmica</h2>
                    <p className="text-sage text-sm">Gerencie Cursos, Formações e Grupos de Estudos.</p>
                </div>
                <button
                    onClick={() => { setIsEditing(true); setCurrentCourse(null); setFormData(initialForm); setSelectedFiles([]); setPreviewUrls([]); }}
                    className="bg-accent text-white px-6 py-3 rounded-lg flex items-center gap-2 text-sm font-bold uppercase tracking-wide hover:bg-accent/90 shadow-lg transform hover:-translate-y-1 transition-all"
                >
                    <Plus size={16} /> Novo Item
                </button>
            </div>

            {isEditing && (
                <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 animate-slide-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                    <div className="flex justify-between mb-6">
                        <h3 className="font-bold text-lg text-primary">{currentCourse ? 'Editar Item' : 'Adicionar Novo Item'}</h3>
                        <button onClick={() => setIsEditing(false)}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Categoria</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                    <input type="radio" name="category" value="Curso" checked={formData.category === 'Curso'} onChange={e => setFormData({ ...formData, category: e.target.value })} className="text-accent focus:ring-accent" />
                                    <span className="text-sm font-bold text-primary">Curso Livre</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                    <input type="radio" name="category" value="Formacao" checked={formData.category === 'Formacao'} onChange={e => setFormData({ ...formData, category: e.target.value })} className="text-accent focus:ring-accent" />
                                    <span className="text-sm font-bold text-primary">Formação</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                    <input type="radio" name="category" value="GrupoEstudos" checked={formData.category === 'GrupoEstudos'} onChange={e => setFormData({ ...formData, category: e.target.value })} className="text-accent focus:ring-accent" />
                                    <span className="text-sm font-bold text-primary">Grupo de Estudos</span>
                                </label>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Título</label>
                            <input required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Gestalt-Terapia Avançada" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Data / Horário</label>
                            <input required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} placeholder="Ex: 12 de Maio, 19h" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Status</label>
                            <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                <option value="Aberto">Aberto (Verde)</option>
                                <option value="Esgotado">Esgotado (Vermelho)</option>
                                <option value="Encerrado">Encerrado (Cinza)</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Descrição / Ementa</label>
                            <textarea className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none" rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Breve descrição do curso ou tópicos da ementa..." />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Link do Sympla (Checkout)</label>
                            <input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} placeholder="https://sympla.com.br/..." />
                        </div>

                        {/* Image Upload Section */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Galeria de Imagens</label>

                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Plus className="w-8 h-8 mb-2 text-gray-400" />
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Clique para adicionar fotos</p>
                                    </div>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                                </label>
                            </div>

                            {/* Preview Grid */}
                            <div className="grid grid-cols-4 gap-4 mt-4">
                                {/* Existing Images */}
                                {formData.images && formData.images.map((url, idx) => (
                                    <div key={`existing-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden shadow-sm">
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeFile(idx, true)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X size={12} />
                                        </button>
                                        <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-[9px] font-bold text-center py-1">Salva</div>
                                    </div>
                                ))}

                                {/* New Selected Files */}
                                {previewUrls.map((url, idx) => (
                                    <div key={`new-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden shadow-sm border-2 border-accent/50">
                                        <img src={url} alt="" className="w-full h-full object-cover opacity-80" />
                                        <button type="button" onClick={() => removeFile(idx, false)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X size={12} />
                                        </button>
                                        <div className="absolute bottom-0 left-0 w-full bg-accent text-white text-[9px] font-bold text-center py-1">Nova</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 text-gray-500 hover:text-gray-800 font-medium text-sm">Cancelar</button>
                            <button
                                type="submit"
                                disabled={uploading}
                                className={`bg-primary text-white px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-primary/90 shadow-md font-bold text-sm uppercase tracking-wide ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} /> Salvar Publicação
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {console.log("Rendering AcademicManager, courses:", courses)}
                {courses && courses.map((course, idx) => {
                    try {
                        return (
                            <div key={course.id || idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center group hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center gap-6 w-full md:w-auto mb-4 md:mb-0">
                                    <div className={`w-3 h-3 rounded-full shrink-0 shadow-sm ${course.status === 'Aberto' ? 'bg-green-500 shadow-green-500/50' : course.status === 'Esgotado' ? 'bg-red-500 shadow-red-500/50' : 'bg-gray-400'}`} />

                                    <img src={course.images && course.images.length > 0 ? course.images[0] : (course.image || 'https://via.placeholder.com/50')} className="w-12 h-12 rounded-lg object-cover hidden md:block" alt="" />

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            {getCategoryBadge(course.category || 'Curso')}
                                        </div>
                                        <h4 className="font-bold text-primary text-lg">{course.title}</h4>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{course.date}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full md:w-auto justify-end">
                                    <button onClick={() => startEdit(course)} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors" title="Editar">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => deleteCourse(course.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    } catch (err) {
                        console.error("Error rendering course item:", course, err);
                        return <div key={idx} className="p-4 bg-red-100 text-red-500">Erro ao renderizar item</div>
                    }
                })}
            </div>
        </div>
    );
}

// 2. Google Ecosystem Panel (NEW)
function GoogleIntegrations() {
    const { googleConfig, setGoogleConfig } = useApp();
    const [localConfig, setLocalConfig] = useState(googleConfig);
    const [errors, setErrors] = useState({});

    const validate = (name, value) => {
        if (!value) return "";
        if (name === 'calendarId' && !value.includes('@')) return "ID inválido (deve conter @)";
        if (name === 'driveFolderId' && value.length < 5) return "ID muito curto";
        if (name === 'formsUrl' && !value.startsWith('https://docs.google.com/forms')) return "URL deve ser do Google Forms";
        return "";
    };

    const handleUpdate = (key, value) => {
        const error = validate(key, value);
        setErrors(prev => ({ ...prev, [key]: error }));

        const newConfig = { ...localConfig, [key]: value };
        setLocalConfig(newConfig);

        // Auto-save only if valid
        if (!error) {
            setGoogleConfig(newConfig);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="border-b border-gray-200 pb-5">
                <h2 className="text-3xl font-serif text-primary">Conexões Google</h2>
                <p className="text-sage text-sm">Gerencie o "motor" por trás do seu site.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Google Calendar */}
                <div className={`bg-white p-6 rounded-xl shadow-sm border ${errors.calendarId ? 'border-red-300' : 'border-gray-200'} relative overflow-hidden group hover:border-blue-200 transition-colors`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <LayoutTemplate size={80} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <Calendar size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800">Google Calendar</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Define qual agenda é exibida publicamente na seção "Agenda Viva".</p>
                    <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 text-xs p-3 rounded mb-2 font-mono text-gray-600 focus:ring-1 focus:ring-blue-500 outline-none"
                        value={localConfig.calendarId}
                        onChange={(e) => handleUpdate('calendarId', e.target.value)}
                    />
                    {errors.calendarId ? (
                        <div className="text-red-500 text-xs font-bold">{errors.calendarId}</div>
                    ) : (
                        <div className="flex items-center gap-2 text-green-600 text-xs font-bold">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Conectado via API Simples
                        </div>
                    )}
                </div>

                {/* Google Drive */}
                <div className={`bg-white p-6 rounded-xl shadow-sm border ${errors.driveFolderId ? 'border-red-300' : 'border-gray-200'} relative overflow-hidden group hover:border-green-200 transition-colors`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Database size={80} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                            <Database size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800">Google Drive</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Pasta raiz para o "Portal do Aluno". Arquivos colocados lá aparecem automaticamente.</p>
                    <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 text-xs p-3 rounded mb-2 font-mono text-gray-600 focus:ring-1 focus:ring-green-500 outline-none"
                        value={localConfig.driveFolderId}
                        onChange={(e) => handleUpdate('driveFolderId', e.target.value)}
                    />
                    {errors.driveFolderId && <div className="text-red-500 text-xs font-bold">{errors.driveFolderId}</div>}
                    {!errors.driveFolderId && <button className="text-xs text-primary font-bold hover:underline">Testar Permissões</button>}
                </div>

                {/* Google Forms */}
                <div className={`bg-white p-6 rounded-xl shadow-sm border ${errors.formsUrl ? 'border-red-300' : 'border-gray-200'} relative overflow-hidden group hover:border-purple-200 transition-colors`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <LayoutTemplate size={80} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                            <LayoutTemplate size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800">Google Forms</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Link para o formulário de anamnese/intake clínico.</p>
                    <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 text-xs p-3 rounded mb-2 font-mono text-gray-600 focus:ring-1 focus:ring-purple-500 outline-none"
                        value={localConfig.formsUrl}
                        onChange={(e) => handleUpdate('formsUrl', e.target.value)}
                    />
                    {errors.formsUrl && <div className="text-red-500 text-xs font-bold">{errors.formsUrl}</div>}
                </div>

                {/* Youtube */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden group hover:border-red-200 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Youtube size={80} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                            <Youtube size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800">Youtube Channel</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Canal fonte para vídeos públicos.</p>
                    <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 text-xs p-3 rounded mb-2 font-mono text-gray-600 focus:ring-1 focus:ring-red-500 outline-none"
                        value={localConfig.youtubeId}
                        onChange={(e) => handleUpdate('youtubeId', e.target.value)}
                    />
                </div>

            </div>
        </div>
    );
}

// 3. Settings Manager
function SettingsManager() {
    const { alertMessage, setAlertMessage } = useApp();
    const [tempMsg, setTempMsg] = useState(alertMessage);

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-serif text-primary">Configurações Globais</h2>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gold" />

                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gold/10 p-3 rounded-full text-gold">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-primary">Modo "Férias" / Avisos</h3>
                        <p className="text-xs text-sage">Esta mensagem aparecerá no topo de todas as páginas.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <textarea
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-lg p-4 focus:border-gold focus:outline-none transition-colors text-primary font-medium"
                        rows={3}
                        value={tempMsg}
                        onChange={e => setTempMsg(e.target.value)}
                        placeholder="Ex: Estamos em recesso até dia 15/01. Agendamentos apenas via WhatsApp."
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 italic">
                            {tempMsg ? 'Status: Ativo' : 'Status: Inativo'}
                        </span>
                        <button
                            onClick={() => setAlertMessage(tempMsg)}
                            className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Publicar no Site
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 4. Blog & Library Manager
function BlogManager() {
    const { blogPosts, refreshData } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [currentPost, setCurrentPost] = useState(null);

    const initialForm = {
        type: 'blog',
        title: '',
        slug: '',
        category: '',
        date: new Date().toLocaleDateString('pt-BR'),
        image: '',
        excerpt: '',
        content: '',
        reference: '',
        featured: false
    };
    const [formData, setFormData] = useState(initialForm);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentPost) {
                await blogService.update(currentPost.id, formData);
            } else {
                const dataToSave = { ...formData };
                if (!dataToSave.slug) {
                    dataToSave.slug = dataToSave.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                }
                await blogService.create(dataToSave);
            }
            await refreshData();
            setIsEditing(false);
            setFormData(initialForm);
            setCurrentPost(null);
            alert("Salvo com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar: " + error.message);
        }
    };

    const startEdit = (post) => {
        setCurrentPost(post);
        setFormData(post);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Sim, tenho certeza.")) {
            await blogService.delete(id);
            await refreshData();
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-serif text-primary">Diário Visual & Biblioteca</h2>
                    <p className="text-sage text-sm">Gerencie artigos do Blog e itens da Biblioteca (PDFs).</p>
                </div>
                <button
                    onClick={() => { setIsEditing(true); setCurrentPost(null); setFormData(initialForm); }}
                    className="bg-accent text-white px-6 py-3 rounded-lg flex items-center gap-2 text-sm font-bold uppercase tracking-wide hover:bg-accent/90 shadow-lg transform hover:-translate-y-1 transition-all"
                >
                    <Plus size={16} /> Nova Publicação
                </button>
            </div>

            {isEditing && (
                <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 animate-slide-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                    <div className="flex justify-between mb-6">
                        <h3 className="font-bold text-lg text-primary">{currentPost ? 'Editar Publicação' : 'Nova Publicação'}</h3>
                        <button onClick={() => setIsEditing(false)}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Tipo de Conteúdo</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                    <input type="radio" name="type" value="blog" checked={formData.type === 'blog'} onChange={e => setFormData({ ...formData, type: e.target.value })} className="text-accent focus:ring-accent" />
                                    <span className="text-sm font-bold text-gray-700">Blog Post</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                    <input type="radio" name="type" value="library" checked={formData.type === 'library'} onChange={e => setFormData({ ...formData, type: e.target.value })} className="text-accent focus:ring-accent" />
                                    <span className="text-sm font-bold text-gray-700">Item da Biblioteca (PDF)</span>
                                </label>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Título</label>
                            <input required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Categoria</label>
                            <input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="Ex: Artigo Técnico" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Data</label>
                            <input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Imagem de Capa (URL)</label>
                            <input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Resumo (Excerpt)</label>
                            <textarea className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none" rows={2} value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} />
                        </div>

                        {formData.type === 'library' && (
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Referência Bibliográfica</label>
                                <textarea className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none" rows={2} value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} />
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Conteúdo HTML (Texto Completo)</label>
                            <textarea className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none font-mono text-sm" rows={10} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
                            <p className="text-[10px] text-gray-400 mt-1">Aceita tags HTML básicas (p, b, i, ul, li).</p>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 text-gray-500 hover:text-gray-800 font-medium text-sm">Cancelar</button>
                            <button type="submit" className="bg-primary text-white px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-primary/90 shadow-md font-bold text-sm uppercase tracking-wide">
                                <Save size={16} /> Salvar Publicação
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {blogPosts.map(post => (
                    <div key={post.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center group hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-6 w-full md:w-auto mb-4 md:mb-0">
                            <div className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white text-xs ${post.type === 'library' ? 'bg-accent' : 'bg-primary'}`}>
                                {post.type === 'library' ? 'LIB' : 'BLOG'}
                            </div>
                            <div>
                                <h4 className="font-bold text-primary text-lg">{post.title}</h4>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{post.category} • {post.date}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto justify-end">
                            <button onClick={() => startEdit(post)} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors" title="Editar">
                                <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(post.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {blogPosts.length === 0 && (
                    <div className="text-center p-12 text-gray-400">Nenhuma publicação encontrada.</div>
                )}
            </div>
        </div>
    );
}

// --- Main Layout ---
export default function AdminDashboard() {
    const { logout } = useApp();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Visão Geral', path: '/admin' },
        { icon: BookOpen, label: 'Acadêmico', path: '/admin/academic' },
        { icon: Globe, label: 'Google Suite', path: '/admin/google' },
        { icon: PenTool, label: 'Diário Visual', path: '/admin/blog' },
        { icon: Settings, label: 'Configurações', path: '/admin/settings' },
    ];

    return (
        <div className="flex min-h-screen bg-surface">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-72 md:w-80 bg-[#FDFBF7] border-r border-[#EFECE5] text-primary flex flex-col fixed h-full z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-8 md:p-12 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <img src="/assets/logo.jpeg" alt="" className="w-10 h-10 rounded-full border border-primary/10 shadow-sm" />
                            <h1 className="font-serif text-2xl md:text-3xl tracking-tight text-primary">Figura <span className="font-light text-gold italic">Viva</span></h1>
                        </div>
                        <div className="flex items-center gap-2 opacity-50">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-primary/60">Admin Panel v2.1</p>
                        </div>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-primary/50 hover:text-primary">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-8 space-y-2">
                    {navItems.map(item => {
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-6 py-5 rounded-[1.25rem] transition-all duration-300 group relative ${isActive ? 'bg-primary/5 text-primary font-bold shadow-sm' : 'text-primary/50 hover:text-primary hover:bg-primary/5'}`}
                            >
                                <item.icon size={18} className={`transition-transform duration-500 ${isActive ? 'text-primary' : 'group-hover:scale-110 text-primary/40'}`} />
                                <span className="text-[11px] font-bold uppercase tracking-widest">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute right-4 w-1.5 h-1.5 bg-primary rounded-full"
                                    />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-8 border-t border-primary/5">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-4 px-6 py-5 bg-red-50 text-red-400 hover:bg-red-100 rounded-2xl transition-soft text-[10px] font-bold uppercase tracking-[0.2em] group"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Desconectar
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-80 p-6 md:p-16 overflow-y-auto min-h-screen transition-all bg-[#FBFAEC]">
                <header className="mb-10 md:mb-16 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 -ml-2 text-primary hover:bg-primary/5 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h2 className="font-serif text-2xl md:text-4xl text-primary mb-2">Painel de Controle</h2>
                            <p className="text-primary/40 text-xs md:text-sm font-light hidden md:block">Gerencie sua presença digital e conexões Google.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white border border-primary/5 flex items-center justify-center text-primary/30 shadow-sm">
                            <Settings size={20} />
                        </div>
                    </div>
                </header>

                <div className="max-w-6xl">
                    <Routes>
                        <Route path="/" element={
                            <div className="grid md:grid-cols-2 gap-8 py-10 animate-fade-in">
                                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-primary/5 flex flex-col justify-center items-center text-center">
                                    <div className="w-20 h-20 bg-[#F5F2EA] rounded-full flex items-center justify-center text-gold mb-8">
                                        <LayoutDashboard size={32} />
                                    </div>
                                    <h2 className="font-serif text-4xl text-primary mb-4">Seja bem-vinda de volta.</h2>
                                    <p className="text-primary/50 max-w-sm font-light leading-relaxed">Seu site está funcionando perfeitamente e conectado a todos os serviços Google.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-[#E6F4EA] p-8 rounded-[2rem] border border-[#D5EADBC0] flex flex-col justify-between text-[#2E5C38]">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Status do Site</span>
                                        <div className="flex items-center gap-2">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                            </span>
                                            <h4 className="text-3xl font-serif">Online</h4>
                                        </div>
                                    </div>
                                    <div className="bg-[#FAF8F5] p-8 rounded-[2rem] border border-[#EFECE5] flex flex-col justify-between shadow-sm">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40">Versão</span>
                                        <h4 className="text-3xl font-serif text-primary italic">2.1.0</h4>
                                    </div>
                                </div>
                            </div>
                        } />
                        <Route path="/academic" element={<AcademicManager />} />
                        <Route path="/google" element={<GoogleIntegrations />} />
                        <Route path="/blog" element={<BlogManager />} />
                        <Route path="/settings" element={<SettingsManager />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}
