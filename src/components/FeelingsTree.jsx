
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, RefreshCw, Heart, Sparkles } from 'lucide-react';
import TreeVisualization from './TreeVisualization';

// --- CONFIGURAÇÃO ---
const MAX_FEELINGS = 12;

// Cores expandidas (Tons terrosos e naturais)
const LEAF_COLORS = [
    '#CFA688', '#D4B491', '#9C9188', '#6B8E23', '#556B2F',
    '#8FBC8F', '#B0896D', '#A0522D', '#DEB887', '#BC8F8F',
    '#DAA520', '#CD853F', '#F4A460', '#D2B48C', '#8B4513',
    '#A52A2A', '#2E8B57', '#66CDAA'
];

// --- BANCO DE MENSAGENS ---
const MESSAGES = [
    "A consciência é o primeiro passo para a cura.",
    "O aqui e agora é o único lugar onde a vida acontece.",
    "Respeite o seu ritmo; ele é a sua maior sabedoria.",
    "Tudo o que você sente tem direito de existir.",
    "O contato é a fronteira onde o eu encontra o mundo.",
    "Você não é o que lhe aconteceu, você é o que escolhe se tornar.",
    "Sua vulnerabilidade é sua maior força.",
    "Permita-se ser quem você é.",
    "O vazio fértil é onde o novo pode nascer.",
    "Respire. O ar que entra renova a vida.",
    "Confie na autorregulação do seu organismo.",
    "O corpo fala o que a boca cala. Escute-o.",
    "A beleza está na autenticidade do ser.",
    "Integre suas sombras para encontrar sua luz."
];

export default function FeelingsTree() {
    const [feelings, setFeelings] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [resultMessage, setResultMessage] = useState(null);

    const showMessage = () => {
        setTimeout(() => {
            const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
            setResultMessage(randomMsg);
        }, 500);
    };

    const handleAddFeeling = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newFeeling = {
            id: Date.now().toString(),
            text: inputValue,
            color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
        };

        const newFeelingsList = [...feelings, newFeeling];
        setFeelings(newFeelingsList);
        setInputValue('');

        if (newFeelingsList.length === MAX_FEELINGS) {
            setTimeout(() => {
                const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
                setResultMessage(randomMsg);
            }, 1500);
        }
    };

    const handleEarlyFinish = () => {
        if (feelings.length > 0) {
            showMessage();
        }
    };

    const resetTree = () => {
        setFeelings([]);
        setResultMessage(null);
        setInputValue('');
    };

    return (
        <section className="py-24 relative overflow-hidden bg-[#faf9f6]">
            {/* Background com gradientes sutis */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-purple-50/20 to-orange-50/30" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100/40 via-transparent to-transparent opacity-70" />
            </div>

            <div className="container mx-auto px-4 max-w-5xl relative z-10 flex flex-col items-center">

                {/* Cabeçalho */}
                <div className="text-center mb-12 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-stone-200/50 backdrop-blur-sm shadow-sm mb-4"
                    >
                        <Sparkles size={14} className="text-amber-500/80" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold">Autoconhecimento 3D</span>
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-serif text-stone-800 mb-4 tracking-tight">
                        Árvore da Awareness
                    </h2>
                    <p className="text-lg text-stone-500 font-light leading-relaxed">
                        Plante seus sentimentos e veja sua árvore crescer. <br className="hidden md:block" />
                        (Interaja com a árvore girando e aproximando)
                    </p>
                </div>

                {/* Card Principal 3D */}
                <div className="relative w-full aspect-[4/5] md:aspect-[16/10] max-h-[700px] bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">

                    {/* --- 3D SCENE CONTAINER --- */}
                    <div className="absolute inset-0 z-0 cursor-move">
                        <TreeVisualization emotions={feelings} />
                    </div>

                    {/* --- UI LAYER: CONTROLES & FEEDBACK --- */}
                    <div className="relative z-20 mt-auto w-full flex flex-col items-center pb-8 md:pb-12 px-6 pointer-events-none">
                        {/* Wrapper para tornar inputs clicáveis */}
                        <div className="w-full max-w-lg pointer-events-auto">
                            {!resultMessage ? (
                                <div className="space-y-4">
                                    {/* Contador */}
                                    <div className="flex justify-between items-end px-2">
                                        <div className="text-xs font-bold uppercase tracking-widest text-stone-400">
                                            Seus Sentimentos
                                        </div>
                                        <div className="bg-white/50 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-stone-600 shadow-sm border border-white/60">
                                            {feelings.length} / {MAX_FEELINGS}
                                        </div>
                                    </div>

                                    {/* Input Area */}
                                    <form onSubmit={handleAddFeeling} className="relative group">
                                        <div className="absolute inset-0 bg-white/40 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative flex items-center bg-white/80 backdrop-blur-xl border border-white rounded-full shadow-lg p-1.5 focus-within:ring-2 focus-within:ring-rose-200/50 transition-all">
                                            <input
                                                type="text"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                placeholder={feelings.length === 0 ? "Como você se sente agora?" : "Mais algum sentimento?"}
                                                disabled={feelings.length >= MAX_FEELINGS}
                                                className="flex-1 bg-transparent border-none px-6 py-3 text-stone-700 placeholder:text-stone-400 focus:outline-none text-lg font-medium"
                                                aria-label="Digite um sentimento"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!inputValue.trim() || feelings.length >= MAX_FEELINGS}
                                                className="p-3 bg-stone-800 text-white rounded-full hover:bg-stone-700 disabled:opacity-30 transition-all shadow-md active:scale-95"
                                                aria-label="Adicionar Sentimento"
                                            >
                                                <Send size={20} />
                                            </button>
                                        </div>
                                    </form>

                                    {feelings.length > 0 && feelings.length < MAX_FEELINGS && (
                                        <motion.button
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            onClick={handleEarlyFinish}
                                            className="w-full text-center text-xs text-stone-500 hover:text-stone-800 underline decoration-stone-300 underline-offset-4 transition-colors py-2"
                                        >
                                            Já é o suficiente, ver mensagem agora
                                        </motion.button>
                                    )}
                                </div>
                            ) : (
                                /* CARD MENSAGEM FINAL */
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="w-full"
                                >
                                    <div className="bg-white/90 backdrop-blur-2xl p-8 md:p-12 rounded-[2rem] shadow-2xl border border-white text-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-200 via-amber-200 to-blue-200" />
                                        <div className="inline-flex items-center justify-center p-3 mb-6 bg-rose-50 text-rose-500 rounded-2xl shadow-inner">
                                            <Heart fill="currentColor" size={28} />
                                        </div>
                                        <blockquote className="text-2xl md:text-3xl font-serif text-stone-800 mb-8 leading-tight">
                                            "{resultMessage}"
                                        </blockquote>
                                        <button
                                            onClick={resetTree}
                                            className="group inline-flex items-center gap-2 px-8 py-3 bg-stone-100 hover:bg-white text-stone-600 font-semibold rounded-full border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all duration-300 pointer-events-auto"
                                        >
                                            <RefreshCw size={16} className="group-hover:-rotate-180 transition-transform duration-700" />
                                            <span>Plantamos novamente?</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
