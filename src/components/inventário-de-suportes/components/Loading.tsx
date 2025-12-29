import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 fade-in">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 bg-terra-200 rounded-full mix-blend-multiply filter blur-md animate-[ping_3s_ease-in-out_infinite]"></div>
        <div className="absolute inset-0 bg-moss-200 rounded-full mix-blend-multiply filter blur-md animate-[ping_3s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute inset-4 bg-white/50 rounded-full backdrop-blur-sm flex items-center justify-center">
            <div className="w-2 h-2 bg-ink rounded-full animate-bounce"></div>
        </div>
      </div>
      <h3 className="text-3xl font-serif text-ink mb-3 italic">Tecendo seu kit...</h3>
      <p className="text-moss-600 font-light">Respire fundo enquanto organizamos seus recursos.</p>
    </div>
  );
};