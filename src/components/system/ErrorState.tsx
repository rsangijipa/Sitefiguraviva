'use client';

import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';

interface ErrorStateProps {
    title?: string;
    message?: string;
    retry?: () => void;
}

export function ErrorState({
    title = 'Algo deu errado',
    message = 'Não foi possível carregar o conteúdo. Tente novamente.',
    retry
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
                <AlertTriangle size={32} />
            </div>

            <h3 className="font-serif text-2xl text-primary font-bold mb-3">{title}</h3>
            <p className="text-muted mb-8 leading-relaxed">{message}</p>

            {retry && (
                <button
                    onClick={retry}
                    className="inline-flex items-center justify-center bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-all gap-2"
                >
                    <RefreshCcw size={18} />
                    Tentar Novamente
                </button>
            )}
        </div>
    );
}
