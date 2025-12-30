"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from './ui/Button';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated } = useApp();
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { label: 'Clínica', href: '/#clinica' },
        { label: 'Fundadora', href: '/#fundadora' },
        { label: 'Instituto', href: '/#instituto', display: 'Formações e Grupos' },
        { label: 'Blog', href: '/#blog' },
    ];

    return (
        <nav className={`fixed w-full z-50 top-0 left-0 bg-white transition-all duration-300 ${scrolled ? 'shadow-md py-4' : 'shadow-sm py-5'}`}>
            <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <img src="/assets/logo.jpeg" alt="Logo" className="w-10 h-10 rounded-full object-cover border border-primary/10" />
                    <span className="text-xl font-serif text-primary tracking-tight font-bold">
                        Figura <span className="font-light text-gold italic">Viva</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 font-sans text-xs font-bold tracking-[0.2em] uppercase text-text/80">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="hover:text-primary transition-colors hover:bg-gray-50 px-4 py-3 rounded-lg min-h-[44px] flex items-center"
                        >
                            {item.display || item.label}
                        </a>
                    ))}

                    <div className="h-6 w-[1px] bg-gray-200" />

                    <Link href="/portal" className="text-accent hover:text-accent/80 transition-colors py-3 flex items-center min-h-[44px]">
                        Portal do Aluno
                    </Link>

                    <Button
                        onClick={() => router.push(isAuthenticated ? '/admin' : '/admin/login')}
                        variant="primary"
                        className="shadow-sm"
                    >
                        {isAuthenticated ? 'Dashboard' : 'Admin'}
                    </Button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-primary w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
                >
                    {mobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileOpen && (
                <div className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 p-4 flex flex-col gap-2 md:hidden animate-fade-in max-h-[85vh] overflow-y-auto">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="block w-full text-left px-6 py-4 rounded-xl hover:bg-stone-50 active:scale-[0.98] active:bg-stone-100 transition-all text-lg font-serif text-primary"
                        >
                            {item.display || item.label}
                        </a>
                    ))}
                    <Link
                        href="/portal"
                        onClick={() => setMobileOpen(false)}
                        className="block w-full text-left px-6 py-4 rounded-xl hover:bg-stone-50 active:scale-[0.98] active:bg-stone-100 transition-all text-lg font-serif text-accent"
                    >
                        Portal do Aluno
                    </Link>
                    <div className="h-px bg-gray-100 my-2 mx-4" />
                    <button
                        onClick={() => {
                            setMobileOpen(false);
                            router.push(isAuthenticated ? '/admin' : '/admin/login');
                        }}
                        className="bg-primary text-white w-full py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] mx-auto shadow-lg active:scale-95 transition-transform"
                    >
                        {isAuthenticated ? 'Acessar Dashboard' : 'Área Administrativa'}
                    </button>
                </div>
            )}
        </nav>
    );
}
