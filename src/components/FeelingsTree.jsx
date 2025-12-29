import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RefreshCw, Heart, Sparkles, ArrowRight } from 'lucide-react';

// --- CONFIGURAÇÃO ---
const MAX_FEELINGS = 5; // Solicitado aumento para 5

// Cores expandidas (15% mais cores/tons)
const LEAF_COLORS = [
    '#CFA688', '#D4B491', '#9C9188', '#6B8E23', '#556B2F',
    '#8FBC8F', '#B0896D', '#A0522D', '#DEB887', '#BC8F8F',
    '#DAA520', '#CD853F', '#F4A460', '#D2B48C'
];

// --- BANCO DE MENSAGENS (Preservado) ---
const MESSAGES = [
    "A consciência é o primeiro passo para a cura.",
    "O aqui e agora é o único lugar onde a vida acontece.",
    "Respeite o seu ritmo; ele é a sua maior sabedoria.",
    "Tudo o que você sente tem direito de existir.",
    "O contato é a fronteira onde o eu encontra o mundo.",
    "Não empurre o rio, ele corre sozinho.",
    "Acolher a dor é transformá-la em fluxo.",
    "Você não é o que lhe aconteceu, você é o que escolhe se tornar.",
    "O todo é diferente da soma das partes.",
    "Sua vulnerabilidade é sua maior força.",
    "Permita-se ser quem você é, não quem esperam que você seja.",
    "O vazio fértil é onde o novo pode nascer.",
    "Respire. O ar que entra renova a vida.",
    "Cada emoção é um mensageiro; escute a mensagem.",
    "A mudança acontece quando você se torna o que é, não quando tenta ser o que não é.",
    "Confie na autorregulação do seu organismo.",
    "Feche ciclos para que novos possam se abrir.",
    "A vida é um eterno vir a ser.",
    "Sinta os seus pés no chão; essa é a sua base.",
    "O encontro genuíno transforma ambos.",
    "Olhe para dentro com a mesma gentileza que olha para um amigo.",
    "A angústia é a vertigem da liberdade.",
    "Dê forma ao que está informe dentro de você.",
    "Ajustamento criativo é a arte de sobreviver e viver.",
    "Sua presença é o seu maior presente.",
    "Não busque a perfeição, busque a inteireza.",
    "O corpo fala o que a boca cala. Escute-o.",
    "Fronteiras saudáveis permitem encontros saudáveis.",
    "Você é o artista da sua própria existência.",
    "A responsabilidade é a habilidade de responder à vida.",
    "Aceitação não é resignação, é clareza.",
    "O que você resiste, persiste.",
    "Florir exige passar por todas as estações.",
    "A cura vem do contato, não do isolamento.",
    "Sua história é o solo onde você planta o seu futuro.",
    "Gentileza consigo mesmo é um ato revolucionário.",
    "O passado é referência, não residência.",
    "Cada respiração é uma nova oportunidade de awareness.",
    "Honre suas necessidades no momento presente.",
    "O amor é o reconhecimento do outro como legítimo outro.",
    "A awareness cura por si só.",
    "Deixe ir o que já não lhe serve mais.",
    "A beleza está na autenticidade do ser.",
    "Você é suficiente exatamente como é agora.",
    "A vida acontece no intervalo entre uma inspiração e outra.",
    "Confie no processo, mesmo quando não vir o resultado.",
    "Integre suas sombras para encontrar sua luz.",
    "O caminho se faz caminhando.",
    "Estar presente é o maior ato de amor.",
    "Acolha sua criança interior com carinho."
];

export default function FeelingsTree() {
    const [feelings, setFeelings] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [resultMessage, setResultMessage] = useState(null);

    // Lógica de posição da copa (Mantida e ajustada para design mais preenchido)
    const getCanopyPosition = (isUser = false) => {
        const angle = Math.random() * Math.PI * 2;
        const u = Math.random() + Math.random();
        const r = (u > 1 ? 2 - u : u) * 45;

        // Ajuste oval para a copa
        const x = 50 + r * Math.cos(angle) * 0.9;
        const y = 35 + r * Math.sin(angle) * 0.7;

        return {
            top: `${Math.max(5, Math.min(75, y))}%`,
            left: `${Math.max(5, Math.min(95, x))}%`,
            rotation: Math.random() * 360,
            scale: isUser ? 1.1 : (0.4 + Math.random() * 0.5), // User leaves 10% larger
            color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)]
        };
    };

    // Folhas decorativas estáticas (Quantidade aumentada em 10% aprox -> 45)
    const decorativeLeaves = useMemo(() =>
        Array.from({ length: 45 }).map((_, i) => ({
            id: `dec-${i}`,
            ...getCanopyPosition(false),
            delay: Math.random() * 2
        })), []
    );

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
            id: Date.now(),
            text: inputValue,
            ...getCanopyPosition(true),
        };

        const newFeelingsList = [...feelings, newFeeling];
        setFeelings(newFeelingsList);
        setInputValue('');

        // Gatilho automático ao atingir o máximo
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
            {/* Background sofisticado com mais camadas de cor */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-purple-50/20 to-orange-50/30" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100/40 via-transparent to-transparent opacity-70" />
                <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-rose-100/30 via-transparent to-transparent opacity-60" />
            </div>

            <div className="container mx-auto px-4 max-w-5xl relative z-10 flex flex-col items-center">

                {/* Cabeçalho Editorial */}
                <div className="text-center mb-12 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-stone-200/50 backdrop-blur-sm shadow-sm mb-4"
                    >
                        <Sparkles size={14} className="text-amber-500/80" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold">Autoconhecimento</span>
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-serif text-stone-800 mb-4 tracking-tight">
                        Árvore da Awareness
                    </h2>
                    <p className="text-lg text-stone-500 font-light leading-relaxed">
                        Reconheça e acolha o que floresce em você. <br className="hidden md:block" />
                        Quais sentimentos habitam seu "aqui e agora"?
                    </p>
                </div>

                {/* Card Principal (Glassmorphism) */}
                <div className="relative w-full aspect-[4/5] md:aspect-[16/10] max-h-[700px] bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">

                    {/* --- CENÁRIO: COPA DA ÁRVORE --- */}
                    <div className="absolute inset-0 z-0">
                        {/* ÁRVORE SVG ARTÍSTICA (Fundo Orgânico) */}
                        <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[90%] pointer-events-none text-primary" viewBox="0 0 600 700" preserveAspectRatio="xMidYMax slice">
                            <defs>
                                <linearGradient id="treeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
                                </linearGradient>
                            </defs>

                            {/* Copa Abstrata (Formas fluidas de fundo) */}
                            <g fill="currentColor" opacity="0.05">
                                <circle cx="300" cy="250" r="180" />
                                <circle cx="150" cy="350" r="120" />
                                <circle cx="450" cy="300" r="140" />
                                <circle cx="300" cy="100" r="80" />
                            </g>

                            {/* Tronco e Galhos Orgânicos (Estilo Aquarela Fluida) */}
                            <path
                                fill="url(#treeGradient)"
                                d="M280,700 
                                   C220,600 250,550 260,450 
                                   C200,400 100,420 60,350 
                                   C40,300 80,250 120,280 
                                   C180,320 240,380 270,350
                                   C260,250 180,200 160,120
                                   C200,80 260,150 290,250
                                   C310,180 380,100 440,120
                                   C480,150 420,220 360,280
                                   C420,260 520,220 560,280
                                   C580,340 500,380 400,360
                                   C440,450 480,500 420,550
                                   C380,600 340,620 320,700 
                                   Z"
                            />

                            {/* Detalhes finos de galhos (linhas suaves) */}
                            <g stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" strokeLinecap="round">
                                <path d="M260,450 C200,400 150,350 140,250" />
                                <path d="M290,250 C300,150 350,100 400,100" />
                                <path d="M360,280 C450,250 500,250 540,280" />
                            </g>
                        </svg>

                        {/* Folhas Decorativas (Design System: Opacity menor, float leve) */}
                        {decorativeLeaves.map((leaf) => (
                            <motion.div
                                key={leaf.id}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 0.5, scale: leaf.scale }}
                                transition={{ duration: 1.5, delay: leaf.delay }}
                                className="absolute pointer-events-none"
                                style={{ top: leaf.top, left: leaf.left }}
                            >
                                <div
                                    className="w-6 h-6 rounded-full rounded-br-none shadow-sm"
                                    style={{
                                        backgroundColor: leaf.color,
                                        transform: `rotate(${leaf.rotation}deg)`,
                                    }}
                                />
                            </motion.div>
                        ))}

                        {/* Folhas do Usuário (Design System: Premium, Highlight, Sombra) */}
                        <AnimatePresence>
                            {feelings.map((leaf) => (
                                <motion.div
                                    key={leaf.id}
                                    initial={{ scale: 0, opacity: 0, y: 100 }}
                                    animate={{ scale: leaf.scale, opacity: 1, y: 0 }}
                                    exit={{ scale: 0, opacity: 0, transition: { duration: 0.5 } }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="absolute z-10 flex items-center justify-center cursor-default group"
                                    style={{ top: leaf.top, left: leaf.left, cursor: 'help' }}
                                >
                                    <div
                                        className="relative w-24 h-24 md:w-28 md:h-28 rounded-full rounded-br-none flex items-center justify-center p-4 shadow-[0_8px_16px_rgba(0,0,0,0.15)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] border border-white/20"
                                        style={{
                                            backgroundColor: leaf.color,
                                            transform: 'rotate(-45deg)',
                                        }}
                                    >
                                        {/* Brilho/Highlight na folha */}
                                        <div className="absolute top-2 left-2 w-1/3 h-1/3 bg-gradient-to-br from-white/40 to-transparent rounded-full opacity-80" />

                                        <span className="text-white font-bold text-sm md:text-base text-center break-words leading-tight drop-shadow-md select-none" style={{ transform: 'rotate(45deg)' }}>
                                            {leaf.text}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* --- UI LAYER: CONTROLES & FEEDBACK --- */}
                    <div className="relative z-20 mt-auto w-full flex flex-col items-center pb-8 md:pb-12 px-6">

                        {!resultMessage ? (
                            <div className="w-full max-w-lg space-y-4">
                                {/* Contador / Pill */}
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
                                            className="p-3 bg-stone-800 text-white rounded-full hover:bg-stone-700 disabled:opacity-30 disabled:hover:bg-stone-800 transition-all shadow-md active:scale-95"
                                            aria-label="Adicionar Sentimento"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </form>

                                {/* Link para concluir antes (Feature Solicitada) */}
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
                            /* CARD MENSAGEM FINAL (Hero Style) */
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="w-full max-w-xl"
                            >
                                <div className="bg-white/90 backdrop-blur-2xl p-8 md:p-12 rounded-[2rem] shadow-2xl border border-white text-center relative overflow-hidden">
                                    {/* Decor */}
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-200 via-amber-200 to-blue-200" />

                                    <div className="inline-flex items-center justify-center p-3 mb-6 bg-rose-50 text-rose-500 rounded-2xl shadow-inner">
                                        <Heart fill="currentColor" size={28} />
                                    </div>

                                    <blockquote className="text-2xl md:text-3xl font-serif text-stone-800 mb-8 leading-tight">
                                        "{resultMessage}"
                                    </blockquote>

                                    <button
                                        onClick={resetTree}
                                        className="group inline-flex items-center gap-2 px-8 py-3 bg-stone-100 hover:bg-white text-stone-600 font-semibold rounded-full border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all duration-300"
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
        </section>
    );
}
