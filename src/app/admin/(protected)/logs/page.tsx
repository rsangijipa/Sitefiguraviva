'use client';

import { useState, useEffect } from 'react';
import { getAuditLogs } from '@/actions/audit';
import { Loader2, RefreshCw, Smartphone, Globe, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        const res = await getAuditLogs(50);
        if (res.success) {
            setLogs(res.logs);
        } else {
            alert('Failed to fetch logs: ' + res.error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="p-6 md:p-10 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-800">Logs de Auditoria</h1>
                    <p className="text-stone-500">Rastreamento imutável de ações críticas do sistema.</p>
                </div>
                <Button onClick={fetchLogs} disabled={loading} leftIcon={<RefreshCw className={loading ? 'animate-spin' : ''} size={16} />}>
                    Atualizar
                </Button>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-stone-50 text-stone-500 font-medium border-b border-stone-100">
                            <tr>
                                <th className="px-6 py-4">Data/Hora</th>
                                <th className="px-6 py-4">Ação</th>
                                <th className="px-6 py-4">Ator (UID)</th>
                                <th className="px-6 py-4">Alvo</th>
                                <th className="px-6 py-4">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-stone-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-stone-500 whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-stone-700">
                                        <span className="bg-stone-100 px-2 py-1 rounded border border-stone-200">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-stone-600 font-mono text-xs">
                                        <div className="flex flex-col">
                                            <span>{log.actor?.email || 'N/A'}</span>
                                            <span className="text-stone-400">{log.actor?.uid}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-stone-600">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{log.target?.collection}</span>
                                            <span className="font-mono text-xs text-stone-400">{log.target?.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.diff && (
                                            <details className="cursor-pointer">
                                                <summary className="text-xs text-blue-600 font-medium select-none hover:underline">Ver Diff</summary>
                                                <div className="mt-2 p-2 bg-stone-900 text-green-400 rounded text-[10px] font-mono whitespace-pre-wrap max-w-xs overflow-auto max-h-40">
                                                    {JSON.stringify(log.diff, null, 2)}
                                                </div>
                                            </details>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!loading && logs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-stone-400">
                                        Nenhum log encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
