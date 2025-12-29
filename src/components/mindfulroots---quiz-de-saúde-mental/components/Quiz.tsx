import React, { useState } from 'react';
import { QUESTIONS, ANSWER_OPTIONS, BONUS_QUESTION } from '../constants';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface QuizProps {
  onComplete: (answers: number[], bonusAnswer: boolean) => void;
  onCancel: () => void;
}

const Quiz: React.FC<QuizProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [bonusAnswer, setBonusAnswer] = useState<boolean | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Use >= to handle cases where index might skip ahead (though prevents by isTransitioning)
  const isBonusStep = currentStep >= QUESTIONS.length;
  const progress = Math.min(((currentStep) / (QUESTIONS.length + 1)) * 100, 100);

  const handleAnswer = (value: number) => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    
    // Smooth transition
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
      setIsTransitioning(false);
    }, 250);
  };

  const handleBonusAnswer = (value: boolean) => {
    setBonusAnswer(value);
    onComplete(answers, value);
  };

  const currentQuestion = QUESTIONS[currentStep];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 fade-in">
      {/* Progress Bar */}
      <div className="mb-8 w-full h-3 bg-boho-sand/30 rounded-full overflow-hidden">
        <div 
          className="h-full bg-boho-terracotta transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-sm border border-white p-6 md:p-10 min-h-[400px] flex flex-col justify-center relative">
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 text-boho-text/40 hover:text-boho-terracotta transition-colors text-sm font-sans"
        >
          Cancelar
        </button>

        {!isBonusStep && currentQuestion ? (
          <>
            <span className="text-boho-terracotta font-serif text-sm tracking-widest uppercase mb-4 block">
              Questão {currentStep + 1} de {QUESTIONS.length}
            </span>
            
            <h2 className="text-2xl md:text-3xl font-serif text-boho-dark mb-8 leading-relaxed">
              {currentQuestion.text}
            </h2>

            <div className="grid gap-3">
              {ANSWER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  disabled={isTransitioning}
                  className={`group relative w-full text-left p-4 rounded-xl border border-boho-sand bg-white/50 hover:bg-white hover:border-boho-terracotta/50 hover:shadow-md transition-all duration-300 flex items-center gap-4 ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 border-boho-sand group-hover:border-boho-terracotta flex items-center justify-center transition-colors`}>
                    <div className="w-2.5 h-2.5 rounded-full bg-boho-terracotta opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="font-sans text-boho-text group-hover:text-boho-dark text-lg">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center fade-in">
            <div className="w-16 h-16 bg-boho-clay/10 text-boho-clay rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-serif text-boho-dark mb-4 leading-relaxed">
              Pergunta Importante
            </h2>
            <p className="text-boho-text mb-8 text-lg leading-relaxed">
              {BONUS_QUESTION}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={() => handleBonusAnswer(false)}
                className="flex-1 py-4 px-6 rounded-2xl border-2 border-boho-sage/50 text-boho-olive font-sans font-medium hover:bg-boho-sage hover:text-white transition-all duration-300"
              >
                Não
              </button>
              <button
                onClick={() => handleBonusAnswer(true)}
                className="flex-1 py-4 px-6 rounded-2xl border-2 border-boho-clay/30 text-boho-clay font-sans font-medium hover:bg-boho-clay hover:text-white transition-all duration-300"
              >
                Sim
              </button>
            </div>
            <p className="mt-6 text-sm text-boho-text/60 italic">
              Esta resposta é confidencial e ajuda a direcionar o suporte adequado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;