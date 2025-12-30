import React, { useState } from 'react';
import Scanner from './components/Scanner';
import Results from './components/Results';
import { AppState, BodyData } from './types';
import { Fingerprint } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('intro');
  const [scanData, setScanData] = useState<BodyData>({});

  const handleStart = () => {
    setAppState('scanning');
  };

  const handleScanComplete = (data: BodyData) => {
    setScanData(data);
    setAppState('results');
  };

  const handleRestart = () => {
    setScanData({});
    setAppState('intro');
  };

  return (
    <div className="h-screen w-full bg-paper flex flex-col overflow-hidden relative selection:bg-clay/30">
      {/* Organic Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#f5f5f4] rounded-full blur-[80px] opacity-60 pointer-events-none animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#e7e5e4] rounded-full blur-[100px] opacity-50 pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#fff7ed] rounded-full blur-[60px] opacity-70 pointer-events-none animate-float" style={{animationDelay: '2s'}} />

      {/* Header */}
      <header className="absolute top-0 w-full p-8 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-stone-600">
          <Fingerprint className="w-5 h-5 text-clay" />
          <span className="font-serif italic text-xl tracking-wide">SomaScan</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {appState === 'intro' && (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="max-w-xl space-y-8">
              <span className="text-xs font-bold tracking-[0.3em] text-stone-400 uppercase">Mapeamento Corporal Consciente</span>
              <h1 className="text-6xl md:text-8xl font-serif text-stone-800 tracking-tight leading-[0.9]">
                Escute o <br /> <span className="text-clay italic">seu corpo.</span>
              </h1>
              <p className="text-xl text-stone-500 font-light leading-relaxed max-w-md mx-auto">
                Amplie a consciência corporal sem tentar "consertar" nada. 
                Apenas note tensão, calor e peso.
              </p>
              
              <div className="pt-12">
                <button 
                  onClick={handleStart}
                  className="group relative px-10 py-4 bg-stone-800 hover:bg-stone-700 text-[#fdfbf7] rounded-full font-medium tracking-widest text-xs transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  INICIAR SCAN
                </button>
                <p className="mt-6 text-[10px] text-stone-400 uppercase tracking-widest">
                  Áudio Guiado &bull; 100% Offline
                </p>
              </div>
            </div>
          </div>
        )}

        {appState === 'scanning' && (
          <Scanner onComplete={handleScanComplete} />
        )}

        {appState === 'results' && (
          <Results data={scanData} onRestart={handleRestart} />
        )}
      </main>
    </div>
  );
};

export default App;