import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SettingsManager() {
    const { alertMessage, setAlertMessage } = useApp();
    const [tempMsg, setTempMsg] = useState(alertMessage);

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-serif text-primary">Configurações Globais</h2>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gold" />

                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gold/10 p-3 rounded-full text-gold">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-primary">Modo "Férias" / Avisos</h3>
                        <p className="text-xs text-sage">Esta mensagem aparecerá no topo de todas as páginas.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <textarea
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-lg p-4 focus:border-gold focus:outline-none transition-colors text-primary font-medium"
                        rows={3}
                        value={tempMsg}
                        onChange={e => setTempMsg(e.target.value)}
                        placeholder="Ex: Estamos em recesso até dia 15/01. Agendamentos apenas via WhatsApp."
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 italic">
                            {tempMsg ? 'Status: Ativo' : 'Status: Inativo'}
                        </span>
                        <button
                            onClick={() => setAlertMessage(tempMsg)}
                            className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Publicar no Site
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
