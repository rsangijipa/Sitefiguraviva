"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Lock, ArrowRight, CreditCard, User, Clock } from 'lucide-react';
import Link from 'next/link';

export default function EnrollmentStepper({ courseId, initialData }: { courseId: string, initialData: any }) {
    const router = useRouter();
    const { course, enrollment, application, uid } = initialData;

    // Determine initial step
    const getInitialStep = () => {
        if (!uid) return 1;
        if (enrollment?.status === 'active') return 4;
        if (application?.status === 'submitted' || enrollment?.status === 'pending') return 3;
        return 2;
    };

    const [currentStep, setCurrentStep] = useState(getInitialStep());
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: application?.answers?.fullName || '',
        phone: application?.answers?.phone || '',
        profession: application?.answers?.profession || '',
    });

    const isAuthorized = !!uid;
    const isEnrolled = enrollment?.status === 'active';
    const isPending = enrollment?.status === 'pending';

    // Step 1: Login Check (Auto-redirect logic or UI CTA)
    if (currentStep === 1 && !isAuthorized) {
        // We show the UI below
    }

    // Handlers
    const handleLogin = () => {
        router.push(`/login?next=/inscricao/${courseId}`);
    };

    const handleSignup = () => {
        router.push(`/signup?next=/inscricao/${courseId}`);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/applications/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await getIdToken()}` }, // Helper needed or cookie auth?
                // Note: Our API expects Bearer token. We need AuthContext or simple cookie usage.
                // Since this is client side, let's assume we are logged in.
                // Actually the API reads 'Authorization' header. We need to get the token from Firebase Client SDK.
                body: JSON.stringify({
                    courseId,
                    answers: formData,
                    consent: { lgpd: true, acceptedAt: new Date().toISOString() }
                })
            });

            if (!res.ok) throw new Error('Falha ao salvar');

            setCurrentStep(3);
            router.refresh();
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar inscrição. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const token = await getIdToken(); // Need to implement this helper inline or import
            const res = await fetch('/api/billing/checkout-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ courseId })
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Erro no checkout');
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao iniciar pagamento.');
            setLoading(false);
        }
    };

    // Firebase Token Helper (Simplified integration)
    const getIdToken = async () => {
        const { auth } = await import('@/lib/firebase/client');
        if (!auth.currentUser) throw new Error("User not valid");
        return auth.currentUser.getIdToken();
    };


    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-12 text-center">
                <Link href="/" className="text-primary/50 text-xs font-bold uppercase tracking-widest hover:text-primary mb-4 block">
                    &larr; Voltar para Home
                </Link>
                <h1 className="font-serif text-3xl md:text-4xl text-primary mb-4">{course.title}</h1>
                <p className="text-stone-500">Complete sua inscrição para garantir sua vaga.</p>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center justify-between mb-12 relative px-4">
                <div className="absolute left-0 top-1/2 w-full h-0.5 bg-stone-200 -z-10" />
                {[1, 2, 3, 4].map((step) => (
                    <div
                        key={step}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-4 border-[#FDFCF9] ${step <= currentStep ? 'bg-primary text-white' : 'bg-stone-200 text-stone-400'
                            }`}
                    >
                        {step < currentStep ? <Check size={16} /> : step}
                    </div>
                ))}
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-100">
                <AnimatePresence mode='wait'>

                    {/* STEP 1: LOGIN */}
                    {currentStep === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                    <User size={32} />
                                </div>
                                <h2 className="font-serif text-2xl text-primary mb-4">Primeiro, identifique-se</h2>
                                <p className="text-stone-500 mb-8 max-w-md mx-auto">
                                    Para se inscrever, você precisa entrar com sua conta ou criar uma nova. É rápido e seguro.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={handleLogin}
                                        className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                    >
                                        Já possuo uma conta <ArrowRight size={18} />
                                    </button>
                                    <button
                                        onClick={handleSignup}
                                        className="px-8 py-4 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        Criar nova conta <User size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: FORM */}
                    {currentStep === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <h2 className="font-serif text-2xl text-primary mb-6">Seus Dados</h2>
                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Nome Completo</label>
                                        <input required className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-1 focus:ring-primary outline-none"
                                            value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Telefone / WhatsApp</label>
                                        <input required className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-1 focus:ring-primary outline-none"
                                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(11) 99999-9999" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Profissão / Área de Atuação</label>
                                    <input required className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-1 focus:ring-primary outline-none"
                                        value={formData.profession} onChange={e => setFormData({ ...formData, profession: e.target.value })} />
                                </div>

                                <div className="pt-6 border-t border-stone-100 flex justify-end">
                                    <button type="submit" disabled={loading} className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2">
                                        {loading ? <Loader2 className="animate-spin" /> : <>Continuar para Pagamento <ArrowRight size={18} /></>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* STEP 3: PAYMENT */}
                    {currentStep === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                                    <CreditCard size={32} />
                                </div>
                                <h2 className="font-serif text-2xl text-primary mb-2">Assinatura Mensal</h2>
                                <p className="text-stone-500">Acesso completo ao curso com renovação automática. Cancele quando quiser.</p>
                            </div>

                            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 mb-8 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-primary">{course.title}</p>
                                    <p className="text-xs text-stone-500">Cobrança mensal recorrente</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-serif text-2xl text-primary">R$ 97,00</p>
                                    <p className="text-[10px] text-stone-400">/mês</p>
                                </div>
                            </div>

                            <button onClick={handleSubscribe} disabled={loading} className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20">
                                {loading ? <Loader2 className="animate-spin" /> : <>Assinar Agora com Stripe <Lock size={16} /></>}
                            </button>
                            <p className="text-center text-xs text-stone-400 mt-4">Pagamento seguro processado pelo Stripe. Ambiente criptografado.</p>
                        </motion.div>
                    )}

                    {/* STEP 4: SUCCESS / STATUS */}
                    {currentStep === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="text-center">
                                {isPending ? (
                                    <>
                                        <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
                                            <Loader2 size={32} className="animate-spin" />
                                        </div>
                                        <h2 className="font-serif text-2xl text-primary mb-4">Pagamento em Processamento</h2>
                                        <p className="text-stone-500 mb-8">Estamos aguardando a confirmação do seu banco. O acesso será liberado automaticamente em instantes.</p>
                                        <button onClick={() => router.refresh()} className="px-6 py-2 border border-stone-200 rounded-lg text-sm text-stone-600 hover:bg-stone-50">
                                            Verificar novamente
                                        </button>
                                    </>
                                ) : enrollment?.status === 'pending_approval' ? (
                                    <>
                                        <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                                            <Clock size={32} />
                                        </div>
                                        <h2 className="font-serif text-2xl text-primary mb-4">Inscrição em Análise</h2>
                                        <p className="text-stone-500 mb-8">
                                            Confirmamos seu pagamento! Agora, nossa equipe revisará sua inscrição.
                                            Assim que for aprovada, você receberá um e-mail e o acesso será liberado no Portal.
                                        </p>
                                        <Link href="/portal" className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2">
                                            Ir para o Portal do Aluno <ArrowRight size={18} />
                                        </Link>
                                    </>
                                ) : enrollment?.status === 'past_due' ? (
                                    <>
                                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                                            <CreditCard size={32} />
                                        </div>
                                        <h2 className="font-serif text-2xl text-primary mb-4">Pagamento Pendente</h2>
                                        <p className="text-stone-500 mb-8">Houve um problema com a renovação da sua assinatura. Atualize seu cartão para continuar.</p>
                                        <button
                                            onClick={async () => {
                                                const res = await fetch('/api/billing/customer-portal', {
                                                    method: 'POST',
                                                    headers: { 'Authorization': `Bearer ${await getIdToken()}` }
                                                });
                                                const data = await res.json();
                                                if (data.url) window.location.href = data.url;
                                            }}
                                            className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                                        >
                                            Regularizar Assinatura <ArrowRight size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                                            <Check size={32} />
                                        </div>
                                        <h2 className="font-serif text-2xl text-primary mb-4">Você está inscrito!</h2>
                                        <p className="text-stone-500 mb-8">Sua assinatura está ativa e seu acesso liberado. Bons estudos!</p>
                                        <Link href={`/portal/course/${course.id}`} className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2">
                                            Acessar o Portal do Aluno <ArrowRight size={18} />
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
