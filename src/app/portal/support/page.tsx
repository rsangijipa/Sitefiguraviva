"use client";

import { EmptyState } from '@/components/ui/EmptyState';
import { LifeBuoy } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function SupportPage() {
    return (
        <div className="h-full flex flex-col">
            <header className="mb-8">
                <h1 className="font-serif text-3xl text-stone-800">Suporte e Ajuda</h1>
                <p className="text-stone-500 mt-1">Estamos aqui para ajudar você.</p>
            </header>
            <div className="flex-1 flex items-center justify-center">
                <EmptyState
                    icon={<LifeBuoy size={32} />}
                    title="Precisa de Ajuda?"
                    description="Nossa central de suporte está sendo finalizada. Enquanto isso, entre em contato diretamente pelo nosso email."
                    action={
                        <Button onClick={() => window.open('mailto:contato@institutofiguraviva.com.br')}>
                            Fale Conosco
                        </Button>
                    }
                />
            </div>
        </div>
    );
}
