import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed w-full z-50 transition-soft ${scrolled ? 'py-3' : 'py-6'}`}>
            <div className={`container mx-auto px-6 transition-soft ${scrolled ? 'max-w-6xl' : 'max-w-full'}`}>
                <div className={`flex items-center justify-between transition-soft rounded-full px-8 ${scrolled ? 'glass-dark py-3' : 'bg-transparent py-2'}`}>

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <Leaf className={`w-8 h-8 text-gold transition-all duration-700 ${scrolled ? 'rotate-0' : 'rotate-180'}`} />
                            <div className="absolute inset-0 bg-gold/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-2xl font-serif text-paper">
                            Figura <span className="font-light text-gold italic">Viva</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-10 font-sans text-[10px] font-bold tracking-[0.2em] uppercase text-paper/80">
                        {['A Abordagem', 'Instituto', 'Clínica', 'Agenda'].map((item) => (
                            <a
                                key={item}
                                href={`/#${item.toLowerCase().replace(' ', '-')}`}
                                className="hover:text-gold transition-colors duration-300 relative group"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all group-hover:w-full" />
                            </a>
                        ))}

                        <Link to="/portal" className="text-gold hover:text-white transition-colors">
                            Portal do Aluno
                        </Link>

                        <button
                            onClick={() => navigate(isAuthenticated ? '/admin' : '/admin/login')}
                            className="bg-gold/10 border border-gold/30 text-gold px-6 py-2 rounded-full hover:bg-gold hover:text-primary transition-soft transform active:scale-95"
                        >
                            {isAuthenticated ? 'Dashboard' : 'Admin'}
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden text-gold p-2 glass rounded-full" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 bg-primary/98 backdrop-blur-2xl z-40 flex flex-col items-center justify-center gap-10 transition-soft ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col items-center gap-8">
                    {['A Abordagem', 'Instituto', 'Clínica', 'Agenda'].map((item) => (
                        <a
                            key={item}
                            href={`/#${item.toLowerCase()}`}
                            onClick={() => setMobileOpen(false)}
                            className="text-4xl font-serif text-paper hover:text-gold transition-colors"
                        >
                            {item}
                        </a>
                    ))}
                    <div className="w-12 h-[1px] bg-gold/30 my-4" />
                    <Link to="/portal" onClick={() => setMobileOpen(false)} className="text-2xl font-serif text-gold font-light italic">
                        Portal do Aluno
                    </Link>
                    <button
                        onClick={() => navigate(isAuthenticated ? '/admin' : '/admin/login')}
                        className="mt-4 px-10 py-4 border border-gold text-gold rounded-full font-bold tracking-widest uppercase text-xs"
                    >
                        {isAuthenticated ? 'Acessar Dashboard' : 'Login Admin'}
                    </button>
                </div>
            </div>
        </nav>
    );
}
