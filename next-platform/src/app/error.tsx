"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white/50 backdrop-blur-sm p-12 rounded-[2.5rem] shadow-soft-xl max-w-lg w-full border border-red-100">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 text-red-400">
                    <AlertTriangle size={48} />
                </div>

                <h1 className="font-serif text-4xl text-primary font-bold mb-4">Algo deu errado</h1>
                <p className="text-primary/70 mb-8 leading-relaxed">
                    Encontramos um erro inesperado ao processar sua solicitação. Nossos terapeutas digitais já foram notificados.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={reset}
                        className={buttonVariants({ variant: "primary", className: "w-full justify-center" })}
                    >
                        Tentar Novamente
                    </button>
                    <a href="/" className={buttonVariants({ variant: "ghost", className: "w-full justify-center" })}>
                        Voltar para o Início
                    </a>
                </div>
            </div>
        </div>
    );
}
