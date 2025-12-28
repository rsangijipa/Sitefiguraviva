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
        <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-primary/95 backdrop-blur-md shadow-lg py-4' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-6 flex items-center justify-between text-paper">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <Leaf className={`w-8 h-8 text-gold transition-transform duration-700 ${scrolled ? 'rotate-0' : 'rotate-180'}`} />
                    <span className="text-2xl font-serif tracking-in-expand">
                        Figura <span className="font-light text-gold">Viva</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 font-sans text-sm tracking-widest uppercase">
                    {['A Abordagem', 'Instituto', 'Clínica', 'Agenda'].map((item) => (
                        <a key={item} href={`/#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-gold transition-colors duration-300 relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-[1px] after:bg-gold after:transition-all after:duration-300 hover:after:w-full">
                            {item}
                        </a>
                    ))}

                    <Link to="/portal" className="text-gold font-bold hover:text-white transition-colors">
                        Portal do Aluno
                    </Link>

                    <button
                        onClick={() => navigate(isAuthenticated ? '/admin' : '/admin/login')}
                        className="border border-gold text-gold px-6 py-2 rounded-full hover:bg-gold hover:text-primary transition-all duration-300 transform hover:scale-105"
                    >
                        {isAuthenticated ? 'Dashboard' : 'Admin'}
                    </button>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-gold" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 bg-primary/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-500 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {['A Abordagem', 'Instituto', 'Clínica', 'Agenda'].map((item) => (
                    <a key={item} href={`/#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)} className="text-2xl font-serif text-paper hover:text-gold">
                        {item}
                    </a>
                ))}
                <Link to="/portal" onClick={() => setMobileOpen(false)} className="text-2xl font-serif text-gold font-bold">
                    Portal do Aluno
                </Link>
                <button
                    onClick={() => navigate(isAuthenticated ? '/admin' : '/admin/login')}
                    className="text-gold text-xl border-b border-gold pb-1"
                >
                    {isAuthenticated ? 'Acessar Dashboard' : 'Login Admin'}
                </button>
            </div>
        </nav>
    );
}
