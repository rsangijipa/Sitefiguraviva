"use client";

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Trash2, Save, X, Search, FileText, Download, Loader2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadFiles } from '../../../services/uploadServiceSupabase'; // Adjust path if needed
import { useToast } from '@/context/ToastContext';

export default function DocumentManager() {
    const { documents, addDocument, deleteDocument } = useApp();
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    // Form State
    const initialForm = {
        title: '',
        category: 'documents', // Default category
        file_url: '',
        file_size: '',
        file_type: ''
    };
    const [formData, setFormData] = useState(initialForm);
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Filter Logic
    const filteredDocuments = documents ? documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    }) : [];

    const categories = [
        { id: 'documents', label: 'Documentos' },
        { id: 'portal', label: 'Portal Aluno' },
        { id: 'financeiro', label: 'Financeiro' },
        { id: 'outros', label: 'Outros' }
    ];

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        setUploading(true);
        try {
            // Upload to 'documents' bucket
            const urls = await uploadFiles([file], 'documents');
            const url = urls[0];

            // Calculate size string
            const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
            const sizeStr = sizeInMB + ' MB';
            const typeStr = file.name.split('.').pop() || 'file';

            setFormData(prev => ({
                ...prev,
                file_url: url,
                file_size: sizeStr,
                file_type: typeStr
            }));
            addToast("Arquivo enviado com sucesso!", 'success');
        } catch (error) {
            console.error("Upload error:", error);
            addToast("Erro ao enviar arquivo.", 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!formData.file_url) {
                addToast('Por favor, faça o upload de um arquivo.', 'error');
                return;
            }

            const success = await addDocument(formData);
            if (success) {
                addToast('Documento adicionado com sucesso!', 'success');
                setFormData(initialForm);
                setIsAdding(false);
            } else {
                addToast('Erro ao salvar documento.', 'error');
            }
        } catch (error) {
            console.error("Error saving document:", error);
            addToast('Erro ao salvar documento.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este documento?')) return;
        const success = await deleteDocument(id);
        if (success) {
            addToast('Documento excluído!', 'success');
        } else {
            addToast('Erro ao excluir documento.', 'error');
        }
    };

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h3 className="font-serif text-3xl mb-2 text-primary">Gerenciador de Arquivos</h3>
                    <p className="text-primary/40 text-sm max-w-lg">
                        Adicione arquivos PDF e documentos para o Portal do Aluno.
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-primary text-paper px-8 py-4 rounded-xl flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-soft hover:shadow-xl transform active:scale-95 shadow-lg border border-primary/10"
                >
                    <Plus size={16} /> Novo Arquivo
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
                                onClick={() => handleDelete(doc.id)}
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
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 ml-2">Arquivo (PDF/Doc)</label>
                                    <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-stone-50 transition-colors relative">
                                        <input
                                            type="file"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept=".pdf,.doc,.docx"
                                        />
                                        {uploading ? (
                                            <div className="flex flex-col items-center gap-2 text-gold">
                                                <Loader2 className="animate-spin" />
                                                <span className="text-xs font-bold">Enviando...</span>
                                            </div>
                                        ) : formData.file_url ? (
                                            <div className="flex flex-col items-center gap-2 text-green-600">
                                                <FileText size={24} />
                                                <span className="text-xs font-bold">Arquivo selecionado!</span>
                                                <span className="text-[10px] text-stone-400">{formData.file_size}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <Upload size={24} />
                                                <span className="text-xs font-bold">Clique para upload</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || uploading || !formData.file_url}
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
