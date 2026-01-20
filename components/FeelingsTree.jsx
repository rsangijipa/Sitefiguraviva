"use client";

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
    const [treeKey, setTreeKey] = useState(0);

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

    const handleReconstruct = () => {
        setTreeKey(prev => prev + 1); // Forces full 3D rebuild
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
                <TreeVisualization key={treeKey} emotions={leaves} onLeafClick={handleLeafClick} isModal={isModal} />
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
            className="flex flex-col items-center justify-center h-full text-center px-4 md:px-6 relative z-50 overflow-hidden"
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

            <div className="absolute top-6 right-4 md:right-6 z-50">
                <button
                    onClick={resetView}
                    className="flex items-center gap-2 p-3 md:px-5 md:py-2.5 rounded-full bg-stone-800 text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                    aria-label="Nova Folha"
                >
                    <RefreshCw size={18} />
                    <span className="hidden md:inline">Nova Folha</span>
                </button>
            </div>

            <StepIndicator step={3} />

            {/* Background Blur */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-0 bg-white/60 backdrop-blur-md"
            />

            {/* GIANT HORIZONTAL LEAF SVG */}
            <motion.div
                initial={{ scale: 0.8, rotate: -2, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.3, duration: 1 }}
                className="relative z-10 w-full max-w-2xl aspect-[1.6/1] flex items-center justify-center drop-shadow-2xl filter"
                style={{
                    filter: "drop-shadow(0px 20px 30px rgba(0,0,0,0.15))"
                }}
            >
                <svg viewBox="0 0 600 380" className="absolute inset-0 w-full h-full overflow-visible">
                    <defs>
                        {/* Gradient for subtle sheen */}
                        <linearGradient id="leafSheen" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                        </linearGradient>
                        {/* Texture Filter */}
                        <filter id="noiseFilter">
                            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                            <feColorMatrix type="saturate" values="0" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.1" />
                            </feComponentTransfer>
                        </filter>
                    </defs>

                    {/* Main Leaf Shape - Horizontal & Organic */}
                    <path
                        d="M35 190 
                           C 35 190, 80 80, 250 40 
                           C 450 0, 565 150, 565 190
                           C 565 230, 450 380, 250 340
                           C 80 300, 35 190, 35 190 Z"
                        fill={selectedColor}
                        stroke="rgba(0,0,0,0.05)"
                        strokeWidth="1"
                    />

                    {/* Texture Overlay */}
                    <path
                        d="M35 190 
                           C 35 190, 80 80, 250 40 
                           C 450 0, 565 150, 565 190
                           C 565 230, 450 380, 250 340
                           C 80 300, 35 190, 35 190 Z"
                        fill="url(#leafSheen)"
                        filter="url(#noiseFilter)"
                        style={{ mixBlendMode: 'overlay' }}
                    />

                    {/* Central Vein */}
                    <path
                        d="M50 190 Q 300 185 550 190"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                    />

                    {/* Side Veins Upper */}
                    <path d="M150 190 C 160 150, 180 120, 220 80" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
                    <path d="M280 190 C 290 150, 310 120, 350 80" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
                    <path d="M410 190 C 420 160, 430 140, 460 110" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />

                    {/* Side Veins Lower */}
                    <path d="M150 190 C 160 230, 180 260, 220 300" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
                    <path d="M280 190 C 290 230, 310 260, 350 300" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
                    <path d="M410 190 C 420 220, 430 240, 460 270" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />

                </svg>

                {/* Content Overlay */}
                <div className="relative z-20 px-16 py-8 flex flex-col items-center justify-center text-center h-full w-full">
                    <div className="mb-4 text-white/90 drop-shadow-sm">
                        <Sparkles size={28} strokeWidth={1.5} />
                    </div>

                    <blockquote className="text-xl md:text-3xl font-serif leading-snug tracking-wide italic text-white drop-shadow-md max-w-lg">
                        "{resultMessage}"
                    </blockquote>
                </div>
            </motion.div>

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
