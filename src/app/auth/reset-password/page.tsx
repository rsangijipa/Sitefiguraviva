'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import PageShell from '@/components/ui/PageShell';

export default function ResetPasswordPage() {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await resetPassword(email);
            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/user-not-found') {
                setError('Não encontramos uma conta com este e-mail.');
            } else {
                setError('Ocorreu um erro ao enviar o e-mail. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageShell variant="auth" className="p-4 md:p-8 min-h-screen">
            {/* Back Link */}
            <Link href="/auth" className="absolute top-8 left-8 z-50 flex items-center gap-2 text-primary/40 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs">
                <ArrowLeft size={16} /> Voltar para Login
            </Link>

            {/* Background Image */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Image
                    src="/assets/auth-bg.jpg"
                    alt="Background"
                    fill
                    className="object-cover blur-[3px] opacity-90"
                    priority
                />
                <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
            </div>

            <div className="w-full min-h-[calc(100vh-6rem)] flex items-center justify-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] shadow-2xl w-full max-w-[480px] relative z-10 border border-white/60"
                >
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8 text-center">
                        <div className="w-20 h-20 rounded-full mb-6 flex items-center justify-center p-1 border border-primary/10 bg-white shadow-soft-md">
                            <img src="/assets/logo.jpeg" alt="Logo" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <h1 className="font-serif text-3xl text-primary font-bold mb-2">
                            Recuperar Senha
                        </h1>
                        <p className="text-stone-500 text-sm max-w-[280px]">
                            {success
                                ? 'Enviamos as instruções para o seu e-mail.'
                                : 'Digite seu e-mail para receber um link de redefinição.'}
                        </p>
                    </div>

                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Seu E-mail"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                leftIcon={Mail}
                            />

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium text-center border border-red-100">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Enviar Link'}
                            </button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-green-50 border border-green-100 p-8 rounded-2xl text-center"
                        >
                            <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
                            <h3 className="text-green-800 font-bold mb-2">E-mail Enviado!</h3>
                            <p className="text-green-600 text-sm mb-6">
                                Verifique sua caixa de entrada (e a pasta de spam) para redefinir sua senha.
                            </p>
                            <Link
                                href="/auth"
                                className="inline-block bg-white text-green-700 font-bold px-6 py-2 rounded-lg border border-green-200 text-xs uppercase tracking-widest hover:bg-green-100 transition-colors"
                            >
                                Voltar para Login
                            </Link>
                        </motion.div>
                    )}

                    <div className="mt-8 text-center text-[10px] text-stone-400 uppercase tracking-[0.2em] font-medium">
                        Instituto Figura Viva
                    </div>
                </motion.div>
            </div>
        </PageShell>
    );
}
