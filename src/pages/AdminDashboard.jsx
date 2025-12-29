import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, BookOpen, PenTool, Settings, LogOut,
    Globe, Menu, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// Modularized Components
import AcademicManager from '../components/admin/AcademicManager';
import BlogManager from '../components/admin/BlogManager';
import GoogleIntegrations from '../components/admin/GoogleIntegrations';
import SettingsManager from '../components/admin/SettingsManager';

// Dashboard Home (Visão Geral)
function DashboardHome() {
    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-3xl font-serif text-primary">Visão Geral</h2>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Status do Sistema</h3>
                    <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Online
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Visitantes (Hoje)</h3>
                    <p className="text-3xl font-serif text-primary">--</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Novas Inscrições</h3>
                    <p className="text-3xl font-serif text-primary">--</p>
                </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">Bem-vinda de volta!</h3>
                <p className="text-blue-700 text-sm">Selecione uma opção no menu lateral para começar a gerenciar o conteúdo.</p>
            </div>
        </div>
    );
}

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
                            <p className="text-sage font-medium">Bem-vinda, Lilian.</p>
                        </div>
                    </div>
                </header>

                <Routes>
                    <Route path="/" element={<DashboardHome />} />
                    <Route path="/academic" element={<AcademicManager />} />
                    <Route path="/blog" element={<BlogManager />} />
                    <Route path="/google" element={<GoogleIntegrations />} />
                    <Route path="/settings" element={<SettingsManager />} />
                </Routes>
            </main>
        </div>
    );
}
