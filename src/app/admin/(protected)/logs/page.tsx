"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { Card } from '@/components/ui/Card';
import { Clock, AlertTriangle, AlertCircle, Info, ExternalLink } from 'lucide-react';

export default function SystemLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | 'error' | 'critical'>('all');

    useEffect(() => {
        let q = query(
            collection(db, 'system_logs'),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        if (filter !== 'all') {
            q = query(
                collection(db, 'system_logs'),
                where('severity', '==', filter),
                orderBy('createdAt', 'desc'),
                limit(50)
            );
        }

        const unsub = onSnapshot(q, (snapshot) => {
            setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsub();
    }, [filter]);

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-serif text-3xl text-primary">Logs do Sistema</h1>
                    <p className="text-stone-500 font-light text-sm">Monitoramento de erros de webhook e infraestrutura.</p>
                </div>
                <div className="flex gap-2">
                    {['all', 'error', 'critical'].map((sev) => (
                        <button
                            key={sev}
                            onClick={() => setFilter(sev as any)}
                            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${filter === sev
                                    ? 'bg-primary text-white'
                                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                                }`}
                        >
                            {sev}
                        </button>
                    ))}
                </div>
            </header>

            <div className="space-y-4">
                {logs.length === 0 ? (
                    <div className="p-12 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                        <p className="text-stone-400">Nenhum log encontrado para este filtro.</p>
                    </div>
                ) : (
                    logs.map((log) => (
                        <Card key={log.id} className={`p-4 border-l-4 ${log.severity === 'critical' ? 'border-l-red-600 bg-red-50/50' :
                                log.severity === 'error' ? 'border-l-red-400' :
                                    log.severity === 'warning' ? 'border-l-amber-400' :
                                        'border-l-blue-400'
                            }`}>
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${log.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                                log.severity === 'error' ? 'bg-red-50 text-red-600' :
                                                    log.severity === 'warning' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-blue-50 text-blue-600'
                                            }`}>
                                            {log.severity}
                                        </span>
                                        <span className="text-xs font-mono text-stone-400 uppercase">{log.source}</span>
                                    </div>
                                    <p className="font-bold text-stone-800 text-sm">{log.message || 'Sem mensagem'}</p>

                                    {log.context && (
                                        <div className="mt-2 text-xs font-mono bg-white/50 p-2 rounded border border-black/5 overflow-x-auto max-w-2xl">
                                            <pre>{JSON.stringify(log.context, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>

                                <div className="text-[10px] text-stone-400 font-mono shrink-0 flex flex-col items-end">
                                    <div className="flex items-center gap-1">
                                        <Clock size={10} />
                                        {log.createdAt?.toDate?.()?.toLocaleString() || '...'}
                                    </div>
                                    <div className="mt-1 text-primary/30">ID: {log.id}</div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
