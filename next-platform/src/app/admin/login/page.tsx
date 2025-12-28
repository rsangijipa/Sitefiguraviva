"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Loader2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { login } = useApp();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const success = await login(email, password);

        if (success) {
            router.push('/admin');
        } else {
            setError('Credenciais inválidas. Tente novamente.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-paper flex items-center justify-center relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-12 md:p-16 rounded-[3rem] shadow-[0_60px_100px_-20px_rgba(38,58,58,0.1)] w-full max-w-md relative z-10 border border-primary/5"
            >
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/5 rounded-2xl text-gold mb-6">
                        <Lock size={24} />
                    </div>
                    <h1 className="font-serif text-3xl text-primary mb-2">Acesso Restrito</h1>
                    <p className="text-primary/40 text-sm">Insira suas credenciais para continuar.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 ml-2">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-primary font-medium"
                            placeholder="admin@exemplo.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 ml-2">Senha</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-primary font-medium"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-paper py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-gold transition-soft disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8 group"
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            "Entrar"
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
