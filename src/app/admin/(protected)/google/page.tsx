"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { CheckCircle, AlertCircle, ExternalLink, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GoogleIntegrations() {
    const [config, setConfig] = useState({
        calendarId: '',
        driveFolderId: '',
        formsUrl: '',
        youtubeId: ''
    });
    // Default empty config for discard action
    const emptyConfig = {
        calendarId: '',
        driveFolderId: '',
        formsUrl: '',
        youtubeId: ''
    };
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const docSnap = await getDoc(doc(db, 'pages', 'config')); // Storing in pages/config
                if (docSnap.exists()) {
                    setConfig(docSnap.data() as any);
                }
            } catch (e) {
                console.error("Error fetching config", e);
            }
        };
        fetchConfig();
    }, []);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async () => {
        try {
            await setDoc(doc(db, 'pages', 'config'), config, { merge: true });
            showToast('Configurações salvas e aplicadas com sucesso!');
        } catch (e) {
            console.error(e);
            showToast('Erro ao salvar.', 'error');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const integrationFields = [
        { key: 'calendarId', label: 'Google Calendar ID', placeholder: 'ex: pt.brazilian#holiday@group.v...', help: 'ID do calendário público para exibir na Home.' },
        { key: 'driveFolderId', label: 'Google Drive Folder ID', placeholder: 'ex: 1A2b3C...', help: 'ID da pasta onde estão os materiais dos alunos.' },
        { key: 'formsUrl', label: 'Google Forms URL', placeholder: 'https://docs.google.com/forms/...', help: 'Link direto para o formulário de anamnese.' },
        { key: 'youtubeId', label: 'YouTube Channel/Video ID', placeholder: 'ID do canal ou vídeo destaque', help: 'Para futuras integrações de vídeo.' },
    ];

    return (
        <div className="relative">
            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className={`fixed top-10 left-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${toast.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' : 'bg-red-500/90 border-red-400 text-white'
                            }`}
                    >
                        {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        <span className="font-bold text-xs uppercase tracking-wider">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-primary/5">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h3 className="font-serif text-2xl mb-2">Integrações Google</h3>
                        <p className="text-primary/40 text-sm max-w-lg">Conecte os serviços do Google para automatizar o conteúdo do site. As alterações refletem imediatamente.</p>
                    </div>
                </header>

                <div className="grid gap-8">
                    {integrationFields.map((field) => (
                        <div key={field.key} className="group">
                            <label className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 mb-3 ml-2">
                                <span className="flex items-center gap-2">
                                    {field.label}
                                </span>
                                {config[field.key] && (
                                    <span className="text-green-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <CheckCircle size={10} /> Conectado
                                    </span>
                                )}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name={field.key}
                                    value={config[field.key] || ''}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all font-mono text-sm text-primary"
                                />
                                {config[field.key] && (
                                    <button
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30 hover:text-gold transition-colors"
                                        title="Testar Link"
                                        onClick={() => showToast('Validando conexão... (Simulado)')}
                                    >
                                        <ExternalLink size={16} />
                                    </button>
                                )}
                            </div>
                            <p className="mt-2 ml-2 text-xs text-primary/30 font-light">{field.help}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end gap-4">
                    <button
                        onClick={() => setConfig(emptyConfig)}
                        className="px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:bg-gray-50 transition-colors"
                    >
                        Descartar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-4 bg-primary text-paper rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-soft hover:shadow-lg flex items-center gap-2"
                    >
                        <Save size={16} /> Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
}
