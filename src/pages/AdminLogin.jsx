import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Leaf, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
    const [loading, setLoading] = useState(false);
    const { login } = useApp();
    const navigate = useNavigate();

    // Login logic is now strictly email/password based


    return (
        <div className="min-h-screen flex items-center justify-center bg-paper relative overflow-hidden">
            {/* Navigation Button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-8 left-8 z-20 flex items-center gap-2 text-primary/40 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs"
            >
                <ArrowLeft size={16} /> Voltar ao Início
            </button>

            {/* Artistic background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gold/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                className="bg-white/40 backdrop-blur-3xl p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] shadow-[0_80px_150px_-30px_rgba(38,58,58,0.15)] w-full max-w-md relative z-10 border border-white/60 text-center mx-4"
            >

                <div className="flex flex-col items-center mb-12">
                    <div className="w-24 h-24 rounded-full mb-8 flex items-center justify-center p-1 border border-primary/10 shadow-xl bg-paper">
                        <img src="/assets/logo.jpeg" alt="Instituto Figura Viva" className="w-full h-full rounded-full object-cover" />
                    </div>
                    <h1 className="font-serif text-4xl text-primary mb-3">Figura <span className="font-light text-gold italic">Viva</span></h1>
                    <p className="text-primary/40 text-[10px] uppercase tracking-[0.4em] font-bold">Ecossistema Digital</p>
                </div>

                <div className="space-y-6">
                    {/* Traditional Login Form for Dev/Testing */}
                    {/* Strict Email/Password Login */}
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const user = e.target.username.value;
                        const pass = e.target.password.value;

                        setLoading(true);
                        const success = await login(user, pass);
                        setLoading(false);

                        if (success) {
                            navigate('/admin');
                        } else {
                            alert("Acesso negado. Verifique suas credenciais.");
                        }
                    }} className="space-y-4">
                        <input
                            name="username"
                            type="email"
                            placeholder="E-mail"
                            required
                            className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-primary font-medium focus:ring-2 focus:ring-accent outline-none"
                        />
                        <input
                            name="password"
                            type="password"
                            placeholder="Senha"
                            required
                            className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-primary font-medium focus:ring-2 focus:ring-accent outline-none"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors shadow-lg ${loading ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {loading ? 'Verificando...' : 'Entrar'}
                        </button>
                    </form>



                    <div className="flex flex-col items-center gap-6">
                        <div className="w-8 h-[1px] bg-primary/10" />
                        <p className="text-[9px] text-primary/30 uppercase font-bold tracking-[0.3em] leading-relaxed max-w-[200px]">
                            Acesso reservado para administradores do Instituto.
                        </p>
                    </div>
                </div >
            </motion.div >
        </div >
    );
}
