"use client";

import { ErrorState } from '@/components/ui/ErrorState';

export default function CommunityError({
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
            title=" Comunidade Indisponível"
            description="Não conseguimos carregar as discussões. Isso pode ser uma instabilidade temporária."
        />
    );
}
