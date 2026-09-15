import React from "react";
import { TreeSettings, TreeTheme, TimeOfDay } from "../types";
import {
  Wind,
  Sparkles,
  Sun,
  Moon,
  Sunrise,
  Volume2,
  VolumeX,
  Palette,
  Play,
  RotateCcw,
} from "lucide-react";
import { natureAudio } from "../utils/audio";

interface TreeControlsProps {
  settings: TreeSettings;
  onUpdate: (updater: (prev: TreeSettings) => TreeSettings) => void;
  onTriggerShower: () => void;
}

export default function TreeControls({
  settings,
  onUpdate,
  onTriggerShower,
}: TreeControlsProps) {
  const toggleAudio = () => {
    onUpdate((prev) => {
      const nextAudio = !prev.audioEnabled;
      if (nextAudio) {
        natureAudio.start();
        natureAudio.playChime(1.1);
      } else {
        natureAudio.stop();
      }
      return { ...prev, audioEnabled: nextAudio };
    });
  };

  const themes: { id: TreeTheme; label: string; dotColor: string }[] = [
    { id: "figura-viva", label: "Figura Viva", dotColor: "#fe538b" },
    { id: "primavera", label: "Primavera", dotColor: "#ff9ec6" },
    { id: "outono", label: "Outono", dotColor: "#ea580c" },
    { id: "aurora", label: "Aurora", dotColor: "#06b6d4" },
  ];

  const times: { id: TimeOfDay; label: string; icon: React.ReactNode }[] = [
    { id: "tarde", label: "Tarde", icon: <Sun className="w-3.5 h-3.5" /> },
    {
      id: "crepusculo",
      label: "Noite",
      icon: <Moon className="w-3.5 h-3.5" />,
    },
    {
      id: "alvorada",
      label: "Alvorada",
      icon: <Sunrise className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="flex flex-col gap-3 w-full max-w-lg mx-auto">
      {/* Primary Floating Toolbar */}
      <div
        id="tree-controls-panel"
        className="backdrop-blur-md bg-white/75 dark:bg-[#201a2c]/75 border border-stone-200/80 dark:border-stone-700/60 shadow-lg shadow-stone-900/5 rounded-2xl p-3.5 transition-all"
      >
        {/* Top bar: Wind strength & Instant Gust button */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Wind className="w-4 h-4" />
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">
                <span>Intensidade do Vento</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {settings.windIntensity === 0
                    ? "Calmaria"
                    : settings.windIntensity <= 0.8
                      ? "Brisa Suave"
                      : settings.windIntensity <= 1.4
                        ? "Vento Médio"
                        : "Vento Vigoroso"}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.windIntensity}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdate((prev) => ({ ...prev, windIntensity: val }));
                }}
                className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                aria-label="Intensidade do vento"
              />
            </div>
          </div>

          {/* Quick Bloom / Petal Shower Button */}
          <button
            type="button"
            onClick={onTriggerShower}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 active:scale-95 dark:text-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-800/80 rounded-xl transition-all shadow-sm cursor-pointer"
            title="Lançar rajada de vento e pétalas"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Desprender Pétalas</span>
          </button>
        </div>

        {/* Bottom selectors: Theme Pills & Ambiance Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/60 dark:border-stone-800/60 text-xs">
          {/* Theme Palette Buttons */}
          <div className="flex items-center gap-1">
            <span className="text-stone-400 dark:text-stone-500 mr-1 flex items-center gap-1">
              <Palette className="w-3 h-3" />
            </span>
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onUpdate((prev) => ({ ...prev, theme: t.id }))}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  settings.theme === t.id
                    ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-semibold shadow-sm"
                    : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800/60"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: t.dotColor }}
                />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Time of Day & Audio Controls */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Time of Day */}
            <div className="flex bg-stone-100 dark:bg-stone-800/80 rounded-lg p-0.5">
              {times.map((tm) => (
                <button
                  key={tm.id}
                  type="button"
                  onClick={() =>
                    onUpdate((prev) => ({ ...prev, timeOfDay: tm.id }))
                  }
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    settings.timeOfDay === tm.id
                      ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-medium"
                      : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                  }`}
                  title={`Ambiente: ${tm.label}`}
                >
                  {tm.icon}
                </button>
              ))}
            </div>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleAudio}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                settings.audioEnabled
                  ? "bg-amber-100/80 border-amber-300/80 text-amber-800 dark:bg-amber-950/60 dark:border-amber-700/60 dark:text-amber-300"
                  : "bg-stone-100 dark:bg-stone-800/60 border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              }`}
              title={
                settings.audioEnabled
                  ? "Silenciar ambiente"
                  : "Ouvir brisa e carrilhões da natureza"
              }
            >
              {settings.audioEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Helpful subtle interaction hint */}
      <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 dark:text-stone-400 text-center select-none">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Passe o cursor ou deslize para ondular os galhos
        </span>
        <span>•</span>
        <span>Clique na copa para dispersar pétalas</span>
      </div>
    </div>
  );
}
