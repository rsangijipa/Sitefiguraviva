import React from 'react';
import { HeartHandshake } from 'lucide-react';
import { Button } from './Button';

interface WelcomeProps {
  onStart: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[85vh] text-center max-w-4xl mx-auto px-6 fade-in overflow-hidden md:overflow-visible">
      
      {/* Abstract Background Shapes */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-moss-200/50 mix-blend-multiply filter blur-xl opacity-70 blob-shape -z-10 animate-[pulse_6s_ease-in-out_infinite]" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-terra-200/50 mix-blend-multiply filter blur-xl opacity-70 blob-shape-2 -z-10 animate-[pulse_8s_ease-in-out_infinite_reverse]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-stone-200/50 mix-blend-multiply filter blur-2xl opacity-50 rounded-full -z-20" />

      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-stone-300 rounded-full blur opacity-20 transform translate-y-2"></div>
        <div className="bg-paper border border-stone-200 p-8 rounded-full shadow-sm relative z-10">
          <HeartHandshake size={48} className="text-terra-500" strokeWidth={1.5} />
        </div>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-serif text-ink mb-6 leading-[1.1] tracking-tight">
        Inventário de <br/> <span className="text-terra-500 italic">Suportes</span>
      </h1>
      
      <div className="w-24 h-1 bg-moss-400 mx-auto mb-8 rounded-full opacity-50"></div>

      <p className="text-lg md:text-xl text-moss-800 mb-10 leading-relaxed max-w-lg font-light">
        Lembrar que você não é um projeto sem recursos. 
        Mapeie suas raízes — pessoas, rotinas, lugares e crenças — e crie seu kit de sobrevivência emocional.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-12">
        {[
          { step: "01", text: "Liste seus recursos" },
          { step: "02", text: "Crie micro-atalhos" },
          { step: "03", text: "Receba seu kit" }
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center p-4">
             <span className="font-serif italic text-2xl text-terra-300 mb-2">{item.step}</span>
             <span className="text-sm font-medium tracking-wide text-moss-800 uppercase">{item.text}</span>
          </div>
        ))}
      </div>

      <Button onClick={onStart} size="lg" className="text-lg px-12 py-4 shadow-xl shadow-terra-200 hover:shadow-terra-300">
        Iniciar Jornada
      </Button>
    </div>
  );
};