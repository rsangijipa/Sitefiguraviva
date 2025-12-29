import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Heart, Sparkles, Users, ArrowRight, BookOpen, ArrowLeft } from 'lucide-react';
import TreeVisualization from './TreeVisualization';
import { interactionService } from '../services/interactionService';

const NUM_LEAVES = 25;

const LEAF_COLORS = [
    '#D8A48F', '#C2B280', '#A89F91', // Muted Earth
    '#6B8E23', '#556B2F', '#8FBC8F', // Greens
    '#CD853F', '#DEB887', '#BC8F8F', // Warm Browns
    '#DAA520', '#B8860B', '#808000'  // Golds
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
    "Seus limites definem seu contorno, não sua prisão.",
    "A terapia é um ensaio para a vida.",
    "O todo é diferente da soma das partes."
];

export default function FeelingsTree({ isModal = false, onClose }) {
    const [viewState, setViewState] = useState('intro'); // 'intro' | 'tree' | 'message'
    const [leaves, setLeaves] = useState([]);
    const [resultMessage, setResultMessage] = useState(null);
    const [accessCount, setAccessCount] = useState(1243);
    const [selectedColor, setSelectedColor] = useState('#fff');

    useEffect(() => {
        generateTree();
        const fetchCount = async () => {
            const count = await interactionService.getTreeCount();
            setAccessCount(count);
        };
        fetchCount();
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
        setAccessCount(prev => prev + 1);
        interactionService.incrementTreeCount();
        setResultMessage(leafData.message);
        setSelectedColor(leafData.color);
        setViewState('message');
    };

    const resetView = () => {
        setResultMessage(null);
        setViewState('tree');
    };

    // Reconstruct Tree Function (Replaces visual button)
    const handleReconstruct = () => {
        // Animation feedback could be added here
        generateTree();
    };

    const StepIndicator = ({ step }) => (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-40">
            {[1, 2, 3].map(s => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s <= step ? 'w-6 bg-stone-500/80 shadow-sm' : 'w-2 bg-stone-300/50'}`} />
            ))}
        </div>
    );

    const renderIntro = () => (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full text-center px-6 relative"
        >
            <div className="absolute top-6 left-4 md:left-6 z-50">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 p-3 md:px-5 md:py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-primary hover:border-primary/30 font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                    aria-label="Voltar"
                >
                    <ArrowLeft size={20} />
                    <span className="hidden md:inline">Voltar</span>
                </button>
            </div>

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
            <div className="absolute top-6 left-4 md:left-6 z-50">
                <button
                    onClick={() => setViewState('intro')}
                    className="flex items-center gap-2 p-3 md:px-5 md:py-2.5 rounded-full bg-white/80 backdrop-blur border border-gray-200 text-gray-700 hover:text-primary hover:border-primary/30 font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                    aria-label="Voltar"
                >
                    <ArrowLeft size={20} />
                    <span className="hidden md:inline">Voltar</span>
                </button>
            </div>

            <StepIndicator step={2} />

            <div className="absolute top-16 left-0 right-0 text-center z-20 pointer-events-none">
                <h3 className="text-2xl font-serif text-stone-600 mb-1">Colha uma Folha</h3>
                <p className="text-sm text-stone-400">Gire a árvore e clique na folha que te chamar.</p>
            </div>

            {/* Tree Container - Above Button */}
            <div className="absolute top-0 bottom-24 left-0 right-0 z-10 cursor-move">
                <TreeVisualization emotions={leaves} onLeafClick={handleLeafClick} isModal={isModal} />
            </div>

            {/* Reconstruct/Refresh Button (Bottom Center) */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center z-30 pointer-events-none">
                <button
                    onClick={handleReconstruct}
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
            className="flex flex-col items-center justify-center h-full text-center px-6 relative z-50 overflow-hidden"
        >
            <div className="absolute top-6 left-4 md:left-6 z-50">
                <button
                    onClick={() => setViewState('tree')}
                    className="flex items-center gap-2 p-3 md:px-5 md:py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-primary hover:border-primary/30 font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                    aria-label="Voltar"
                >
                    <ArrowLeft size={20} />
                    <span className="hidden md:inline">Voltar</span>
                </button>
            </div>

            <StepIndicator step={3} />

            {/* Background Blur */}
            <div className="absolute inset-0 z-0 bg-white/60 backdrop-blur-md" />

            {/* LEAF CARD CONTAINER */}
            <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="relative z-10 w-full max-w-xl aspect-[4/5] flex flex-col items-center justify-center p-12 md:p-20 shadow-2xl drop-shadow-2xl"
                style={{
                    // Leaf Shape Clip Path
                    clipPath: "path('M250 500 C100 400 0 200 250 50 C500 200 400 400 250 500 Z')",
                    backgroundColor: selectedColor,
                    // Subtle texture overlay via gradient
                    backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent), linear-gradient(to bottom right, rgba(255,255,255,0.1), rgba(0,0,0,0.1))"
                }}
            >
                {/* Simulated Vein */}
                <div className="absolute inset-0 border-r-2 border-white/20 w-1/2 h-full pointer-events-none" style={{ transform: "skewX(-5deg)" }} />

                <div className="relative z-20 text-white text-center flex flex-col items-center">
                    <div className="mb-6 opacity-80">
                        <Sparkles size={32} />
                    </div>

                    <blockquote className="text-2xl md:text-3xl font-serif leading-snug tracking-wide italic drop-shadow-md">
                        "{resultMessage}"
                    </blockquote>
                </div>
            </motion.div>

            <div className="relative z-20 mt-12">
                <button
                    onClick={resetView}
                    className="px-8 py-3 bg-stone-800 text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
                >
                    Escolher Outra Folha
                </button>
            </div>

        </motion.div>
    );

    return (
        <section className={`${isModal ? 'h-full w-full bg-[#f2f0e9]' : 'py-24 relative overflow-hidden bg-[#f2f0e9]'}`}>
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
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
