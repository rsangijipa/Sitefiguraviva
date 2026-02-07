"use client";

import { useEffect } from "react";
import { telemetry } from '@/lib/telemetry';
import { ErrorState } from "@/components/system/ErrorState";

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
        telemetry.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6">
            <ErrorState
                title="Algo deu errado"
                message="Encontramos um erro inesperado. Nossos terapeutas digitais já foram notificados."
                retry={reset}
            />
        </div>
    );
}
