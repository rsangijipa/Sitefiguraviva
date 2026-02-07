import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Carregando...' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-in fade-in duration-500">
            <Loader2 className="w-10 h-10 text-gold animate-spin mb-4" />
            <p className="text-muted text-lg font-medium animate-pulse">{message}</p>
        </div>
    );
}
