'use client';

import { stopImpersonation } from '@/actions/authAdmin';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ImpersonationBanner() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleStop = async () => {
        setLoading(true);
        await stopImpersonation();
        // stopImpersonation calls redirect, but we can also force refresh client-side just in case
        // window.location.href = '/login'; // Server action handles redirect
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
            <div className="bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border-2 border-red-400">
                <div className="bg-white/20 p-2 rounded-full">
                    <ShieldAlert size={24} className="animate-pulse" />
                </div>
                <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider">Modo Espião Ativo</h4>
                    <p className="text-xs text-red-100">Você está acessando como outro usuário.</p>
                </div>
                <button
                    onClick={handleStop}
                    disabled={loading}
                    className="ml-4 bg-white text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                    <LogOut size={14} />
                    {loading ? 'Saindo...' : 'SAIR'}
                </button>
            </div>
        </div>
    );
}
