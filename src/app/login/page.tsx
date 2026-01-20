"use client";

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const { signIn } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signIn(email, password);
            const user = userCredential.user;

            // Force refresh token to ensure claims are up to date
            const tokenResult = await user.getIdTokenResult(true);

            if (tokenResult.claims.admin === true) {
                router.push('/admin');
            } else {
                router.push('/portal');
            }
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-credential') {
                setError('E-mail ou senha incorretos.');
            } else {
                setError('Ocorreu um erro ao entrar. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen grid md:grid-cols-2 bg-[#FDFCF9]">
            {/* Left: Branding & Visual */}
            <div className="relative hidden md:flex flex-col justify-between p-12 bg-primary text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary/95" />

                <div className="relative z-10">
                    <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
                        Instituto Figura Viva
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="font-serif text-5xl leading-tight mb-6">
                        Sua jornada de formação começa aqui.
                    </h1>
                    <p className="text-white/70 text-lg font-light leading-relaxed">
                        Acesse seus cursos, materiais didáticos e acompanhe seu progresso na Gestalt-Terapia em um ambiente pensado para o seu acolhimento.
                    </p>
                </div>

                <div className="relative z-10 text-xs font-bold uppercase tracking-widest text-white/40">
                    © 2024 Instituto Figura Viva
                </div>
            </div>

            {/* Right: Login Form */}
            <div className="flex items-center justify-center p-6 md:p-12 relative">
                {/* Mobile Back Link */}
                <div className="absolute top-6 left-6 md:hidden">
                    <Link href="/" className="text-primary/60 font-serif font-bold text-lg">
                        Figura Viva
                    </Link>
                </div>

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <h2 className="font-serif text-3xl md:text-4xl text-primary mb-2">Bem-vindo(a)</h2>
                        <p className="text-stone-500">Faça login para acessar sua área do aluno.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-stone-500">E-mail</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-stone-300"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 flex justify-between">
                                <span>Senha</span>
                                <button type="button" className="text-primary hover:text-primary/80 normal-case font-normal text-xs" tabIndex={-1}>Esqueceu a senha?</button>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-stone-300 pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    Entrar na Plataforma <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-4 border-t border-stone-100">
                        <p className="text-stone-500 text-sm">
                            Ainda não tem uma conta?{' '}
                            <Link href="/signup" className="text-primary font-bold hover:underline">
                                Cadastre-se
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
