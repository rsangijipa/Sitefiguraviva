"use client";

import { EmptyState } from '@/components/ui/EmptyState';
import { Trophy } from 'lucide-react';

export default function GoalsPage() {
    return (
        <div className="h-full flex flex-col">
            <header className="mb-8">
                <h1 className="font-serif text-3xl text-stone-800">Trilhas & Metas</h1>
                <p className="text-stone-500 mt-1">Acompanhe seu desenvolvimento profissional.</p>
            </header>
            <div className="flex-1 flex items-center justify-center">
                <EmptyState
                    icon={<Trophy size={32} />}
                    title="Jornada Personalizada"
                    description="Em breve, você poderá criar trilhas de estudo personalizadas e acompanhar suas metas de aprendizado em tempo real."
                />
            </div>
        </div>
    );
}
