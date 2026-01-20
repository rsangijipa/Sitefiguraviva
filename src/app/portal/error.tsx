"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

export default function PortalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-400">
                <AlertCircle size={32} />
            </div>
            <h2 className="font-serif text-2xl text-primary mb-2">Algo deu errado</h2>
            <p className="text-stone-500 max-w-md mb-8">
                Não foi possível carregar o conteúdo. Isso pode ser uma falha de conexão ou um erro no sistema.
            </p>
            <div className="flex gap-4">
                <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="border-stone-200"
                >
                    Recarregar Página
                </Button>
                <Button
                    onClick={reset}
                    leftIcon={<RefreshCw size={16} />}
                >
                    Tentar Novamente
                </Button>
            </div>
        </div>
    );
}
