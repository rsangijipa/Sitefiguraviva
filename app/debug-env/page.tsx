"use client";
import { useEffect, useState } from 'react';

export default function DebugEnv() {
    const [vars, setVars] = useState<any>({});

    useEffect(() => {
        setVars({
            url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Presente' : '❌ Ausente',
            key: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) ? '✅ Presente' : '❌ Ausente',
            emails: process.env.NEXT_PUBLIC_ADMIN_EMAILS ? '✅ Presente' : '❌ Ausente',
        });
    }, []);

    return (
        <div className="p-10 font-mono">
            <h1 className="text-2xl mb-4">Debug de Variáveis Vercel</h1>
            <pre className={JSON.stringify(vars).includes('❌') ? 'text-red-500' : 'text-green-500'}>
                {JSON.stringify(vars, null, 2)}
            </pre>
            <p className="mt-4 text-sm text-gray-500">
                Se as variáveis estiverem ausentes, adicione-as no painel do Vercel e faça um novo deploy.
            </p>
        </div>
    );
}
