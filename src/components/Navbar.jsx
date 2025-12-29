import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed w-full z-50 top-0 left-0 bg-white transition-all duration-300 ${scrolled ? 'shadow-md py-4' : 'shadow-sm py-5'}`}>
            <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <img src="/assets/logo.jpeg" alt="Logo" className="w-10 h-10 rounded-full object-cover border border-primary/10" />
                    <span className="text-xl font-serif text-primary tracking-tight font-bold">
                        Figura <span className="font-light text-gold italic">Viva</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 font-sans text-xs font-bold tracking-widest uppercase text-text/80">
                    {['Clínica', 'Fundadora', 'Instituto', 'Blog'].map((item) => (
                        <a
                            key={item}
                            href={`/#${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
                            className="hover:text-primary transition-colors hover:bg-gray-50 px-3 py-2 rounded-lg"
                        >
                            {item === 'Instituto' ? 'Formações e Grupos' : item}
                        </a>
                    ))}

                    <div className="h-6 w-[1px] bg-gray-200" />

                    <Link to="/portal" className="text-accent hover:text-accent/80 transition-colors">
                        Portal do Aluno
                    </Link>

                    <button
                        onClick={() => navigate(isAuthenticated ? '/admin' : '/admin/login')}
                        className="bg-primary text-white border border-transparent px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-all transform active:scale-95 shadow-sm"
                    >
                        {isAuthenticated ? 'Dashboard' : 'Admin'}
                    </button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-primary p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
                >
                    {mobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileOpen && (
                <div className="absolute top-full left-0 w-full bg-surface shadow-xl border-t border-paper/10 p-4 flex flex-col gap-2 md:hidden animate-fade-in max-h-[85vh] overflow-y-auto">
                    {['Clínica', 'Fundadora', 'Instituto', 'Blog'].map((item) => (
                        <a
                            key={item}
                            href={`/#${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
                            onClick={() => setMobileOpen(false)}
                            className="block w-full text-left px-6 py-4 rounded-xl hover:bg-stone-50 active:scale-[0.98] active:bg-stone-100 transition-all text-lg font-serif text-primary"
                        >
                            {item === 'Instituto' ? 'Formações e Grupos' : item}
                        </a>
                    ))}
                    <Link
                        to="/portal"
                        onClick={() => setMobileOpen(false)}
                        className="block w-full text-left px-6 py-4 rounded-xl hover:bg-stone-50 active:scale-[0.98] active:bg-stone-100 transition-all text-lg font-serif text-accent flex items-center gap-2"
                    >
                        Portal do Aluno
                    </Link>
                    <div className="h-px bg-gray-100 my-2 mx-4" />
                    <button
                        onClick={() => {
                            setMobileOpen(false);
                            navigate(isAuthenticated ? '/admin' : '/admin/login');
                        }}
                        className="bg-primary text-white w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs mx-auto shadow-lg active:scale-95 transition-transform"
                    >
                        {isAuthenticated ? 'Acessar Dashboard' : 'Área Administrativa'}
                    </button>
                </div>
            )}
        </nav>
    );
}
