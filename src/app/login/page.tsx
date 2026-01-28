"use client";

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, ArrowRight, UserPlus, LogIn, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourses } from '@/hooks/useContent';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase/client';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { Suspense } from 'react';

function LoginContent() {
    const { signIn, signUp, updateProfile } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: courses = [] } = useCourses();

    const mode = searchParams.get('mode');
    const next = searchParams.get('next');

    // Determine initial state
    const [isSignup, setIsSignup] = useState(mode === 'signup');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Common fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Signup specific fields
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');

    // Extract courseId from 'next' if it's an enrollment path
    const getInitialCourse = () => {
        if (next && next.includes('/inscricao/')) {
            return next.split('/').pop() || '';
        }
        return '';
    };
    const [selectedCourse, setSelectedCourse] = useState(getInitialCourse());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let user;
            if (isSignup) {
                // signup
                const userCredential = await signUp(email, password);
                user = userCredential.user;

                // Set Display Name
                await updateProfile({ displayName: fullName });

                // Create user document with extra info
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email,
                    displayName: fullName,
                    phone,
                    selectedCourse,
                    createdAt: serverTimestamp(),
                    lastLogin: serverTimestamp(),
                }, { merge: true });

            } else {
                // login
                const userCredential = await signIn(email, password);
                user = userCredential.user;
            }

            const token = await user.getIdToken();

            // Set session cookie
            await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: token }),
            });

            // Force refresh token to ensure claims are up to date
            const tokenResult = await user.getIdTokenResult(true);

            if (tokenResult.claims.admin === true) {
                router.push('/admin');
            } else if (next) {
                router.push(next);
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
                        <h2 className="font-serif text-3xl md:text-4xl text-primary mb-2">
                            {isSignup ? 'Crie sua conta' : 'Bem-vindo(a)'}
                        </h2>
                        <p className="text-stone-500">
                            {isSignup
                                ? 'Preencha os dados abaixo para se cadastrar.'
                                : 'Faça login para acessar sua área do aluno.'}
                        </p>
                    </div>

                    <div className="flex p-1 bg-stone-100 rounded-xl">
                        <button
                            onClick={() => { setIsSignup(false); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${!isSignup ? 'bg-white text-primary shadow-sm' : 'text-stone-500 hover:text-primary'}`}
                        >
                            <LogIn size={16} /> Login
                        </button>
                        <button
                            onClick={() => { setIsSignup(true); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${isSignup ? 'bg-white text-primary shadow-sm' : 'text-stone-500 hover:text-primary'}`}
                        >
                            <UserPlus size={16} /> Cadastro
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode='wait'>
                            {isSignup && (
                                <motion.div
                                    key="signup-fields"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-5 overflow-hidden"
                                >
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Nome Completo</label>
                                        <input
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="Seu nome"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Telefone</label>
                                        <input
                                            type="tel"
                                            required
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Interesse em Curso</label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={selectedCourse}
                                                onChange={(e) => setSelectedCourse(e.target.value)}
                                                className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                                            >
                                                <option value="" disabled>Selecione um curso</option>
                                                {courses.map((course: any) => (
                                                    <option key={course.id} value={course.id}>
                                                        {course.title}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

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
                                    {isSignup ? 'Criar Conta e Continuar' : 'Entrar na Plataforma'} <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <button
                            onClick={() => setIsSignup(!isSignup)}
                            className="text-sm text-stone-500 hover:text-primary transition-colors"
                        >
                            {isSignup ? 'Já possui uma conta? Faça login' : 'Ainda não é aluno? Crie uma conta'}
                        </button>
                    </div>

                </div>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FDFCF9]"><Loader2 className="animate-spin text-primary" /></div>}>
            <LoginContent />
        </Suspense>
    );
}
