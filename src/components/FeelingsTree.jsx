import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Heart, Sparkles, Users, ArrowRight, BookOpen } from 'lucide-react';
import TreeVisualization from './TreeVisualization';

// --- CONFIGURAÇÃO ---
const NUM_LEAVES = 25;

// Cores expandidas (Tons terrosos e naturais)
const LEAF_COLORS = [
    '#CFA688', '#D4B491', '#9C9188', '#6B8E23', '#556B2F',
    '#8FBC8F', '#B0896D', '#A0522D', '#DEB887', '#BC8F8F',
    '#DAA520', '#CD853F', '#F4A460', '#D2B48C', '#8B4513',
    '#A52A2A', '#2E8B57', '#66CDAA'
];

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
    "Integre suas sombras para encontrar sua luz.",
    "Onde há amor, há expansão.",
    "Seja gentil com seus processos.",
    "A mudança é a única constante.",
    "Seus limites definem seu contorno, não sua prisão."
];

export default function FeelingsTree({ isModal = false }) {
    // STATES: 'intro' -> 'tree' -> 'message'
    const [viewState, setViewState] = useState('intro');
    const [leaves, setLeaves] = useState([]);
    const [resultMessage, setResultMessage] = useState(null);
    const [accessCount, setAccessCount] = useState(1243);

    useEffect(() => {
        generateTree();
        const stored = localStorage.getItem('tree_access_count');
        if (stored) {
            setAccessCount(parseInt(stored, 10));
        } else {
            localStorage.setItem('tree_access_count', '1243');
        }
    }, []);

    const generateTree = () => {
        const newLeaves = Array.from({ length: NUM_LEAVES }).map((_, i) => ({
            id: `leaf-${Date.now()}-${i}`,
            color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
            message: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
            text: ''
        }));
        setLeaves(newLeaves);
        setResultMessage(null);
    };

    const handleLeafClick = (leafData) => {
        const newCount = accessCount + 1;
        setAccessCount(newCount);
        localStorage.setItem('tree_access_count', newCount.toString());

        setResultMessage(leafData.message);
        setViewState('message');
    };

    const resetView = () => {
        setResultMessage(null);
        setViewState('tree');
    };

    const StepIndicator = ({ step }) => (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-40">
            {[1, 2, 3].map(s => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s <= step ? 'w-6 bg-stone-500/80 shadow-sm' : 'w-2 bg-stone-300/50'}`} />
            ))}
        </div>
    );

    // --- VIEW RENDERERS ---

    const renderIntro = () => (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full text-center px-6"
        >
            <StepIndicator step={1} />

            <div className="bg-stone-100 p-6 rounded-full mb-8">
                <Sparkles size={48} className="text-stone-600" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-stone-800 mb-6">Árvore da Awareness</h2>
            <p className="max-w-md text-lg text-stone-600 mb-10 leading-relaxed font-light">
                Nesta árvore, cada folha guarda uma mensagem de sabedoria gestáltica. Conecte-se com sua intuição e escolha uma.
            </p>
            <button
                onClick={() => setViewState('tree')}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-stone-800 text-white rounded-full font-bold shadow-xl hover:bg-stone-700 transition-all hover:scale-105"
            >
                <span>Entrar no Jardim</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="mt-8 text-xs font-bold text-stone-400 uppercase tracking-widest">
                {accessCount.toLocaleString()} pessoas já visitaram
            </div>
        </motion.div>
    );

    const renderTree = () => (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full h-full relative"
        >
            <StepIndicator step={2} />

            <div className="absolute top-16 left-0 right-0 text-center z-20 pointer-events-none">
                <h3 className="text-2xl font-serif text-stone-600 mb-1">Colha uma Folha</h3>
                <p className="text-sm text-stone-400">Gire a árvore e clique na folha que te chamar.</p>
            </div>

            <div className="absolute inset-0 z-10 cursor-move">
                <TreeVisualization emotions={leaves} onLeafClick={handleLeafClick} isModal={isModal} />
            </div>

            <div className="absolute bottom-12 left-0 right-0 flex justify-center z-30 pointer-events-none">
                <button
                    onClick={generateTree}
                    className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-white/80 hover:bg-white text-stone-600 font-bold rounded-full shadow-sm border border-stone-200 text-xs uppercase tracking-wider transition-all"
                >
                    <RefreshCw size={14} className="hover:rotate-180 transition-transform duration-500" />
                    Novas Folhas
                </button>
            </div>
        </motion.div>
    );

    const renderMessage = () => (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full text-center px-6 relative z-50 bg-stone-50/50"
        >
            <StepIndicator step={3} />
            <div className="absolute inset-0 z-0 bg-white/40 backdrop-blur-sm" />

            <div className="relative z-10 max-w-lg w-full bg-white p-10 md:p-14 rounded-[2.5rem] shadow-2xl border border-stone-100/50 flex flex-col items-center">
                <div className="inline-flex items-center justify-center p-4 mb-8 bg-rose-50 text-rose-500 rounded-2xl shadow-inner">
                    <Heart fill="currentColor" size={32} />
                </div>

                <blockquote className="text-2xl md:text-3xl font-serif text-stone-800 mb-10 leading-tight italic">
                    "{resultMessage}"
                </blockquote>

                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={resetView}
                        className="w-full py-4 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={18} /> Escolher Outra
                    </button>
                    {isModal && window.history.length > 1 && (
                        <button
                            onClick={() => window.history.back()}
                            className="hidden w-full py-3 text-stone-400 hover:text-stone-600 text-sm font-bold uppercase tracking-widest transition-colors"
                        >
                            Sair
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );

    return (
        <section className={`${isModal ? 'h-full w-full bg-[#faf9f6]' : 'py-24 relative overflow-hidden bg-[#faf9f6]'}`}>
            {/* Background com gradientes sutis */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-warm-50 to-stone-100" />
                <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply" />
            </div>

            <div className="container mx-auto max-w-5xl h-full relative z-10">
                <AnimatePresence mode="wait">
                    {viewState === 'intro' && renderIntro()}
                    {viewState === 'tree' && renderTree()}
                    {viewState === 'message' && renderMessage()}
                </AnimatePresence>
            </div>
        </section>
    );
}
