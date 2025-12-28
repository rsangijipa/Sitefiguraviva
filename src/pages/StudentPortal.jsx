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
        <div className="bg-paper min-h-screen flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-6 py-32">
                <div className="mb-12 text-center">
                    <span className="text-accent font-bold uppercase tracking-widest text-xs mb-2 block">Área do Aluno</span>
                    <h1 className="font-serif text-4xl mb-4 text-primary">Drive Institucional</h1>
                    <p className="text-sage max-w-xl mx-auto">
                        Acesso seguro ao material didático, integrado com Google Drive.
                        Documentos sincronizados em tempo real.
                    </p>
                </div>

                {/* Interface similar to Google Drive */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-[600px] flex flex-col md:flex-row">

                    {/* Sidebar */}
                    <aside className="w-full md:w-64 bg-gray-50 p-6 border-r border-gray-100">
                        <div className="mb-8">
                            <button className="w-full bg-white border border-gray-200 shadow-sm text-primary font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                                <Search size={16} /> Buscar Arquivo
                            </button>
                        </div>

                        <nav className="space-y-1">
                            {folders.map(folder => (
                                <button
                                    key={folder.id}
                                    onClick={() => setActiveFolder(folder.id)}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${activeFolder === folder.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    <Folder size={18} className={activeFolder === folder.id ? 'fill-primary' : ''} />
                                    {folder.label}
                                </button>
                            ))}
                        </nav>

                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <p className="text-xs text-blue-800 font-bold mb-1">Armazenamento</p>
                                <div className="w-full bg-blue-200 h-2 rounded-full mb-2">
                                    <div className="bg-blue-600 h-2 rounded-full w-[70%]" />
                                </div>
                                <p className="text-[10px] text-blue-600">70% utilizado de 15GB (Google One)</p>
                            </div>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <section className="flex-1 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-lg text-gray-700">Meus Arquivos</h2>
                            <div className="text-xs text-gray-400">Última sincronização: Agora</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredResources.map(file => (
                                <div key={file.id} className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 group-hover:bg-accent transition-colors" />

                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-lg ${file.type === 'pdf' ? 'bg-red-50 text-red-500' :
                                                file.type === 'video' ? 'bg-purple-50 text-purple-500' :
                                                    file.type === 'image' ? 'bg-blue-50 text-blue-500' :
                                                        'bg-blue-50 text-blue-600'
                                            }`}>
                                            {file.type === 'pdf' && <FileText size={24} />}
                                            {file.type === 'video' && <Video size={24} />}
                                            {file.type === 'image' && <ImageIcon size={24} />}
                                            {file.type === 'doc' && <FileText size={24} />}
                                        </div>
                                        <button className="text-gray-300 hover:text-gray-600 p-1">
                                            <Download size={16} />
                                        </button>
                                    </div>

                                    <h3 className="font-bold text-gray-800 text-sm mb-1 truncate">{file.name}</h3>
                                    <p className="text-xs text-gray-400">{file.size} • Editado ontem</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

            </main>

            <Footer />
        </div>
    );
}
