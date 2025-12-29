import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, RefreshCw } from 'lucide-react';
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
    const [syncing, setSyncing] = useState(false);

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

    const handleDelete = async (course) => {
        if (!window.confirm(`Tem certeza que deseja excluir "${course.title}"? Isso removerá a pasta do servidor local (se existir).`)) return;

        try {
            // Attempt to delete local folder
            console.log("Deleting local folder if exists...", course.id);
            await fetch('/api/delete-course', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: course.id })
            });

            // Delete from State/Firebase
            await deleteCourse(course.id);
            showToast("Curso removido com sucesso.", "success");
        } catch (error) {
            console.error("Delete error:", error);
            showToast("Erro ao excluir: " + error.message, "error");
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch('/api/sync-courses');
            if (res.ok) {
                showToast("Sincronização concluída! Recarregando...", "success");
                setTimeout(() => window.location.reload(), 1500);
            } else {
                throw new Error("Falha na sincronização");
            }
        } catch (error) {
            showToast("Erro ao sincronizar.", "error");
        } finally {
            setSyncing(false);
        }
    };

    const startEdit = (course) => {
        setCurrentCourse(course);
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
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-serif text-primary">Gestão Acadêmica</h2>
                    <p className="text-sage text-sm">Gerencie Cursos, Formações e Grupos de Estudos.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="bg-white border border-gray-200 text-gray-600 px-4 py-3 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wide hover:bg-gray-50 transition-all"
                    >
                        <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
                        {syncing ? "Sincronizando..." : "Sincronizar"}
                    </button>
                    <button
                        onClick={() => { setIsEditing(true); setCurrentCourse(null); }}
                        className="bg-accent text-white px-6 py-3 rounded-lg flex items-center gap-2 text-sm font-bold uppercase tracking-wide hover:bg-accent/90 shadow-lg transform hover:-translate-y-1 transition-all"
                    >
                        <Plus size={16} /> Novo Item
                    </button>
                </div>
            </div>

            <CourseModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                courseToEdit={currentCourse}
            />

            <div className="grid gap-4">
                {courses && courses.map((course, idx) => {
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
                                <button onClick={() => startEdit(course)} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors" title="Editar Completo">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => handleDelete(course)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
                {courses.length === 0 && (
                    <div className="p-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        Nenhum curso encontrado. Adicione um novo ou clique em Sincronizar.
                    </div>
                )}
            </div>
        </div>
    );
}
