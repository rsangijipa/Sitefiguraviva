"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, X, Search, FileText, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';
import { db, storage } from '@/lib/firebase/client';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import FileUpload from '@/components/admin/FileUpload';

export default function DocumentManager() {
    const [documents, setDocuments] = useState<any[]>([]);
    const { user } = useAuth();
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    // Fetch documents manually since we might not have a hook yet
    useEffect(() => {
        const q = query(collection(db, 'publicDocs'), orderBy('created_at', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDocuments(docs);
        });
        return () => unsubscribe();
    }, []);

    // Form State
    const initialForm = {
        title: '',
        category: 'public', // Default category
        file_url: '',
        file_path: '',
        file_size: '',
        file_type: 'pdf',
        isPublished: true // Public docs usually default to published
    };
    const [formData, setFormData] = useState(initialForm);
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter Logic
    const filteredDocuments = documents ? documents.filter(doc => {
        const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    }) : [];

    const categories = [
        { id: 'public', label: 'Público' },
        { id: 'institucional', label: 'Institucional' },
        { id: 'editais', label: 'Editais' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!formData.file_url) {
                addToast('Por favor, envie um arquivo PDF.', 'error');
                setIsSubmitting(false);
                return;
            }

            // Document creation in Firestore
            await addDoc(collection(db, 'publicDocs'), {
                ...formData,
                created_at: serverTimestamp(),
                createdBy: user?.uid
            });

            addToast('Documento público adicionado!', 'success');
            setFormData(initialForm);
            setIsAdding(false);

        } catch (error) {
            console.error("Error saving document:", error);
            addToast('Erro ao salvar documento.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (docObj: any) => {
        if (!confirm('Tem certeza que deseja excluir este documento?')) return;
        try {
            // 1. Delete from Firestore
            await deleteDoc(doc(db, 'publicDocs', docObj.id));

            // 2. Delete from Storage if path exists
            if (docObj.file_path) {
                const fileRef = ref(storage, docObj.file_path);
                await deleteObject(fileRef).catch(err => {
                    console.warn("Storage file not found or already deleted:", err);
                });
            }

            addToast('Documento excluído!', 'success');
        } catch (error) {
            console.error("Delete error", error);
            addToast('Erro ao excluir documento.', 'error');
        }
    };

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h3 className="font-serif text-3xl mb-2 text-primary">Documentos Públicos</h3>
                    <p className="text-primary/40 text-sm max-w-lg">
                        Adicione arquivos institucionais públicos (Editais, Manuais, etc).
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-primary text-paper px-8 py-4 rounded-xl flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-soft hover:shadow-xl transform active:scale-95 shadow-lg border border-primary/10"
                >
                    <Plus size={16} /> Novo Documento
                </button>
            </header>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-6 items-end bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-stone-200/60 shadow-sm">
                <div className="flex-1 w-full space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 ml-2">Buscar</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar por título..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl pl-12 pr-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                        />
                    </div>
                </div>
                <div className="w-full md:w-64 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 ml-2">Categoria</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-gold cursor-pointer"
                    >
                        <option value="Todos">Todas</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((doc: any) => (
                    <div key={doc.id} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-lg transition-all group relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary/5 text-primary rounded-xl">
                                <FileText size={24} />
                            </div>
                            <button
                                onClick={() => handleDelete(doc)}
                                className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <h4 className="font-bold text-primary mb-1 line-clamp-2">{doc.title}</h4>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gold mb-4 block">{doc.category}</span>

                        <div className="flex items-center gap-4 text-xs text-stone-400 mt-4 border-t border-stone-100 pt-4">
                            <span>{doc.file_size || 'Unknown'}</span>
                            <span className="w-1 h-1 rounded-full bg-stone-300" />
                            <span className="uppercase">{doc.file_type || 'FILE'}</span>

                            <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto flex items-center gap-1 text-primary hover:text-gold font-bold transition-colors"
                            >
                                <Download size={14} /> Baixar
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm"
                    >
                        <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-stone-50/50">
                                <h3 className="font-serif text-2xl text-primary">Novo Documento</h3>
                                <button onClick={() => setIsAdding(false)}><X size={24} className="text-primary/40 hover:text-primary transition-colors" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 ml-2">Título do Arquivo</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-all"
                                        placeholder="Ex: Calendário Acadêmico 2024"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 ml-2">Categoria</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-all"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 ml-2">Arquivo (PDF)</label>
                                    <FileUpload
                                        folder="public/docs"
                                        defaultFile={formData.file_url}
                                        defaultName={formData.title} // Or filename if we kept it separately
                                        onUpload={(data) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                file_url: data.url,
                                                file_path: data.path,
                                                file_size: data.size,
                                                file_type: 'pdf'
                                            }));
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !formData.file_url}
                                    className="w-full bg-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-4"
                                >
                                    {isSubmitting ? 'Salvando...' : 'Adicionar Documento'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

}
