import React, { useState } from 'react';
import Quiz from './components/Quiz';
import Result from './components/Result';
import { QUESTIONS, getResultData } from './constants';
import { Sparkles, ArrowRight } from 'lucide-react';

type AppState = 'intro' | 'quiz' | 'result';

export default function App() {
  const [view, setView] = useState<AppState>('intro');
  const [answers, setAnswers] = useState<number[]>([]);
  const [bonusAnswer, setBonusAnswer] = useState<boolean>(false);

  const startQuiz = () => {
    setView('quiz');
    window.scrollTo(0,0);
  };

  const handleQuizComplete = (userAnswers: number[], userBonus: boolean) => {
    setAnswers(userAnswers);
    setBonusAnswer(userBonus);
    setView('result');
    window.scrollTo(0,0);
  };

  const resetQuiz = () => {
    setAnswers([]);
    setBonusAnswer(false);
    setView('intro');
    window.scrollTo(0,0);
  };

  const calculateScore = () => {
    let totalScore = 0;
    
    answers.forEach((val, index) => {
      const question = QUESTIONS[index];
      if (question.isInverse) {
        // Inverse scoring: 0->3, 1->2, 2->1, 3->0
        totalScore += (3 - val);
      } else {
        totalScore += val;
      }
    });

    return totalScore;
  };

  return (
    <div className="min-h-screen bg-boho-bg font-sans selection:bg-boho-terracotta/20 selection:text-boho-dark">
      {/* Navbar / Logo Area */}
      <nav className="p-6 md:p-8 flex justify-center">
        <div className="flex items-center gap-2 text-boho-dark">
          <Sparkles className="text-boho-terracotta animate-soft-pulse" size={24} />
          <h1 className="font-serif text-xl font-bold tracking-tight">MindfulRoots</h1>
        </div>
      </nav>

      <main className="container mx-auto max-w-4xl">
        {view === 'intro' && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center fade-in">
            <div className="mb-6 relative">
              <div className="w-32 h-32 rounded-full bg-boho-sage/20 flex items-center justify-center relative z-10">
                <div className="w-24 h-24 rounded-full bg-boho-sage/40"></div>
              </div>
              <div className="absolute top-0 right-0 w-8 h-8 bg-boho-terracotta rounded-full blur-sm opacity-60 animate-pulse"></div>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-boho-dark mb-6 leading-tight">
              Como está a sua <br/>
              <span className="italic text-boho-terracotta">saúde mental?</span>
            </h2>
            
            <p className="text-lg md:text-xl text-boho-text max-w-xl mb-12 leading-relaxed">
              Um check-in rápido e gentil consigo mesmo. Avalie seus últimos 14 dias para entender em qual zona emocional você está.
            </p>

            <button 
              onClick={startQuiz}
              className="group bg-boho-dark text-white px-8 py-4 rounded-full font-medium text-lg shadow-lg hover:shadow-xl hover:bg-stone-800 transition-all duration-300 flex items-center gap-3"
            >
              Começar Quiz
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="mt-8 text-sm text-boho-text/50 uppercase tracking-widest font-serif">
              Duração: 2 minutos
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
      </main>
    </div>
  );
}