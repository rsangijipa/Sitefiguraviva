"use client";

import { ErrorState } from '@/components/ui/ErrorState';

export default function EventsError({
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
            title="Não foi possível carregar a agenda"
            description="Tivemos um problema ao buscar os eventos. Verifique sua conexão ou tente novamente."
        />
    );
}
