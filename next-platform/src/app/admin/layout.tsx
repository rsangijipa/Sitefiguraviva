"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, BookOpen, PenTool, Settings, LogOut, Globe, Loader2
} from 'lucide-react';

export default function AdminLayout({ children }) {
    const { isAuthenticated, logout, authLoading } = useApp();
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && !authLoading && !isAuthenticated && pathname !== '/admin/login') {
            router.replace('/admin/login');
        }
    }, [isAuthenticated, authLoading, isClient, pathname, router]);

    if (!isClient) return null; // Avoid hydration mismatch

    // If on login page, render without sidebar
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // Show loading state while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCF9]">
                <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
            </div>
        );
    }

    // If not authenticated (and not on login), show nothing (will redirect)
    if (!isAuthenticated) return null;

    const navItems = [
        { icon: LayoutDashboard, label: 'Visão Geral', path: '/admin' },
        { icon: BookOpen, label: 'Cursos', path: '/admin/courses' },
        { icon: Globe, label: 'Google Suite', path: '/admin/google' },
        { icon: PenTool, label: 'Diário Visual', path: '/admin/blog' },
        { icon: BookOpen, label: 'Galeria', path: '/admin/gallery' },
        { icon: Settings, label: 'Configurações', path: '/admin/settings' },
    ];

    return (
        <div className="flex min-h-screen bg-[#FDFCF9]">
            {/* Sidebar */}
            <aside className="w-80 bg-primary text-paper flex flex-col fixed h-full z-20 shadow-[20px_0_60px_rgba(0,0,0,0.05)]">
                <div className="p-12">
                    <h1 className="font-serif text-3xl tracking-tight mb-2">Figura <span className="font-light text-gold italic">Viva</span></h1>
                    <div className="flex flex-col gap-4 mt-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] font-bold text-paper/40 hover:text-gold transition-colors w-fit group py-2"
                        >
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            Admin Panel v2.0
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">← Voltar ao Site</span>
                        </Link>
                    </div>
                </div>

                <nav className="flex-1 px-8 space-y-2">
                    {navItems.map(item => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
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
                        onClick={() => { logout(); router.push('/admin/login'); }}
                        className="w-full flex items-center justify-center gap-4 px-6 py-5 bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-soft text-[10px] font-bold uppercase tracking-[0.2em] group"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Desconectar
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-80 p-16 overflow-y-auto min-h-screen">
                <header className="mb-12 flex justify-between items-center">
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
                {children}
            </main>
        </div>
    );
}
