import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Leaf, Chrome } from 'lucide-react'; // Chrome icon works as a Google proxy icon visually

export default function AdminLogin() {
    const [loading, setLoading] = useState(false);
    const { login } = useApp();
    const navigate = useNavigate();

    const handleGoogleLogin = () => {
        setLoading(true);
        // Simulating Google Auth Delay
        setTimeout(() => {
            if (login('admin', 'admin')) {
                navigate('/admin');
            }
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-paper relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            </div>

            <div className="bg-white/90 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-sm relative z-10 border border-white/50 text-center">

                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary/5 p-4 rounded-full mb-4 ring-1 ring-primary/10">
                        <Leaf className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="font-serif text-3xl text-primary">Figura <span className="text-gold">Viva</span></h1>
                    <p className="text-sage text-sm mt-2 tracking-wide font-light">Ecossistema de Gestalt-Terapia</p>
                </div>

                <div className="space-y-6">
                    <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-4">Acesso Administrativo</p>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white border border-gray-200 text-gray-700 font-sans font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                Conectando...
                            </span>
                        ) : (
                            <>
                                {/* Google Logo Simulation */}
                                <div className="w-5 h-5 relative flex items-center justify-center">
                                    <span className="absolute">G</span>
                                </div>
                                <span>Entrar com Google Workspace</span>
                            </>
                        )}
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-400 text-xs">Acesso Seguro</span>
                        </div>
                    </div>

                    <p className="text-xs text-center text-sage/80 leading-relaxed">
                        Esta área é integrada ao Google Cloud Platform.
                        Utilize sua conta institucional (@figuraviva.com.br).
                    </p>
                </div>
            </div>
        </div>
    );
}
