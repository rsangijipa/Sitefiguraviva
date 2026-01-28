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
import PageShell from '@/components/ui/PageShell';
import { Input } from '@/components/ui/Input';

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

                const batch = [];

                // 1. Create user document with extra info
                batch.push(setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email,
                    displayName: fullName,
                    phone,
                    selectedCourse,
                    createdAt: serverTimestamp(),
                    lastLogin: serverTimestamp(),
                }, { merge: true }));

                // 2. Create application request if course is selected
                if (selectedCourse) {
                    const applicationId = `${user.uid}_${selectedCourse}`;
                    batch.push(setDoc(doc(db, "applications", applicationId), {
                        uid: user.uid,
                        courseId: selectedCourse,
                        status: 'just_registered',
                        userName: fullName,
                        userEmail: email,
                        userPhone: phone,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                        source: 'signup_form'
                    }, { merge: true }));
                }

                await Promise.all(batch);

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
        <PageShell variant="auth" className="flex items-center justify-center p-4 md:p-8">
            {/* Go Back Link */}
            <button
                onClick={() => router.push('/')}
                className="absolute top-8 left-8 z-50 flex items-center gap-2 text-primary/40 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs"
            >
                <ArrowRight className="rotate-180" size={16} /> Voltar ao Início
            </button>


            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white/60 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] w-full max-w-[480px] relative z-10 border border-white/80"
            >
                {/* Branding Header */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 rounded-full mb-6 flex items-center justify-center p-1 border border-primary/5 shadow-soft-md bg-white/80 overflow-hidden">
                        <img src="/assets/logo.jpeg" alt="Instituto Figura Viva" className="w-full h-full rounded-full object-cover" />
                    </div>
                    <h1 className="font-serif text-3xl text-primary mb-2 text-center">
                        {isSignup ? 'Crie sua conta' : 'Bem-vindo(a)'}
                    </h1>
                    <p className="text-primary/50 text-[11px] uppercase tracking-[0.2em] font-bold text-center">
                        {isSignup ? 'Jornada Figura Viva' : 'Área do Aluno'}
                    </p>
                </div>

                {/* Switcher */}
                <div className="flex p-1.5 bg-white/50 border border-white/50 rounded-2xl mb-8 shadow-inner">
                    <button
                        onClick={() => { setIsSignup(false); setError(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${!isSignup ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-stone-400 hover:text-primary hover:bg-white/40'}`}
                    >
                        <LogIn size={14} /> Login
                    </button>
                    <button
                        onClick={() => { setIsSignup(true); setError(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${isSignup ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-stone-400 hover:text-primary hover:bg-white/40'}`}
                    >
                        <UserPlus size={14} /> Cadastro
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
                                <Input
                                    label="Nome Completo"
                                    placeholder="Como gostaria de ser chamado?"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    variant="glass"
                                />

                                <Input
                                    label="Telefone (WhatsApp)"
                                    placeholder="(00) 00000-0000"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    variant="glass"
                                />

                                <div className="space-y-2">
                                    <label className="text-[10px] bg-transparent uppercase tracking-widest font-bold text-stone-500 ml-1">Interesse em Curso</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={selectedCourse}
                                            onChange={(e) => setSelectedCourse(e.target.value)}
                                            className="w-full h-12 px-4 rounded-xl border border-white/50 bg-white/60 backdrop-blur-md text-sm md:text-base font-medium focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all appearance-none cursor-pointer hover:bg-white/80 text-stone-800 shadow-soft-sm"
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

                    <Input
                        label="E-mail"
                        placeholder="seu@email.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        variant="glass"
                    />

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Senha</label>
                            <button type="button" className="text-primary hover:text-gold transition-colors text-[10px] font-bold uppercase tracking-wider" tabIndex={-1}>
                                Esqueceu?
                            </button>
                        </div>
                        <Input
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            variant="glass"
                            rightIcon={showPassword ? EyeOff : Eye}
                            onRightIconClick={() => setShowPassword(!showPassword)}
                        />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100 flex items-center justify-center text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 mt-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-70 disabled:cursor-wait"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : (
                            <>
                                {isSignup ? 'Criar Conta' : 'Acessar Portal'} <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsSignup(!isSignup)}
                        className="text-xs text-stone-400 font-medium hover:text-primary transition-colors"
                    >
                        {isSignup ? 'Já tem conta? Faça login.' : 'Não tem cadastro? Crie sua conta.'}
                    </button>
                </div>
            </motion.div>
        </PageShell>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FDFCF9]"><Loader2 className="animate-spin text-primary" /></div>}>
            <LoginContent />
        </Suspense>
    );
}
