import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const QUESTIONS = [
    { id: 1, text: "Senti pouca energia ou cansaço que não passa.", isInverse: false },
    { id: 2, text: "Tive dificuldade para dormir (pegar no sono, manter, ou acordei cedo demais).", isInverse: false },
    { id: 3, text: "Me senti ansioso(a), tenso(a) ou “no modo alerta”.", isInverse: false },
    { id: 4, text: "Tive pensamentos acelerados ou dificuldade de desligar a mente.", isInverse: false },
    { id: 5, text: "Me senti triste, desanimado(a) ou sem esperança.", isInverse: false },
    { id: 6, text: "Perdi interesse/prazer em coisas que normalmente gosto.", isInverse: false },
    { id: 7, text: "Me senti irritado(a) com facilidade (pavio curto).", isInverse: false },
    { id: 8, text: "Tive dificuldade de concentração (ler, trabalhar, conversar).", isInverse: false },
    { id: 9, text: "Evitei pessoas/atividades por falta de vontade ou medo/desconforto.", isInverse: false },
    { id: 10, text: "Senti culpa excessiva ou me cobrei além do limite.", isInverse: false },
    { id: 11, text: "Me senti sobrecarregado(a), como se “não desse conta”.", isInverse: false },
    { id: 12, text: "Usei comida, álcool, telas ou compras como fuga com frequência.", isInverse: false },
    { id: 13, text: "Senti sintomas físicos por estresse (tensão, dor de cabeça, nó no peito/estômago).", isInverse: false },
    { id: 14, text: "Notei que pequenas coisas viraram grandes problemas na minha cabeça.", isInverse: false },
    { id: 15, text: "Consegui fazer pausas e me recuperar quando algo me estressou.", isInverse: true },
    { id: 16, text: "Senti que tenho alguém (ou algum lugar) onde posso buscar apoio.", isInverse: true },
];

const ANSWER_OPTIONS = [
    { value: 0, label: "Nunca" },
    { value: 1, label: "Alguns dias" },
    { value: 2, label: "Mais da metade dos dias" },
    { value: 3, label: "Quase todos os dias" },
];

const BONUS_QUESTION = "Nas últimas 2 semanas, pensei que seria melhor não existir, me machucar, ou tive ideia de suicídio?";

const COLOR_MAP = {
    green: 'text-green-700 border-green-600 bg-green-50',
    yellow: 'text-yellow-700 border-yellow-600 bg-yellow-50',
    orange: 'text-orange-700 border-orange-600 bg-orange-50',
    red: 'text-red-700 border-red-600 bg-red-50',
};

const getResultData = (score) => {
    if (score <= 12) {
        return {
            zone: 'green',
            score,
            title: 'Zona Verde',
            description: 'Sinais leves ou esperados do dia a dia. Você parece estar lidando bem com os desafios atuais.',
            actionPlan: 'Manter hábitos base: sono regular, boa alimentação, movimento, contato social e pausas.'
        };
    } else if (score <= 24) {
        return {
            zone: 'yellow',
            score,
            title: 'Zona Amarela',
            description: 'Atenção. O estresse, ansiedade ou humor podem estar começando a impactar sua rotina.',
            actionPlan: 'Escolha 2 alavancas: Priorize o sono + estabeleça limites (tempo de tela/agenda) pelos próximos 7 dias.'
        };
    } else if (score <= 36) {
        return {
            zone: 'orange',
            score,
            title: 'Zona Laranja',
            description: 'Impacto moderado a alto. Seus sintomas estão consumindo energia significativa.',
            actionPlan: 'Adicionar apoio (terapia ou escuta ativa) + reduzir a carga imediatamente (delegar tarefas ou cortar excessos).'
        };
    } else {
        return {
            zone: 'red',
            score,
            title: 'Zona Vermelha',
            description: 'Impacto alto na qualidade de vida. É importante não enfrentar isso sozinho(a).',
            actionPlan: 'Apoio profissional + rede de segurança (não ficar sozinho(a) em momentos de crise, ativar plano de emergência).'
        };
    }
};

const Quiz = ({ onComplete, onCancel }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const isBonusStep = currentStep >= QUESTIONS.length;
    const progress = Math.min(((currentStep) / (QUESTIONS.length + 1)) * 100, 100);

    const handleAnswer = (value) => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        const newAnswers = [...answers, value];
        setAnswers(newAnswers);

        setTimeout(() => {
            setCurrentStep((prev) => prev + 1);
            setIsTransitioning(false);
        }, 250);
    };

    const handleBonusAnswer = (value) => {
        onComplete(answers, value);
    };

    const currentQuestion = QUESTIONS[currentStep];

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-8 animate-fade-in relative z-10">

            {/* Progress Bar */}
            <div className="mb-8 w-full h-3 bg-gray-200/50 rounded-full overflow-hidden">
                <div
                    className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-white/50 p-6 md:p-10 min-h-[400px] flex flex-col justify-center relative">
                <button
                    onClick={onCancel}
                    className="absolute top-6 right-6 text-gray-400 hover:text-accent transition-colors text-sm font-sans"
                >
                    Cancelar
                </button>

                {!isBonusStep && currentQuestion ? (
                    <>
                        <span className="text-accent font-serif text-sm tracking-widest uppercase mb-4 block">
                            Questão {currentStep + 1} de {QUESTIONS.length}
                        </span>

                        <h2 className="text-2xl md:text-3xl font-serif text-primary mb-8 leading-relaxed">
                            {currentQuestion.text}
                        </h2>

                        <div className="grid gap-3">
                            {ANSWER_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleAnswer(option.value)}
                                    disabled={isTransitioning}
                                    className={`group relative w-full text-left p-4 rounded-xl border border-gray-100 bg-white/50 hover:bg-white hover:border-accent/50 hover:shadow-md transition-all duration-300 flex items-center gap-4 ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-accent flex items-center justify-center transition-colors`}>
                                        <div className="w-2.5 h-2.5 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="font-sans text-gray-600 group-hover:text-primary text-lg">
                                        {option.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <AlertCircle size={32} />
                        </div>

                        <h2 className="text-2xl md:text-3xl font-serif text-primary mb-4 leading-relaxed">
                            Pergunta Importante
                        </h2>
                        <p className="text-primary/70 mb-8 text-lg leading-relaxed px-4">
                            {BONUS_QUESTION}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto w-full">
                            <button
                                onClick={() => handleBonusAnswer(false)}
                                className="flex-1 py-4 px-6 rounded-2xl border-2 border-sage/50 text-sage font-sans font-bold hover:bg-sage hover:text-white transition-all duration-300"
                            >
                                Não
                            </button>
                            <button
                                onClick={() => handleBonusAnswer(true)}
                                className="flex-1 py-4 px-6 rounded-2xl border-2 border-red-200 text-red-400 font-sans font-bold hover:bg-red-400 hover:text-white transition-all duration-300"
                            >
                                Sim
                            </button>
                        </div>
                        <p className="mt-6 text-sm text-gray-400 italic">
                            Esta resposta é confidencial e ajuda a direcionar o suporte adequado.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const Result = ({ data, bonusAlert, onRetake }) => {
    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-8 animate-fade-in pb-20 relative z-10 overflow-y-auto max-h-[90vh]">

            {/* Header */}
            <div className="text-center mb-10">
                <span className="text-accent text-sm font-serif tracking-widest uppercase mb-2 block">
                    Seu Resultado
                </span>
                <h2 className={`text-4xl md:text-5xl font-serif mb-4 capitalize text-primary`}>
                    {data.title}
                </h2>
                <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-gray-100 text-gray-600 font-sans text-sm font-bold">
                    Score Geral: {data.score}
                </div>
            </div>

            {/* Bonus Alert Box - High Priority */}
            {bonusAlert && (
                <div className="mb-8 bg-red-50 border border-red-200 p-6 md:p-8 rounded-3xl flex flex-col items-center text-center animate-pulse">
                    <h3 className="text-red-800 font-serif text-xl font-bold mb-2">Atenção Prioritária</h3>
                    <p className="text-red-700 mb-6 leading-relaxed">
                        Você indicou pensamentos de risco. Isso é uma emergência médica/emocional e deve ser tratada agora.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <a href="tel:188" className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">
                            Ligar CVV 188
                        </a>
                    </div>
                </div>
            )}

            {/* Main Result Card */}
            <div className={`relative overflow-hidden rounded-3xl p-8 md:p-12 mb-8 border ${COLOR_MAP[data.zone]}`}>
                <div className="relative z-10">
                    <h3 className="text-2xl font-serif mb-4 flex items-center gap-3">
                        Análise
                    </h3>
                    <p className="text-lg leading-relaxed mb-8 opacity-90 font-sans">
                        {data.description}
                    </p>

                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-current/10">
                        <h4 className="font-serif text-lg mb-3 flex items-center gap-2 font-bold">
                            Sugestão de Cuidado
                        </h4>
                        <p className="font-sans leading-relaxed">
                            {data.actionPlan}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer / Retake */}
            <div className="flex flex-col items-center gap-6">
                <p className="text-center text-gray-400 text-sm max-w-md">
                    *Este questionário é uma ferramenta de triagem e autoconhecimento, não substitui um diagnóstico profissional.
                </p>

                <button
                    onClick={onRetake}
                    className="flex items-center gap-2 text-accent hover:text-primary transition-colors font-bold font-sans px-6 py-3 rounded-full hover:bg-white/50"
                >
                    Refazer o teste
                </button>
            </div>
        </div>
    );
};

export default function MentalHealthQuiz({ onClose }) {
    const [view, setView] = useState('intro'); // 'intro' | 'quiz' | 'result'
    const [answers, setAnswers] = useState([]);
    const [bonusAnswer, setBonusAnswer] = useState(false);

    const startQuiz = () => setView('quiz');

    const handleQuizComplete = (userAnswers, userBonus) => {
        setAnswers(userAnswers);
        setBonusAnswer(userBonus);
        setView('result');
    };

    const resetQuiz = () => {
        setAnswers([]);
        setBonusAnswer(false);
        setView('intro');
    };

    const calculateScore = () => {
        let totalScore = 0;
        answers.forEach((val, index) => {
            const question = QUESTIONS[index];
            if (question.isInverse) {
                totalScore += (3 - val);
            } else {
                totalScore += val;
            }
        });
        return totalScore;
    };

    return (
        <div className="w-full h-full overflow-y-auto bg-stone-50 flex flex-col relative">
            {/* Global Close Button (Top Right) */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-50 p-3 bg-white/80 backdrop-blur rounded-full shadow-lg text-primary hover:bg-white transition-all hover:rotate-90"
            >
                <AlertCircle size={0} className="hidden" /> {/* Dummy to keep import */}
                {/* We use Close icon from context usually, or passed in X icon */}
                <span className="font-sans font-bold text-xl leading-none block h-5 w-3">✕</span>
            </button>

            <div className="flex-1 flex flex-col items-center justify-center min-h-screen py-20">

                <div className="mb-8 flex items-center gap-2 text-primary opacity-50 uppercase tracking-[0.3em] text-xs font-bold">
                    <span>Mindful Roots</span>
                    <div className="w-4 h-[1px] bg-primary"></div>
                    <span>Auto-Avaliação</span>
                </div>

                {view === 'intro' && (
                    <div className="flex flex-col items-center justify-center px-6 text-center animate-fade-in max-w-2xl mx-auto">
                        <div className="w-24 h-24 mb-6 rounded-full bg-accent/10 flex items-center justify-center text-accent animate-pulse">
                            <ArrowRight size={32} />
                        </div>

                        <h2 className="text-4xl md:text-6xl font-serif text-primary mb-6 leading-tight">
                            Como está a sua <br />
                            <span className="italic text-accent">saúde mental?</span>
                        </h2>

                        <p className="text-lg text-gray-500 max-w-xl mb-12 leading-relaxed">
                            Um check-in rápido e gentil consigo mesmo. Avalie seus últimos 14 dias para entender em qual zona emocional você está.
                        </p>

                        <button
                            onClick={startQuiz}
                            className="group bg-primary text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-sm shadow-xl hover:shadow-2xl hover:bg-gray-800 transition-all duration-300 flex items-center gap-3"
                        >
                            Iniciar Auto-Avaliação
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <p className="mt-8 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                            Duração estimada: 2 minutos
                        </p>
                    </div>
                )}

                {view === 'quiz' && (
                    <Quiz
                        onComplete={handleQuizComplete}
                        onCancel={resetQuiz}
                    />
                )}

                {view === 'result' && (
                    <Result
                        data={getResultData(calculateScore())}
                        bonusAlert={bonusAnswer}
                        onRetake={resetQuiz}
                    />
                )}
            </div>
        </div>
    );
}
