"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Folder, FileText, Download, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PDFReader from '@/components/PDFReader';

export default function StudentPortal() {
    const [activeFolder, setActiveFolder] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPdf, setSelectedPdf] = useState<any>(null);

    const resources = [
        {
            id: 'doc-1',
            name: "As polaridades do feminino na contemporaneidade e a depressão pós-parto uma visão gestáltica.pdf",
            title: "As polaridades do feminino na contemporaneidade e a depressão pós-parto: uma visão gestáltica",
            type: 'pdf',
            folder: 'documents',
            path: '/documents/As polaridades do feminino na contemporaneidade e a depressão pós-parto uma visão gestáltica.pdf',
            size: '220 KB'
        }
    ];

    const folders = [
        { id: 'all', label: 'Todos os Arquivos' },
        { id: 'documents', label: 'Documentos' },
        { id: 'portal', label: 'Portal Aluno' },
    ];

    const filteredResources = resources.filter(res => {
        const matchesFolder = activeFolder === 'all' || res.folder === activeFolder;
        const matchesSearch = res.name.toLowerCase().includes(searchTerm.toLowerCase()) || res.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFolder && matchesSearch;
    });

    const handleOpenPdf = (file: any) => {
        if (file.type === 'pdf') {
            setSelectedPdf({
                title: file.title || file.name,
                pdfUrl: file.path
            });
        }
    };

    return (
        <div className="bg-paper min-h-screen flex flex-col font-sans text-primary">
            <Navbar />

            <main className="flex-grow container mx-auto px-6 py-28 md:py-40">
                <div className="mb-20 text-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10" />
                    <span className="text-accent font-bold uppercase tracking-[0.4em] text-[10px] mb-6 block">Comunidade Figura Viva</span>
                    <h1 className="font-serif text-5xl md:text-7xl mb-8">Drive Institucional</h1>
                    <p className="text-primary/60 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                        Acesso seguro ao material didático e documentos institucionais.
                    </p>
                </div>

                <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-[0_60px_100px_-20px_rgba(38,58,58,0.1)] overflow-hidden border border-primary/5 min-h-[700px] flex flex-col md:flex-row backdrop-blur-md">
                    <aside className="w-full md:w-80 bg-gray-50/50 p-10 border-r border-primary/5 backdrop-blur-sm">
                        <div className="mb-12">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-accent transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar material..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white border border-primary/5 py-4 pl-12 pr-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-light shadow-sm"
                                />
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {folders.map(folder => (
                                <button
                                    key={folder.id}
                                    onClick={() => setActiveFolder(folder.id)}
                                    className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 text-xs font-bold uppercase tracking-widest transition-all ${activeFolder === folder.id
                                        ? 'bg-primary text-paper shadow-xl scale-[1.02]'
                                        : 'text-primary/40 hover:bg-white hover:text-primary'
                                        }`}
                                >
                                    <Folder size={18} className={activeFolder === folder.id ? 'text-gold fill-gold' : ''} />
                                    {folder.label}
                                </button>
                            ))}
                        </nav>

                        <div className="mt-20 pt-10 border-t border-primary/5">
                            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/5">
                                <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest mb-4">Atualizações</p>
                                <p className="text-xs text-primary/60">Novos materiais são adicionados regularmente.</p>
                            </div>
                        </div>
                    </aside>

                    <section className="flex-1 p-6 md:p-16">
                        <div className="flex justify-between items-center mb-12">
                            <h2 className="font-serif text-3xl text-primary capitalize">
                                {folders.find(f => f.id === activeFolder)?.label || 'Arquivos'}
                            </h2>
                            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Sistema Online
                            </div>
                        </div>

                        {filteredResources.length === 0 ? (
                            <div className="text-center py-20 opacity-50">
                                <Folder size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>Nenhum arquivo encontrado nesta pasta.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredResources.map(file => (
                                    <motion.div
                                        key={file.id}
                                        whileHover={{ y: -8 }}
                                        onClick={() => handleOpenPdf(file)}
                                        className="group bg-white border border-primary/5 rounded-[2rem] p-6 transition-all cursor-pointer relative overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/5"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`p-4 rounded-2xl shadow-sm ${file.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-gold/10 text-gold'}`}>
                                                <FileText size={24} />
                                            </div>
                                            <a
                                                href={file.path}
                                                download
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-primary/20 hover:text-accent transition-colors p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                                title="Baixar Arquivo"
                                            >
                                                <Download size={18} />
                                            </a>
                                        </div>

                                        <h3 className="font-bold text-primary text-sm mb-2 line-clamp-2 leading-relaxed group-hover:text-gold transition-colors" title={file.name}>
                                            {file.title || file.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-4 text-[9px] font-bold text-primary/30 uppercase tracking-widest">
                                            <span>{file.size}</span>
                                            <span className="w-1 h-1 rounded-full bg-primary/20" />
                                            <span>{file.type.toUpperCase()}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <Footer />

            <PDFReader
                isOpen={!!selectedPdf}
                onClose={() => setSelectedPdf(null)}
                article={selectedPdf}
            />
        </div>
    );
}
