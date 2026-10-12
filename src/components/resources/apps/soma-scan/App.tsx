import React, { useState } from "react";
import Scanner from "./components/Scanner";
import Results from "./components/Results";
import { AppState, BodyData } from "./types";

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
    <div className="h-full min-h-0 w-full relative flex flex-col overflow-hidden bg-paper selection:bg-clay/30">
      {/* Organic Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#FDFAF4] rounded-full blur-[80px] opacity-60 pointer-events-none animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#F1E9DB] rounded-full blur-[100px] opacity-50 pointer-events-none" />
      <div
        className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#FDFAF4] rounded-full blur-[60px] opacity-70 pointer-events-none animate-float"
        style={{ animationDelay: "2s" }}
      />

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {appState === "intro" && (
          <div className="flex min-h-full flex-col items-center justify-center p-5 text-center animate-fade-in sm:p-8">
            <div className="max-w-xl space-y-5 sm:space-y-7">
              <span className="text-xs font-bold tracking-[0.3em] text-mata uppercase">
                Mapeamento Corporal Consciente
              </span>
              <h1 className="text-5xl font-serif leading-[0.92] tracking-tight text-mata sm:text-7xl">
                Escute o <br />{" "}
                <span className="text-clay italic">seu corpo.</span>
              </h1>
              <p className="mx-auto max-w-md text-base font-light leading-relaxed text-mata sm:text-xl">
                Amplie a consciência corporal sem tentar &quot;consertar&quot;
                nada. Apenas note tensão, calor e peso.
              </p>

              <div className="pt-5 sm:pt-8">
                <button
                  type="button"
                  onClick={handleStart}
                  className="resource-action group relative bg-primary px-5 text-xs tracking-widest text-[#FDFAF4] hover:-translate-y-0.5 hover:bg-primary sm:px-7"
                >
                  INICIAR SCAN
                </button>
                <p className="mt-6 text-[10px] text-mata uppercase tracking-widest">
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
