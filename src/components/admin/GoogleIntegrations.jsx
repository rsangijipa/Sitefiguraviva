import { useState } from 'react';
import { LayoutTemplate, Calendar, Database, Youtube } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function GoogleIntegrations() {
    const { googleConfig, setGoogleConfig } = useApp();
    const [localConfig, setLocalConfig] = useState(googleConfig);
    const [errors, setErrors] = useState({});

    const validate = (name, value) => {
        if (!value) return "";
        if (name === 'calendarId' && !value.includes('@')) return "ID inválido (deve conter @)";
        if (name === 'driveFolderId' && value.length < 5) return "ID muito curto";
        if (name === 'formsUrl' && !value.startsWith('https://docs.google.com/forms')) return "URL deve ser do Google Forms";
        return "";
    };

    const handleUpdate = (key, value) => {
        const error = validate(key, value);
        setErrors(prev => ({ ...prev, [key]: error }));

        const newConfig = { ...localConfig, [key]: value };
        setLocalConfig(newConfig);

        // Auto-save only if valid
        if (!error) {
            setGoogleConfig(newConfig);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="border-b border-gray-200 pb-5">
                <h2 className="text-3xl font-serif text-primary">Conexões Google</h2>
                <p className="text-sage text-sm">Gerencie o "motor" por trás do seu site.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Google Calendar */}
                <div className={`bg-white p-6 rounded-xl shadow-sm border ${errors.calendarId ? 'border-red-300' : 'border-gray-200'} relative overflow-hidden group hover:border-blue-200 transition-colors`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <LayoutTemplate size={80} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <Calendar size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800">Google Calendar</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Define qual agenda é exibida publicamente na seção "Agenda Viva".</p>
                    <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 text-xs p-3 rounded mb-2 font-mono text-gray-600 focus:ring-1 focus:ring-blue-500 outline-none"
                        value={localConfig.calendarId}
                        onChange={(e) => handleUpdate('calendarId', e.target.value)}
                    />
                    {errors.calendarId ? (
                        <div className="text-red-500 text-xs font-bold">{errors.calendarId}</div>
                    ) : (
                        <div className="flex items-center gap-2 text-green-600 text-xs font-bold">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Conectado via API Simples
                        </div>
                    )}
                </div>

                {/* Google Drive */}
                <div className={`bg-white p-6 rounded-xl shadow-sm border ${errors.driveFolderId ? 'border-red-300' : 'border-gray-200'} relative overflow-hidden group hover:border-green-200 transition-colors`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Database size={80} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                            <Database size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800">Google Drive</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Pasta raiz para o "Portal do Aluno". Arquivos colocados lá aparecem automaticamente.</p>
                    <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 text-xs p-3 rounded mb-2 font-mono text-gray-600 focus:ring-1 focus:ring-green-500 outline-none"
                        value={localConfig.driveFolderId}
                        onChange={(e) => handleUpdate('driveFolderId', e.target.value)}
                    />
                    {errors.driveFolderId && <div className="text-red-500 text-xs font-bold">{errors.driveFolderId}</div>}
                    {!errors.driveFolderId && <button className="text-xs text-primary font-bold hover:underline">Testar Permissões</button>}
                </div>

                {/* Google Forms */}
                <div className={`bg-white p-6 rounded-xl shadow-sm border ${errors.formsUrl ? 'border-red-300' : 'border-gray-200'} relative overflow-hidden group hover:border-purple-200 transition-colors`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <LayoutTemplate size={80} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                            <LayoutTemplate size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800">Google Forms</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Link para o formulário de anamnese/intake clínico.</p>
                    <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 text-xs p-3 rounded mb-2 font-mono text-gray-600 focus:ring-1 focus:ring-purple-500 outline-none"
                        value={localConfig.formsUrl}
                        onChange={(e) => handleUpdate('formsUrl', e.target.value)}
                    />
                    {errors.formsUrl && <div className="text-red-500 text-xs font-bold">{errors.formsUrl}</div>}
                </div>

                {/* Youtube */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden group hover:border-red-200 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Youtube size={80} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                            <Youtube size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800">Youtube Channel</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Canal fonte para vídeos públicos.</p>
                    <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 text-xs p-3 rounded mb-2 font-mono text-gray-600 focus:ring-1 focus:ring-red-500 outline-none"
                        value={localConfig.youtubeId}
                        onChange={(e) => handleUpdate('youtubeId', e.target.value)}
                    />
                </div>

            </div>
        </div>
    );
}
