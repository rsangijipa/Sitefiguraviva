import { useState } from 'react';
import { Folder, FileText, Download, Search, Image as ImageIcon, Video } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function StudentPortal() {
    const [activeFolder, setActiveFolder] = useState('all');

    // Simulated Google Drive Data Structure
    const resources = [
        { id: 1, name: "Cronograma 2024.pdf", type: 'pdf', folder: 'admin', size: '1.2 MB' },
        { id: 2, name: "Aula 1 - Histórico da Gestalt.mp4", type: 'video', folder: 'videos', size: '450 MB' },
        { id: 3, name: "Texto Base - Perls.pdf", type: 'pdf', folder: 'texts', size: '2.4 MB' },
        { id: 4, name: "Ficha de Supervisão.docx", type: 'doc', folder: 'admin', size: '150 KB' },
        { id: 5, name: "Dinâmica de Grupo.png", type: 'image', folder: 'images', size: '3.1 MB' },
        { id: 6, name: "Artigo - Awareness.pdf", type: 'pdf', folder: 'texts', size: '800 KB' }
    ];

    const folders = [
        { id: 'all', label: 'Todos os Arquivos' },
        { id: 'texts', label: 'Textos & Artigos' },
        { id: 'videos', label: 'Aulas Gravadas' },
        { id: 'admin', label: 'Administrativo' },
    ];

    const filteredResources = activeFolder === 'all'
        ? resources
        : resources.filter(res => res.folder === activeFolder);

    return (
        <div className="bg-paper min-h-screen flex flex-col font-sans text-primary">
            <Navbar />

            <main className="flex-grow container mx-auto px-6 py-40">
                <div className="mb-20 text-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10" />
                    <span className="text-accent font-bold uppercase tracking-[0.4em] text-[10px] mb-6 block">Comunidade Figura Viva</span>
                    <h1 className="font-serif text-5xl md:text-7xl mb-8">Drive Institucional</h1>
                    <p className="text-primary/60 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                        Acesso seguro ao material didático, integrado com Google Drive.
                        Documentos sincronizados em tempo real para sua formação.
                    </p>
                </div>

                {/* Interface similar to Google Drive but Premium */}
                <div className="bg-white rounded-[2.5rem] shadow-[0_60px_100px_-20px_rgba(38,58,58,0.1)] overflow-hidden border border-primary/5 min-h-[700px] flex flex-col md:flex-row glass">

                    {/* Sidebar */}
                    <aside className="w-full md:w-80 bg-gray-50/50 p-10 border-r border-primary/5 backdrop-blur-sm">
                        <div className="mb-12">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-accent transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar material..."
                                    className="w-full bg-white border border-primary/5 py-4 pl-12 pr-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-light shadow-sm"
                                />
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {folders.map(folder => (
                                <button
                                    key={folder.id}
                                    onClick={() => setActiveFolder(folder.id)}
                                    className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 text-xs font-bold uppercase tracking-widest transition-soft ${activeFolder === folder.id
                                        ? 'bg-primary text-paper shadow-xl scale-[1.02]'
                                        : 'text-primary/40 hover:bg-white hover:text-primary'
                                        }`}
                                >
                                    <Folder size={18} className={activeFolder === folder.id ? 'fill-gold' : ''} />
                                    {folder.label}
                                </button>
                            ))}
                        </nav>

                        <div className="mt-20 pt-10 border-t border-primary/5">
                            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/5">
                                <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest mb-4">Espaço em Nuvem</p>
                                <div className="w-full bg-primary/10 h-1.5 rounded-full mb-4 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '70%' }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="bg-gold h-full rounded-full shadow-[0_0_10px_rgba(197,160,101,0.5)]"
                                    />
                                </div>
                                <p className="text-[10px] text-primary/60 font-medium tracking-wide">70% utilizado de 15GB</p>
                            </div>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <section className="flex-1 p-10 md:p-16">
                        <div className="flex justify-between items-center mb-12">
                            <h2 className="font-serif text-3xl text-primary capitalize">
                                {folders.find(f => f.id === activeFolder)?.label || 'Arquivos'}
                            </h2>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-sage uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Sincronizado agora
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredResources.map(file => (
                                <motion.div
                                    key={file.id}
                                    whileHover={{ y: -8 }}
                                    className="group bg-white border border-primary/5 rounded-[2rem] p-6 transition-soft cursor-pointer relative overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/5"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-2xl shadow-sm ${file.type === 'pdf' ? 'bg-red-50 text-red-500' :
                                            file.type === 'video' ? 'bg-purple-50 text-purple-500' :
                                                file.type === 'image' ? 'bg-blue-50 text-blue-500' :
                                                    'bg-sage/10 text-sage'
                                            }`}>
                                            {file.type === 'pdf' && <FileText size={24} />}
                                            {file.type === 'video' && <Video size={24} />}
                                            {file.type === 'image' && <ImageIcon size={24} />}
                                            {file.type === 'doc' && <FileText size={24} />}
                                        </div>
                                        <button className="text-primary/20 hover:text-accent transition-colors p-2 glass rounded-full opacity-0 group-hover:opacity-100 transition-soft">
                                            <Download size={18} />
                                        </button>
                                    </div>

                                    <h3 className="font-bold text-primary text-sm mb-2 truncate group-hover:text-accent transition-colors">{file.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-bold text-primary/30 uppercase tracking-widest">{file.size}</span>
                                        <span className="w-1 h-1 rounded-full bg-primary/20" />
                                        <span className="text-[9px] font-bold text-primary/30 uppercase tracking-widest">Acesso Público</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>

            </main>

            <Footer />
        </div>
    );
}
