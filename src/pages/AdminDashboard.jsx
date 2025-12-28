import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, PenTool, Settings, LogOut,
    Plus, Trash2, Edit, Save, X, AlertTriangle,
    Globe, LayoutTemplate, Database, Youtube
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// --- Sub-Components ---

// 1. Course Manager (CRUD)
function CoursesManager() {
    const { courses, addCourse, updateCourse, deleteCourse } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [currentCourse, setCurrentCourse] = useState(null);

    const initialForm = { title: '', date: '', status: 'Aberto', link: '', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000' };
    const [formData, setFormData] = useState(initialForm);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentCourse) {
            updateCourse(currentCourse.id, formData);
        } else {
            addCourse(formData);
        }
        setIsEditing(false);
        setFormData(initialForm);
        setCurrentCourse(null);
    };

    const startEdit = (course) => {
        setCurrentCourse(course);
        setFormData(course);
        setIsEditing(true);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-serif text-primary">Gestão de Cursos</h2>
                    <p className="text-sage text-sm">Gerencie o que aparece na seção "Instituto".</p>
                </div>
                <button
                    onClick={() => { setIsEditing(true); setCurrentCourse(null); setFormData(initialForm); }}
                    className="bg-accent text-white px-6 py-3 rounded-lg flex items-center gap-2 text-sm font-bold uppercase tracking-wide hover:bg-accent/90 shadow-lg transform hover:-translate-y-1 transition-all"
                >
                    <Plus size={16} /> Novo Curso
                </button>
            </div>

            {isEditing && (
                <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 animate-slide-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                    <div className="flex justify-between mb-6">
                        <h3 className="font-bold text-lg text-primary">{currentCourse ? 'Editar Curso' : 'Adicionar Novo Curso'}</h3>
                        <button onClick={() => setIsEditing(false)}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Título do Curso</label>
                            <input required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Gestalt-Terapia Avançada" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Data</label>
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
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Link do Sympla (Checkout)</label>
                            <input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} placeholder="https://sympla.com.br/..." />
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
                {courses.map(course => (
                    <div key={course.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center group hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-6 w-full md:w-auto mb-4 md:mb-0">
                            <div className={`w-3 h-3 rounded-full shrink-0 shadow-sm ${course.status === 'Aberto' ? 'bg-green-500 shadow-green-500/50' : course.status === 'Esgotado' ? 'bg-red-500 shadow-red-500/50' : 'bg-gray-400'}`} />

                            <img src={course.image} className="w-12 h-12 rounded-lg object-cover hidden md:block" alt="" />

                            <div>
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
                ))}
            </div>
        </div>
    );
}

// 2. Google Ecosystem Panel (NEW)
function GoogleIntegrations() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="border-b border-gray-200 pb-5">
                <h2 className="text-3xl font-serif text-primary">Conexões Google</h2>
                <p className="text-sage text-sm">Gerencie o "motor" por trás do seu site.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Google Calendar */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden group hover:border-blue-200 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <LayoutTemplate size={80} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <Calendar size={20} /> {/* Should technically be Calendar icon */}
                        </div>
                        <h3 className="font-bold text-gray-800">Google Calendar</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Define qual agenda é exibida publicamente na seção "Agenda Viva".</p>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 text-xs p-3 rounded mb-2 font-mono text-gray-600" defaultValue="pt.brazilian#holiday@group.v.calendar.google.com" />
                    <div className="flex items-center gap-2 text-green-600 text-xs font-bold">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Conectado via API Simples
                    </div>
                </div>

                {/* Google Drive */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden group hover:border-green-200 transition-colors">
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
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 text-xs p-3 rounded mb-2 font-mono text-gray-600" defaultValue="folder_id_123456789" />
                    <button className="text-xs text-primary font-bold hover:underline">Testar Permissões</button>
                </div>

                {/* Google Forms */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden group hover:border-purple-200 transition-colors">
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
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 text-xs p-3 rounded mb-2 font-mono text-gray-600" defaultValue="https://docs.google.com/forms/u/0/..." />
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
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 text-xs p-3 rounded mb-2 font-mono text-gray-600" defaultValue="channel_id_XYZ" />
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

// --- Main Layout ---
export default function AdminDashboard() {
    const { logout } = useApp();
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Visão Geral', path: '/admin' },
        { icon: BookOpen, label: 'Cursos', path: '/admin/courses' },
        { icon: Globe, label: 'Google Suite', path: '/admin/google' },
        { icon: PenTool, label: 'Diário Visual', path: '/admin/blog' },
        { icon: Settings, label: 'Configurações', path: '/admin/settings' },
    ];

    return (
        <div className="flex min-h-screen bg-[#FDFCF9]">
            {/* Sidebar */}
            <aside className="w-80 bg-primary text-paper flex flex-col fixed h-full z-20 shadow-[20px_0_60px_rgba(0,0,0,0.05)]">
                <div className="p-12">
                    <h1 className="font-serif text-3xl tracking-tight mb-2">Figura <span className="font-light text-gold italic">Viva</span></h1>
                    <div className="flex items-center gap-2 opacity-40">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-[9px] uppercase tracking-[0.3em] font-bold">Admin Panel v2.0</p>
                    </div>
                </div>

                <nav className="flex-1 px-8 space-y-2">
                    {navItems.map(item => {
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-6 py-5 rounded-[1.25rem] transition-soft group relative ${isActive ? 'bg-paper text-primary shadow-2xl scale-[1.02]' : 'text-paper/40 hover:text-paper hover:bg-white/5'}`}
                            >
                                <item.icon size={18} className={`transition-transform duration-500 ${isActive ? 'text-gold' : 'group-hover:scale-110'}`} />
                                <span className={`text-[11px] font-bold uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute right-4 w-1.5 h-1.5 bg-gold rounded-full"
                                    />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-8 border-t border-white/5">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-4 px-6 py-5 bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-soft text-[10px] font-bold uppercase tracking-[0.2em] group"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Desconectar
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-80 p-16 overflow-y-auto min-h-screen">
                <header className="mb-16 flex justify-between items-center">
                    <div>
                        <h2 className="font-serif text-4xl text-primary mb-2">Painel de Controle</h2>
                        <p className="text-primary/40 text-sm font-light">Gerencie sua presença digital e conexões Google.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full glass border border-primary/5 flex items-center justify-center text-primary/30">
                            <Settings size={20} />
                        </div>
                    </div>
                </header>

                <div className="max-w-6xl">
                    <Routes>
                        <Route path="/" element={
                            <div className="grid md:grid-cols-2 gap-8 py-10 animate-fade-in">
                                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-primary/5 flex flex-col justify-center items-center text-center">
                                    <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center text-gold mb-8">
                                        <LayoutDashboard size={32} />
                                    </div>
                                    <h2 className="font-serif text-4xl text-primary mb-4">Seja bem-vinda de volta.</h2>
                                    <p className="text-primary/50 max-w-sm font-light leading-relaxed">Seu site está funcionando perfeitamente e conectado a todos os serviços Google.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-primary p-8 rounded-[2rem] text-paper flex flex-col justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Status do Site</span>
                                        <h4 className="text-4xl font-serif">Online</h4>
                                    </div>
                                    <div className="bg-white p-8 rounded-[2rem] border border-primary/5 flex flex-col justify-between shadow-sm">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/30">Versão</span>
                                        <h4 className="text-4xl font-serif text-primary italic">2.0.4</h4>
                                    </div>
                                </div>
                            </div>
                        } />
                        <Route path="/courses" element={<CoursesManager />} />
                        <Route path="/google" element={<GoogleIntegrations />} />
                        <Route path="/blog" element={<div className="p-20 text-center glass rounded-[2.5rem] text-primary/40 font-serif text-2xl">Editor de Blog em Construção...</div>} />
                        <Route path="/settings" element={<SettingsManager />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}
