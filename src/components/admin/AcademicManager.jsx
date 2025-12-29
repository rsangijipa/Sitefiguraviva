import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { uploadFiles } from '../../services/uploadService';
import { auth } from '../../services/firebase';
import CourseModal from './CourseModal';


export default function AcademicManager() {
    const context = useApp();
    const { courses, addCourse, updateCourse, deleteCourse, showToast } = context || {};

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
            showToast("Salvo com sucesso!", "success");

        } catch (error) {
            console.error("Erro no processo de salvamento:", error);
            if (error.message.includes("permission-denied") || error.message.includes("Missing or insufficient permissions")) {
                showToast("Sessão expirada. Faça login novamente.", "error");
            } else {
                showToast(`Erro ao salvar: ${error.message}`, "error");
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
                    onClick={() => { setIsEditing(true); setCurrentCourse(null); }}
                    className="bg-accent text-white px-6 py-3 rounded-lg flex items-center gap-2 text-sm font-bold uppercase tracking-wide hover:bg-accent/90 shadow-lg transform hover:-translate-y-1 transition-all"
                >
                    <Plus size={16} /> Novo Item
                </button>
            </div>

            <CourseModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                courseToEdit={currentCourse}
            />

            <div className="grid gap-4">
                {courses && courses.map((course, idx) => {
                    const isStatic = isNaN(course.id) && !course.id?.toString().includes('firebase'); // Heuristic for static vs dynamic if IDs are strings like 'experiencia-atemporal'

                    return (
                        <div key={course.id || idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center group hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center gap-6 w-full md:w-auto mb-4 md:mb-0">
                                <div className={`w-3 h-3 rounded-full shrink-0 shadow-sm ${course.status === 'Aberto' ? 'bg-green-500 shadow-green-500/50' : course.status === 'Esgotado' ? 'bg-red-500 shadow-red-500/50' : 'bg-gray-400'}`} />

                                <img src={course.images && course.images.length > 0 ? course.images[0] : (course.image || 'https://via.placeholder.com/50')} className="w-12 h-12 rounded-lg object-cover hidden md:block" alt="" />

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {getCategoryBadge(course.category || 'Curso')}
                                        {/* Identify source for transparency */}
                                        {/* <span className="text-[9px] uppercase tracking-widest text-gray-300 border px-1 rounded">{typeof course.id === 'string' && course.id.length > 10 ? 'DB' : 'Static'}</span> */}
                                    </div>
                                    <h4 className="font-bold text-primary text-lg">{course.title}</h4>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{course.date}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto justify-end">
                                <button onClick={() => { setCurrentCourse(course); setIsEditing(true); }} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors" title="Editar Completo">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => deleteCourse(course.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
