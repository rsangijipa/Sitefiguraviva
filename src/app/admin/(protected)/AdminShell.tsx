"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, BookOpen, PenTool, Settings, LogOut, Globe, Home, X, FileText, Users, Check, UserPlus, Activity, Shield, Calendar
} from 'lucide-react';
import PageShell from '@/components/ui/PageShell';

export default function AdminShell({ children }: { children: React.ReactNode }) {
    const { signOut, user, role } = useAuth(); // Get current user and role
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Note: Auth checking is now done Server-Side in layout.tsx.
    // UseClient is only for UI state (Sidebar, Animations).

    const isLoginPage = pathname?.startsWith('/admin/login');

    if (isLoginPage) {
        return <>{children}</>;
    }

    const navItems = [
        { icon: LayoutDashboard, label: 'Visão Geral', path: '/admin' },
        { icon: Shield, label: 'Usuários & Permissões', path: '/admin/users' },
        { icon: UserPlus, label: 'Interessados', path: '/admin/applications' },
        { icon: BookOpen, label: 'Cursos', path: '/admin/courses' },
        { icon: Check, label: 'Aprovações', path: '/admin/approvals' },
        { icon: FileText, label: 'Avaliações (Provas)', path: '/admin/assessments' },
        { icon: Calendar, label: 'Eventos Ao Vivo', path: '/admin/events' },
        { icon: Users, label: 'Alunos & Matrículas', path: '/admin/enrollments' },
        { icon: Globe, label: 'Google Suite', path: '/admin/google' },
        { icon: PenTool, label: 'Diário Visual', path: '/admin/blog' },
        { icon: BookOpen, label: 'Galeria', path: '/admin/gallery' },
        { icon: FileText, label: 'Documentos', path: '/admin/public-docs' },
        { icon: Activity, label: 'Logs de Sistema', path: '/admin/logs' },
        { icon: Settings, label: 'Configurações', path: '/admin/settings' },
    ];

    return (
        <PageShell variant="admin" className="flex min-h-screen selection:bg-gold/20">
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-primary text-white rounded-full shadow-2xl transition-transform active:scale-90"
            >
                {isSidebarOpen ? <X size={24} /> : <LayoutDashboard size={24} />}
            </button>

            {/* Sidebar */}
            <aside className={`
                w-80 bg-white/60 backdrop-blur-2xl border-r border-stone-200/60 flex flex-col fixed h-full z-40 transition-all duration-500
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-10">
                    <h1 className="font-serif text-3xl text-primary tracking-tight mb-1">Figura <span className="font-light text-gold italic">Viva</span></h1>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-stone-400">Admin Panel v2.0</span>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map(item => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 group ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-2'
                                    : 'text-stone-500 hover:text-primary hover:bg-stone-100/80 hover:translate-x-1'
                                    }`}
                            >
                                <item.icon size={18} className={`transition-transform duration-300 ${isActive ? 'text-gold-light' : 'group-hover:scale-110 group-hover:text-gold'}`} />
                                <span className={`text-[11px] font-bold uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-6 border-t border-stone-200/60 space-y-3 bg-white/40">
                    <Link
                        href="/"
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-stone-200 text-stone-600 hover:border-gold hover:text-gold rounded-xl transition-all duration-300 text-[10px] font-bold uppercase tracking-[0.2em] group shadow-sm hover:shadow-md"
                    >
                        <Home size={16} className="group-hover:scale-110 transition-transform" />
                        Ir para o Site
                    </Link>

                    <button
                        onClick={() => { signOut(); router.push('/admin/login'); }}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 rounded-xl transition-all duration-300 text-[10px] font-bold uppercase tracking-[0.2em] group"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Sair
                    </button>

                    <p className="text-center text-[9px] text-stone-300 font-bold tracking-widest pt-2 opacity-60">
                        © 2024 INSTITUTO FIGURA VIVA
                    </p>
                </div>
            </aside>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 lg:ml-80 p-4 md:p-12 lg:p-16 min-h-screen relative overflow-y-auto custom-scrollbar">
                <div className="relative z-10 max-w-7xl mx-auto animate-fade-in-up">
                    <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                        <div className="flex items-center gap-4">
                            {/* Global Back to Site Button for context if needed, but existing Home link is there. */}
                            <div>
                                <h2 className="font-serif text-3xl md:text-5xl text-primary mb-2 md:mb-3 tracking-tight">Painel de Controle</h2>
                                <p className="text-stone-500 text-xs md:text-base font-light max-w-md leading-relaxed">
                                    Gerencie sua presença digital, cursos e conteúdos com organicidade e fluidez.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-2 rounded-full border border-white/50 shadow-sm">
                            <div className="flex flex-col items-end px-4 hidden md:flex">
                                <span className="text-xs font-bold text-primary">{user?.displayName || user?.email || 'Admin'}</span>
                                <span className="text-[10px] text-stone-400 uppercase tracking-wider">{role === 'admin' ? 'Administrador' : role || 'Usuário'}</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-primary/10 border border-white flex items-center justify-center text-primary shadow-inner">
                                <Settings size={18} />
                            </div>
                        </div>
                    </header>

                    {children}
                </div>
            </main>
        </PageShell>
    );
}
