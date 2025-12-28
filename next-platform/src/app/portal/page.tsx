"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, PlayCircle, Folder, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Mock Data (Replace with real Drive API later)
const RESOURCES = [
    { id: 1, title: "Apostila Módulo 1 - Fundamentos", type: "pdf", size: "2.4 MB", date: "12 Mar 2024" },
    { id: 2, title: "Aula 03: O Campo Organismo-Ambiente", type: "video", size: "45 min", date: "10 Mar 2024" },
    { id: 3, title: "Texto: A Fome de Perls", type: "doc", size: "150 KB", date: "08 Mar 2024" },
    { id: 4, title: "Supervisão Gravada - Turma A", type: "audio", size: "1h 20m", date: "01 Mar 2024" },
    { id: 5, title: "Cronograma 2024.1", type: "pdf", size: "500 KB", date: "20 Fev 2024" },
    { id: 6, title: "Bibliografia Comentada", type: "doc", size: "1.2 MB", date: "15 Fev 2024" },
];

export default function StudentPortal() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('todos');

    const filteredResources = RESOURCES.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (activeTab === 'todos' || resource.type === activeTab)
    );

    const getIcon = (type) => {
        switch (type) {
            case 'pdf': return <FileText className="text-red-400" size={24} />;
            case 'video': return <PlayCircle className="text-red-500" size={24} />;
            case 'audio': return <PlayCircle className="text-purple-500" size={24} />; // Using PlayCircle for audio for now
            default: return <FileText className="text-blue-400" size={24} />;
        }
    };

    return (
        <div className="min-h-screen bg-paper pt-24 pb-20">
            <div className="container mx-auto px-6 max-w-6xl">

                {/* Header */}
                <header className="mb-12">
                    <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 hover:text-gold transition-colors mb-8">
                        <ArrowLeft size={14} /> Voltar para Home
                    </Link>

                    <div className="bg-primary text-paper rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />

                        <div className="relative z-10">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-6 backdrop-blur-md border border-white/5">
                                Área do Aluno
                            </span>
                            <h1 className="font-serif text-4xl md:text-6xl mb-6">Biblioteca de <span className="italic text-gold font-light">Recursos</span></h1>
                            <p className="text-paper/60 font-light max-w-xl text-lg text-balance">
                                Acesse materiais didáticos, gravações de aulas e textos complementares da sua formação.
                            </p>
                        </div>
                    </div>
                </header>

                {/* Dashboard Controls */}
                <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">

                    {/* Search */}
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-gold transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar material..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-primary/5 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold/50 transition-all shadow-sm group-hover:shadow-md text-primary placeholder-primary/30"
                            aria-label="Buscar material"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-white p-1.5 rounded-xl border border-primary/5 shadow-sm overflow-x-auto max-w-full">
                        {['todos', 'pdf', 'video', 'doc'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab
                                        ? 'bg-primary text-paper shadow-md'
                                        : 'text-primary/40 hover:bg-gray-50 hover:text-primary'
                                    }`}
                                aria-current={activeTab === tab ? 'page' : undefined}
                            >
                                {tab === 'todos' ? 'Todos' : tab.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Resources Grid */}
                {filteredResources.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredResources.map((resource, idx) => (
                            <motion.div
                                key={resource.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group bg-white p-6 rounded-[2rem] border border-primary/5 hover:border-gold/30 hover:shadow-[0_20px_40px_-10px_rgba(197,160,101,0.15)] transition-all cursor-pointer flex flex-col justify-between h-48"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-gold/10 transition-colors">
                                        {getIcon(resource.type)}
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-paper p-2 rounded-full transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 duration-300">
                                        <Download size={14} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-serif text-xl text-primary mb-2 line-clamp-2 group-hover:text-accent transition-colors">{resource.title}</h3>
                                    <div className="flex items-center gap-4 text-[10px] text-primary/40 font-bold uppercase tracking-wider">
                                        <span>{resource.type}</span>
                                        <span className="w-1 h-1 bg-gold rounded-full" />
                                        <span>{resource.size}</span>
                                        <span className="w-1 h-1 bg-gold rounded-full" />
                                        <span>{resource.date}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-20 opacity-50">
                        <Folder size={48} className="mx-auto mb-4 text-sage" />
                        <p className="font-serif text-xl">Nenhum material encontrado.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
