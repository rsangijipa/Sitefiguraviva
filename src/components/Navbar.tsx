"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from './ui/Button';

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
        <nav className={`fixed w-full z-50 top-0 left-0 bg-white dark:bg-paper transition-all duration-300 ${scrolled ? 'shadow-md py-4' : 'shadow-sm py-5'} dark:border-b dark:border-white/5`}>
            <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1">
                    <img src="/assets/logo.jpeg" alt="Logo" className="w-10 h-10 rounded-full object-cover border border-primary/10" />
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
            {mobileOpen && (
                <div className="absolute top-full left-0 w-full bg-white dark:bg-surface shadow-xl border-t border-gray-100 dark:border-white/5 p-6 flex flex-col gap-3 md:hidden animate-fade-in max-h-[85vh] overflow-y-auto">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="block w-full text-left px-6 py-4 rounded-xl hover:bg-stone-50 dark:hover:bg-white/5 active:scale-[0.98] active:bg-stone-100 dark:active:bg-white/10 transition-all text-xl font-serif text-primary border border-transparent active:border-primary/10"
                        >
                            {item.display || item.label}
                        </a>
                    ))}
                    <Link
                        href="/portal"
                        onClick={() => setMobileOpen(false)}
                        className="block w-full text-left px-6 py-4 rounded-xl hover:bg-stone-50 dark:hover:bg-white/5 active:scale-[0.98] active:bg-stone-100 dark:active:bg-white/10 transition-all text-xl font-serif text-accent"
                    >
                        Portal do Aluno
                    </Link>
                    <div className="h-px bg-gray-100 dark:bg-white/5 my-4 mx-2" />
                    <Button
                        onClick={() => {
                            setMobileOpen(false);
                            router.push(isAuthenticated ? '/admin' : '/admin/login');
                        }}
                        className="w-full py-6 text-xs uppercase tracking-widest"
                    >
                        {isAuthenticated ? 'Acessar Dashboard' : 'Área Administrativa'}
                    </Button>
                </div>
            )}
        </nav>
    );
}
