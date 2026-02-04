"use client";

import { EmptyState } from '@/components/ui/EmptyState';
import { AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ErrorStateProps {
    error: Error & { digest?: string };
    reset: () => void;
    title?: string;
    description?: string;
}

export function ErrorState({ error, reset, title = "Algo deu errado", description }: ErrorStateProps) {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8">
            <EmptyState
                icon={<AlertCircle size={32} className="text-red-500" />}
                title={title}
                description={description || "Não foi possível carregar este conteúdo no momento. Tente novamente ou entre em contato com o suporte."}
                className="border-red-50 bg-red-50/10"
                action={
                    <div className="flex flex-col items-center gap-2">
                        <Button onClick={reset} variant="primary">
                            Tentar Novamente
                        </Button>
                        <p className="text-[10px] text-stone-300 font-mono mt-4">
                            Error Ref: {error.digest || 'Unknown'}
                        </p>
                    </div>
                }
            />
        </div>
    );
}
