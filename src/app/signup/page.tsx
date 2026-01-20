"use client";

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/client';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, UserPlus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignupPage() {
    const { signUp, updateProfile } = useAuth();
    const router = useRouter();

    const [name, setName] = useState('');
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
            // 1. Create Auth User
            const userCredential = await signUp(email, password);
            const user = userCredential.user;

            // 2. Update Profile Display Name
            await updateProfile({ displayName: name });

            // 3. Create Firestore User Document
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                displayName: name,
                email: email,
                role: 'student', // Default role for new signups
                photoURL: user.photoURL || null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // 4. Redirect to Portal
            router.push('/portal');

        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Este e-mail já está cadastrado.');
            } else if (err.code === 'auth/weak-password') {
                setError('A senha deve ter pelo menos 6 caracteres.');
            } else {
                setError('Erro ao criar conta. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen grid md:grid-cols-2 bg-[#FDFCF9]">
            {/* Right: Branding & Visual (Order Changed on Mobile vs Desktop via Grid/Flex) */}
            <div className="relative hidden md:flex flex-col justify-between p-12 bg-stone-900 text-white overflow-hidden order-2">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1974')] bg-cover bg-center opacity-30 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/80 to-transparent" />

                <div className="relative z-10 flex justify-end">
                    <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-white/50 hover:text-white transition-colors">
                        Instituto Figura Viva
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg ml-auto text-right">
                    <h1 className="font-serif text-5xl leading-tight mb-6 text-gold">
                        Junte-se à nossa comunidade.
                    </h1>
                    <p className="text-white/70 text-lg font-light leading-relaxed">
                        Faça parte de um grupo dedicado ao estudo, prática e vivência da Gestalt-Terapia.
                    </p>
                </div>

                <div className="relative z-10 text-xs font-bold uppercase tracking-widest text-white/20 text-right">
                    Cadastro de Aluno
                </div>
            </div>

            {/* Left: Signup Form */}
            <div className="flex items-center justify-center p-6 md:p-12 relative order-1">
                {/* Mobile Back Link */}
                <div className="absolute top-6 left-6 md:top-12 md:left-12">
                    <Link href="/login" className="flex items-center gap-2 text-stone-400 hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest">
                        <ArrowLeft size={16} /> Voltar
                    </Link>
                </div>

                <div className="w-full max-w-md space-y-8 mt-12 md:mt-0">
                    <div className="text-center md:text-left">
                        <h2 className="font-serif text-3xl md:text-4xl text-primary mb-2">Criar Conta</h2>
                        <p className="text-stone-500">Preencha seus dados para iniciar.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Nome Completo</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-stone-300"
                                placeholder="Seu nome"
                            />
                        </div>

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
                            <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Senha</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-stone-300 pr-12"
                                    placeholder="Mínimo 6 caracteres"
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
                                    <UserPlus size={18} /> Criar Minha Conta
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-4 border-t border-stone-100">
                        <p className="text-stone-500 text-sm">
                            Já possui uma conta?{' '}
                            <Link href="/login" className="text-primary font-bold hover:underline">
                                Faça Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
