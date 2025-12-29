import React from 'react';
import { COLOR_MAP } from '../constants';
import { ResultData } from '../types';
import { RefreshCw, Phone, HeartHandshake, Leaf, ShieldAlert } from 'lucide-react';

interface ResultProps {
  data: ResultData;
  bonusAlert: boolean;
  onRetake: () => void;
}

const Result: React.FC<ResultProps> = ({ data, bonusAlert, onRetake }) => {
  const isUrgent = bonusAlert || data.zone === 'red';

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 fade-in pb-20">
      
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-boho-terracotta text-sm font-serif tracking-widest uppercase mb-2 block">
          Seu Resultado
        </span>
        <h2 className={`text-4xl md:text-5xl font-serif mb-4 capitalize text-boho-dark`}>
          {data.title}
        </h2>
        <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-stone-200/50 text-boho-text font-sans text-sm">
          Pontuação: {data.score} / 48
        </div>
      </div>

      {/* Bonus Alert Box - High Priority */}
      {bonusAlert && (
        <div className="mb-8 bg-red-50 border border-red-200 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row gap-6 items-start md:items-center animate-pulse">
          <div className="bg-white p-3 rounded-full text-red-500 shadow-sm shrink-0">
             <ShieldAlert size={32} />
          </div>
          <div>
            <h3 className="text-red-800 font-serif text-xl font-bold mb-2">Atenção Prioritária</h3>
            <p className="text-red-700 mb-4 leading-relaxed">
              Você indicou pensamentos de risco. Isso é uma emergência médica/emocional e deve ser tratada agora.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="tel:188" className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors">
                <Phone size={18} /> Ligar CVV 188
              </a>
              <a href="tel:192" className="inline-flex items-center gap-2 bg-white text-red-600 border border-red-200 px-5 py-2.5 rounded-xl font-medium hover:bg-red-50 transition-colors">
                Emergência 192
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Result Card */}
      <div className={`relative overflow-hidden rounded-3xl p-8 md:p-12 mb-8 border ${COLOR_MAP[data.zone]}`}>
        <div className="relative z-10">
          <h3 className="text-2xl font-serif mb-4 flex items-center gap-3">
            <Leaf size={24} className="opacity-70"/>
            Análise
          </h3>
          <p className="text-lg leading-relaxed mb-8 opacity-90 font-sans">
            {data.description}
          </p>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-current/10">
            <h4 className="font-serif text-lg mb-3 flex items-center gap-2">
              <HeartHandshake size={20} className="opacity-70"/>
              Mini-plano de ação
            </h4>
            <p className="font-sans leading-relaxed">
              {data.actionPlan}
            </p>
          </div>
        </div>
        
        {/* Decorative Background blob */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-current opacity-5 blur-3xl pointer-events-none"></div>
      </div>

      {/* Footer / Retake */}
      <div className="flex flex-col items-center gap-6">
        <p className="text-center text-boho-text/60 text-sm max-w-md">
          *Este questionário é uma ferramenta de triagem e autoconhecimento, não substitui um diagnóstico profissional.
        </p>
        
        <button 
          onClick={onRetake}
          className="flex items-center gap-2 text-boho-terracotta hover:text-boho-dark transition-colors font-medium font-sans px-6 py-3 rounded-full hover:bg-white/50"
        >
          <RefreshCw size={18} />
          Refazer o teste
        </button>
      </div>
    </div>
  );
};

export default Result;