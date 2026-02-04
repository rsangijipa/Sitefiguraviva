
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { checkInEvent } from '@/app/actions/event';
import Button from '@/components/ui/Button';
import { ScanLine, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';

function CheckInContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // State
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [eventTitle, setEventTitle] = useState('');

    // Auto-checkin if code is in URL
    useEffect(() => {
        const urlCode = searchParams.get('code');
        if (urlCode && status === 'idle') {
            setCode(urlCode);
            handleCheckIn(urlCode);
        }
    }, [searchParams]);

    const handleCheckIn = async (codeToUse: string) => {
        if (!codeToUse) return;
        setStatus('loading');

        try {
            const result = await checkInEvent(codeToUse);
            if (result.success) {
                setStatus('success');
                setMessage(result.message);
                setEventTitle(result.eventTitle || '');
                // Redirect after delay?
                // setTimeout(() => router.push('/portal/events'), 3000);
            } else {
                setStatus('error');
                setMessage(result.message || "Erro desconhecido.");
            }
        } catch (error) {
            setStatus('error');
            setMessage("Falha ao conectar com o servidor.");
        }
    };

    return (
        <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl border border-stone-100 p-8 text-center animate-fade-in-up">

            {/* Header Icon */}
            <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors",
                status === 'idle' || status === 'loading' ? "bg-blue-50 text-blue-600" :
                    status === 'success' ? "bg-green-100 text-green-600" :
                        "bg-red-100 text-red-600"
            )}>
                {status === 'loading' ? <Loader2 size={40} className="animate-spin" /> :
                    status === 'success' ? <CheckCircle size={40} /> :
                        status === 'error' ? <AlertTriangle size={40} /> :
                            <ScanLine size={40} />}
            </div>

            <h1 className="text-2xl font-serif font-bold text-stone-800 mb-2">Check-in de Presença</h1>

            {status === 'success' && (
                <div className="mb-6">
                    <p className="text-stone-500 mb-4">{message}</p>
                    {eventTitle && (
                        <div className="bg-stone-50 p-3 rounded-lg border border-stone-100 mb-4">
                            <span className="text-xs uppercase font-bold text-stone-400">Evento Confirmado</span>
                            <p className="font-bold text-stone-800">{eventTitle}</p>
                        </div>
                    )}
                    <Button onClick={() => router.push('/portal/events')} className="w-full">
                        Voltar para Agenda
                    </Button>
                </div>
            )}

            {status === 'error' && (
                <div className="mb-6">
                    <p className="text-red-500 font-medium mb-4">{message}</p>
                    <Button variant="secondary" onClick={() => setStatus('idle')} className="w-full">
                        Tentar Novamente
                    </Button>
                </div>
            )}

            {(status === 'idle' || status === 'loading') && (
                <div>
                    <p className="text-stone-500 mb-6">
                        Digite o código fornecido no evento ou escaneie o QR Code.
                    </p>

                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="EX: AULA-SP-01"
                        className="w-full p-4 mb-4 text-center text-2xl font-mono font-bold tracking-widest uppercase border-2 border-stone-200 rounded-xl focus:border-primary focus:outline-none"
                        disabled={status === 'loading'}
                    />

                    <Button
                        onClick={() => handleCheckIn(code)}
                        disabled={!code || status === 'loading'}
                        className="w-full"
                    >
                        {status === 'loading' ? 'Verificando...' : 'Confirmar Presença'}
                    </Button>
                </div>
            )}
        </div>
    );
}

export default function CheckInPage() {
    return (
        <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center p-6">
            <Suspense fallback={<div>Carregando...</div>}>
                <CheckInContent />
            </Suspense>
        </div>
    );
}
