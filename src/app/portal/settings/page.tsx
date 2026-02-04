"use client";

import { EmptyState } from '@/components/ui/EmptyState';
import { User } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="h-full flex flex-col">
            <header className="mb-8">
                <h1 className="font-serif text-3xl text-stone-800">Minha Conta</h1>
                <p className="text-stone-500 mt-1">Gerencie suas preferências e dados pessoais.</p>
            </header>
            <div className="flex-1 flex items-center justify-center">
                <EmptyState
                    icon={<User size={32} />}
                    title="Painel do Aluno"
                    description="Em breve você poderá editar seu perfil, alterar senha e gerenciar suas preferências de notificação por aqui."
                />
            </div>
        </div>
    );
}
