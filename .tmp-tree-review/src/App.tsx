import React, { useState, useRef, useCallback } from "react";
import BackgroundEngine from "./components/BackgroundEngine";
import EnhancedLivingTree from "./components/EnhancedLivingTree";
import FloatingCanvas from "./components/FloatingCanvas";
import TreeControls from "./components/TreeControls";
import { TreeSettings } from "./types";
import { Info, Sparkles, X, Wind, Layers, Activity } from "lucide-react";

export default function App() {
  const [settings, setSettings] = useState<TreeSettings>({
    windIntensity: 0.9,
    windDirection: 0.6,
    theme: "figura-viva",
    timeOfDay: "tarde",
    particlesEnabled: true,
    interactiveWind: true,
    audioEnabled: false,
    leafFlutter: true,
  });

  const [showInfo, setShowInfo] = useState(false);
  const burstTriggerRef = useRef<((x: number, y: number) => void) | null>(null);

  const handleCanvasReady = useCallback(
    (trigger: (x: number, y: number) => void) => {
      burstTriggerRef.current = trigger;
    },
    [],
  );

  const handleCanopyClick = useCallback((x: number, y: number) => {
    if (burstTriggerRef.current) {
      burstTriggerRef.current(x, y);
    }
  }, []);

  const handleManualShower = useCallback(() => {
    if (burstTriggerRef.current) {
      // Trigger burst from top center canopy
      const windowWidth =
        typeof window !== "undefined" ? window.innerWidth : 800;
      const windowHeight =
        typeof window !== "undefined" ? window.innerHeight : 900;
      burstTriggerRef.current(windowWidth / 2, windowHeight * 0.35);
    }
  }, []);

  const isDark = settings.timeOfDay === "crepusculo";

  return (
    <div
      className={`relative w-full h-screen overflow-hidden flex flex-col justify-between ${isDark ? "dark text-stone-100" : "text-stone-800"}`}
    >
      {/* Dynamic Atmospheric Background Engine */}
      <BackgroundEngine timeOfDay={settings.timeOfDay} />

      {/* Fluid Drifting Petals & Ambient Spores Canvas */}
      <FloatingCanvas
        theme={settings.theme}
        timeOfDay={settings.timeOfDay}
        windSpeed={settings.windIntensity}
        windDirection={settings.windDirection}
        enabled={settings.particlesEnabled}
        onCanvasReady={handleCanvasReady}
      />

      {/* Top Header Bar */}
      <header className="relative z-20 w-full max-w-5xl mx-auto px-6 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#fe538b] via-[#fed701] to-[#01c94d] p-[1.5px] shadow-sm">
            <div className="w-full h-full rounded-full bg-[#fcfaf7] dark:bg-[#1f192b] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 font-['Playfair_Display']">
              Figura Viva
            </h1>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium tracking-wide uppercase">
              Árvore Orgânica & Dinâmica
            </p>
          </div>
        </div>

        {/* Info & Details Button */}
        <button
          type="button"
          onClick={() => setShowInfo(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-stone-300/80 dark:border-stone-700/80 bg-white/70 dark:bg-stone-800/70 hover:bg-white dark:hover:bg-stone-800 transition-all shadow-xs cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
          <span className="hidden sm:inline">Detalhes da Obra</span>
        </button>
      </header>

      {/* Central Interactive Tree Hero Stage */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 w-full max-w-4xl mx-auto overflow-visible">
        <div className="w-full max-w-[340px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[540px] transition-all">
          <EnhancedLivingTree
            theme={settings.theme}
            timeOfDay={settings.timeOfDay}
            windIntensity={settings.windIntensity}
            windDirection={settings.windDirection}
            leafFlutter={settings.leafFlutter}
            interactive={settings.interactiveWind}
            onCanopyClick={handleCanopyClick}
          />
        </div>
      </main>

      {/* Bottom Floating Controls Bar */}
      <footer className="relative z-20 w-full px-4 pb-6 pt-2">
        <TreeControls
          settings={settings}
          onUpdate={setSettings}
          onTriggerShower={handleManualShower}
        />
      </footer>

      {/* Modal / Dialog: Detalhes da Obra e Aprimoramentos */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#201a2c] border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl p-6 text-stone-800 dark:text-stone-100">
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-stone-900 dark:text-white font-['Playfair_Display'] mb-1">
              Aprimoramentos da Árvore
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-5">
              Análise e síntese de movimento botânico e fluidez orgânica.
            </p>

            <div className="space-y-3.5 text-xs text-stone-600 dark:text-stone-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                <Wind className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                    Física Harmônica de Vento
                  </h3>
                  <p className="text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                    O tronco possui ressonância profunda, enquanto galhos e
                    ramos superiores flexionam com atraso de fase aerodinâmico e
                    retorno elástico amortecido.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                <Activity className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                    Flutuação Tridimensional das Pétalas
                  </h3>
                  <p className="text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                    As 186 folhas agora tremulam autonomamente em perspectiva
                    (escala X e rotação angular) respondendo a rajadas e toques
                    interativos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                <Layers className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                    Desprendimento e Esporos Vivos
                  </h3>
                  <p className="text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                    Canvas ultra-leve a 60 FPS com pétalas flutuantes que bailam
                    com sustentação aerodinâmica, desviam do cursor e voam pela
                    tela.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200/60 dark:border-stone-800/60 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 rounded-xl transition-all cursor-pointer"
              >
                Continuar Apreciando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
