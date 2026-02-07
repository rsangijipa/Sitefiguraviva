import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
    title?: string;
    message?: string;
    action?: React.ReactNode;
}

export function EmptyState({
    title = 'Nada por aqui',
    message = 'Não encontramos nenhum item para exibir no momento.',
    action
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-gray-400 shadow-sm">
                <FolderOpen size={32} />
            </div>

            <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
            <p className="text-muted max-w-sm mx-auto mb-6">{message}</p>

            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
}
