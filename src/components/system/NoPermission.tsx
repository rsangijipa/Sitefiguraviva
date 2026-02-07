import { Lock } from 'lucide-react';
import Link from 'next/link';

export function NoPermission() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-500">
                <Lock size={40} />
            </div>

            <h1 className="font-serif text-3xl text-primary font-bold mb-4">Acesso Restrito</h1>
            <p className="text-muted max-w-md mx-auto mb-8 leading-relaxed">
                Você não tem permissão para acessar esta área. Se acredita que isso é um erro, entre em contato com o suporte.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/"
                    className="inline-flex items-center justify-center bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all"
                >
                    Voltar para o Início
                </Link>
            </div>
        </div>
    );
}
