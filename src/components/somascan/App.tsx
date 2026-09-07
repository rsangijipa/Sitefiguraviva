import React, { useState } from "react";
import Scanner from "./components/Scanner";
import Results from "./components/Results";
import { AppState, BodyData } from "./types";
import { Fingerprint } from "lucide-react";

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>("intro");
  const [scanData, setScanData] = useState<BodyData>({});

  const handleStart = () => {
    setAppState("scanning");
  };

  const handleScanComplete = (data: BodyData) => {
    setScanData(data);
    setAppState("results");
  };

  const handleRestart = () => {
    setScanData({});
    setAppState("intro");
  };

  return (
    <div className="relative flex min-h-[min(68vh,620px)] w-full flex-col overflow-hidden bg-paper selection:bg-clay/30 sm:min-h-[min(60vh,560px)]">
      {/* Organic Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#f5f5f4] rounded-full blur-[80px] opacity-60 pointer-events-none animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#e7e5e4] rounded-full blur-[100px] opacity-50 pointer-events-none" />
      <div
        className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#fff7ed] rounded-full blur-[60px] opacity-70 pointer-events-none animate-float"
        style={{ animationDelay: "2s" }}
      />

      {/* Header */}
      <header className="absolute top-0 z-10 flex w-full items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-2 text-stone-600">
          <Fingerprint className="w-5 h-5 text-clay" />
          <span className="font-serif italic text-xl tracking-wide">
            SomaScan
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {appState === "intro" && (
          <div className="flex min-h-full flex-col items-center justify-center p-5 text-center animate-fade-in sm:p-8">
            <div className="max-w-xl space-y-5 sm:space-y-7">
              <span className="text-xs font-bold tracking-[0.3em] text-stone-400 uppercase">
                Mapeamento Corporal Consciente
              </span>
              <h1 className="text-5xl font-serif leading-[0.92] tracking-tight text-stone-800 sm:text-7xl">
                Escute o <br />{" "}
                <span className="text-clay italic">seu corpo.</span>
              </h1>
              <p className="mx-auto max-w-md text-base font-light leading-relaxed text-stone-500 sm:text-xl">
                Amplie a consciência corporal sem tentar &quot;consertar&quot;
                nada. Apenas note tensão, calor e peso.
              </p>

              <div className="pt-5 sm:pt-8">
                <button
                  onClick={handleStart}
                  className="resource-action group relative bg-stone-800 px-5 text-xs tracking-widest text-[#fdfbf7] hover:-translate-y-0.5 hover:bg-stone-700 sm:px-7"
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

        {appState === "scanning" && <Scanner onComplete={handleScanComplete} />}

        {appState === "results" && (
          <Results data={scanData} onRestart={handleRestart} />
        )}
      </main>
    </div>
  );
};

export default App;
