"use client";

import { ErrorState } from '@/components/ui/ErrorState';

export default function CertificatesError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <ErrorState
            error={error}
            reset={reset}
            title="Erro nos Certificados"
            description="Não foi possível buscar seus certificados. Tente recarregar a página."
        />
    );
}
