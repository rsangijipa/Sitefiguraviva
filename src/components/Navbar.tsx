"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user } = useAuth();
    const isAuthenticated = !!user;
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { label: 'Instituto', href: '/#instituto-sobre' },
        { label: 'Fundadora', href: '/#fundadora' },
        { label: 'Formações', href: '/#instituto', display: 'Formações e Grupos' },
        { label: 'Recursos', href: '/#recursos-interativos' },
        { label: 'Blog', href: '/#blog' },
    ];

    return (
        <nav className={`fixed w-full z-50 top-0 left-0 bg-white transition-all duration-300 ${scrolled ? 'shadow-md py-4' : 'shadow-sm py-5'}`}>
            <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1" aria-label="Ir para a página inicial">
                    <div className="relative w-10 h-10 overflow-hidden">
                        <Image
                            src="/assets/logo.jpeg"
                            alt="Logo Instituto Figura Viva"
                            fill
                            className="rounded-full object-cover border border-primary/10"
                            sizes="40px"
                            priority
                        />
                    </div>
                    <span className="text-xl font-serif text-primary tracking-tight font-bold">
                        Figura <span className="font-light text-gold italic">Viva</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-4 font-sans text-[10px] lg:text-xs font-bold tracking-[0.2em] uppercase text-text/80">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="hover:text-primary transition-colors hover:bg-black/5 px-3 py-2 rounded-lg min-h-[44px] flex items-center focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            {item.display || item.label}
                        </a>
                    ))}

                    <div className="h-6 w-[1px] bg-gray-200 mx-2" />

                    <Link href="/portal" className="text-accent hover:text-accent/80 transition-colors py-2 px-3 flex items-center min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
                        Portal do Aluno
                    </Link>

                    <Button
                        onClick={() => router.push(isAuthenticated ? '/admin' : '/admin/login')}
                        variant="primary"
                        size="sm"
                        className="shadow-sm ml-2"
                    >
                        {isAuthenticated ? 'Dashboard' : 'Admin'}
                    </Button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-primary w-12 h-12 flex items-center justify-center hover:bg-black/5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[60] bg-white flex flex-col md:hidden"
                    >
                        {/* Mobile Header Inside Menu */}
                        <div className="flex items-center justify-between px-6 py-6 border-b border-stone-100">
                            <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                                <img src="/assets/logo.jpeg" alt="" className="w-8 h-8 rounded-full" />
                                <span className="text-lg font-serif text-primary font-bold">Figura <span className="italic text-gold">Viva</span></span>
                            </Link>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="w-12 h-12 flex items-center justify-center text-primary rounded-full bg-stone-50"
                                aria-label="Fechar menu"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/30 mb-4 px-4">Navegação</span>
                            {navItems.map((item, idx) => (
                                <motion.a
                                    key={item.label}
                                    href={item.href}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + idx * 0.05 }}
                                    onClick={() => setMobileOpen(false)}
                                    className="block w-full text-left px-6 py-4 rounded-2xl hover:bg-stone-50 active:scale-[0.98] active:bg-stone-100 transition-all text-2xl font-serif text-primary border border-transparent active:border-primary/10"
                                >
                                    {item.display || item.label}
                                </motion.a>
                            ))}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Link
                                    href="/portal"
                                    onClick={() => setMobileOpen(false)}
                                    className="block w-full text-left px-6 py-4 rounded-2xl hover:bg-stone-50 active:scale-[0.98] active:bg-stone-100 transition-all text-2xl font-serif text-accent"
                                >
                                    Portal do Aluno
                                </Link>
                            </motion.div>

                            <div className="h-px bg-stone-100 my-8 mx-4" />

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="space-y-4"
                            >
                                <Button
                                    onClick={() => {
                                        setMobileOpen(false);
                                        router.push(isAuthenticated ? '/admin' : '/admin/login');
                                    }}
                                    className="w-full py-6 text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/10"
                                >
                                    {isAuthenticated ? 'Acessar Dashboard' : 'Área Administrativa'}
                                </Button>

                                <p className="text-center text-[10px] text-stone-300 font-bold tracking-widest uppercase py-4">
                                    © 2024 INSTITUTO FIGURA VIVA
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
