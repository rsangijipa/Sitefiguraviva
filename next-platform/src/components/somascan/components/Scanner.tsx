import React, { useState, useEffect } from 'react';
import { Play, Pause, X, Check, Thermometer, Activity, Anchor, Zap, Minus, Save } from 'lucide-react';
import BodyMap from './BodyMap';
import { BodyData, BodyPartId, SensationType, BodyLog } from '../types';
import { playScanIntro, pauseScanIntro, stopScanIntro } from '../services/geminiService';

interface ScannerProps {
  onComplete: (data: BodyData) => void;
}

const bodyPartTranslations: Record<string, string> = {
  head: 'Cabeça',
  neck: 'Pescoço',
  chest: 'Peito',
  stomach: 'Abdômen',
  leftArm: 'Braço Esquerdo',
  rightArm: 'Braço Direito',
  leftLeg: 'Perna Esquerda',
  rightLeg: 'Perna Direita',
  feet: 'Pés'
};

const Scanner: React.FC<ScannerProps> = ({ onComplete }) => {
  const [data, setData] = useState<BodyData>({});
  const [selectedPart, setSelectedPart] = useState<BodyPartId | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Temporary state for the modal interaction
  const [tempSensation, setTempSensation] = useState<SensationType | null>(null);
  const [tempIntensity, setTempIntensity] = useState<number>(3);

  useEffect(() => {
    // Start playing automatically when component mounts
    playScanIntro(
      () => setIsPlaying(false), // onEnd
      () => setIsPlaying(true)   // onStart
    );

    return () => {
        stopScanIntro();
    };
  }, []);

  // Reset or load existing data when a part is selected
  useEffect(() => {
    if (selectedPart) {
      const existingLog = data[selectedPart];
      if (existingLog) {
        setTempSensation(existingLog.sensation);
        setTempIntensity(existingLog.intensity);
      } else {
        setTempSensation(null);
        setTempIntensity(3); // Default intensity
      }
    }
  }, [selectedPart, data]);

  const togglePlayback = () => {
    if (isPlaying) {
      pauseScanIntro();
      setIsPlaying(false);
    } else {
      playScanIntro(
        () => setIsPlaying(false),
        () => setIsPlaying(true)
      );
    }
  };

  const handleSavePart = () => {
    if (!selectedPart || !tempSensation) return;
    
    setData(prev => ({
      ...prev,
      [selectedPart]: {
        id: selectedPart,
        label: selectedPart,
        sensation: tempSensation,
        intensity: tempIntensity
      } as BodyLog
    }));
    setSelectedPart(null);
  };

  // Configuração visual para cada sensação
  const sensationConfig: Record<SensationType, { 
    icon: any; 
    label: string; 
    textColor: string; 
    borderColor: string;
    gradient: string;
    activeBorder: string;
  }> = {
    tension: {
      icon: Activity,
      label: 'Tensão',
      textColor: 'text-clay',
      borderColor: 'border-stone-200 group-hover:border-clay/40',
      activeBorder: 'border-clay bg-clay/5 ring-2 ring-clay/20',
      gradient: 'from-clay/10 to-transparent'
    },
    heat: {
      icon: Thermometer,
      label: 'Calor',
      textColor: 'text-ochre',
      borderColor: 'border-stone-200 group-hover:border-ochre/40',
      activeBorder: 'border-ochre bg-ochre/5 ring-2 ring-ochre/20',
      gradient: 'from-ochre/10 to-transparent'
    },
    weight: {
      icon: Anchor,
      label: 'Peso',
      textColor: 'text-ocean',
      borderColor: 'border-stone-200 group-hover:border-ocean/40',
      activeBorder: 'border-ocean bg-ocean/5 ring-2 ring-ocean/20',
      gradient: 'from-ocean/10 to-transparent'
    },
    tingling: {
      icon: Zap,
      label: 'Formigar',
      textColor: 'text-amber-500',
      borderColor: 'border-stone-200 group-hover:border-amber-500/40',
      activeBorder: 'border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20',
      gradient: 'from-amber-500/10 to-transparent'
    },
    neutral: {
      icon: Minus,
      label: 'Neutro',
      textColor: 'text-sage',
      borderColor: 'border-stone-200 group-hover:border-sage/40',
      activeBorder: 'border-sage bg-sage/5 ring-2 ring-sage/20',
      gradient: 'from-sage/10 to-transparent'
    },
    numbness: { 
      icon: Minus,
      label: 'Dormência',
      textColor: 'text-stone-400',
      borderColor: 'border-stone-200 group-hover:border-stone-400/40',
      activeBorder: 'border-stone-400 bg-stone-400/5 ring-2 ring-stone-400/20',
      gradient: 'from-stone-400/10 to-transparent'
    }
  };

  const SensationButton = ({ type }: { type: SensationType }) => {
    const config = sensationConfig[type];
    const Icon = config.icon;
    const isSelected = tempSensation === type;

    return (
      <button
        onClick={() => setTempSensation(type)} 
        className={`
          group relative flex flex-col items-center justify-center p-4 
          rounded-2xl border bg-white 
          transition-all duration-300 ease-out
          ${isSelected ? config.activeBorder : `${config.borderColor} hover:shadow-lg hover:-translate-y-1 active:scale-95`}
          overflow-hidden
        `}
      >
        {/* Background Gradient on Hover or Active */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 ${isSelected ? 'opacity-100' : 'group-hover:opacity-100'} transition-opacity duration-300`} />
        
        {/* Icon with scale effect */}
        <Icon className={`w-6 h-6 mb-2 stroke-[1.5px] ${config.textColor} relative z-10 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`} />
        
        {/* Label */}
        <span className={`text-xs font-bold uppercase tracking-widest relative z-10 ${isSelected ? 'text-stone-800' : 'text-stone-600 group-hover:text-stone-800'}`}>
          {config.label}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Top Bar / Audio Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 pointer-events-none">
        <div className="pointer-events-auto bg-white/60 backdrop-blur-md p-3 rounded-full border border-white shadow-sm">
            <button onClick={togglePlayback} className="text-stone-600 hover:text-clay transition-colors flex items-center justify-center">
              {isPlaying ? <Pause className="w-6 h-6 stroke-1" /> : <Play className="w-6 h-6 stroke-1" />}
            </button>
        </div>
        
        <button 
          onClick={() => onComplete(data)}
          className="pointer-events-auto bg-stone-800 hover:bg-stone-700 text-stone-100 px-6 py-2 rounded-full font-serif text-sm tracking-wide shadow-md transition-all flex items-center gap-2"
        >
          <Check className="w-4 h-4" /> Concluir
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center relative">
        <div className="w-full max-w-md h-[60vh] md:h-[70vh] relative z-0 mt-12 md:mt-0">
          <BodyMap 
            data={data} 
            selectedPart={selectedPart} 
            onSelectPart={setSelectedPart} 
          />
        </div>
      </div>

      {/* Sensation Selector Modal / Sheet */}
      {selectedPart && (
        <div className="absolute inset-0 z-20 bg-paper/80 backdrop-blur-md flex items-end md:items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#fafaf9] border border-white/50 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl space-y-6 relative overflow-hidden flex flex-col max-h-[90vh]">
            {/* Background blur orb */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-stone-200/50 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Header */}
            <div className="flex justify-between items-center mb-1 relative z-10 flex-shrink-0">
              <h3 className="text-3xl font-serif italic text-stone-800">
                <span className="capitalize">{bodyPartTranslations[selectedPart] || selectedPart}</span>
              </h3>
              <button onClick={() => setSelectedPart(null)} className="text-stone-400 hover:text-stone-800 transition-colors bg-white/50 p-2 rounded-full hover:bg-white">
                <X className="w-5 h-5 stroke-1" />
              </button>
            </div>

            <p className="text-stone-500 text-sm font-light relative z-10">O que você está sentindo aqui?</p>
            
            {/* Grid Scroll Area if needed on small screens */}
            <div className="overflow-y-auto no-scrollbar py-1 relative z-10">
              <div className="grid grid-cols-2 gap-3">
                <SensationButton type="tension" />
                <SensationButton type="heat" />
                <SensationButton type="weight" />
                <SensationButton type="tingling" />
                <div className="col-span-2">
                  <SensationButton type="neutral" />
                </div>
              </div>
            </div>
            
            {/* Intensity Slider - Only appears when a sensation is selected */}
            <div className={`space-y-4 transition-all duration-500 ease-in-out overflow-hidden relative z-10 ${tempSensation ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0'}`}>
              <div className="pt-2 border-t border-stone-200/60">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Intensidade</span>
                  <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2 py-1 rounded-md">
                    {tempIntensity === 1 ? 'Leve' : tempIntensity === 5 ? 'Intensa' : tempIntensity} / 5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={tempIntensity}
                  onChange={(e) => setTempIntensity(parseInt(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-600 hover:accent-clay transition-all"
                />
                <div className="flex justify-between mt-2 text-[10px] text-stone-400 font-medium uppercase tracking-wider">
                  <span>Sutil</span>
                  <span>Forte</span>
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <div className="relative z-10 pt-2">
              <button 
                onClick={handleSavePart}
                disabled={!tempSensation}
                className={`
                  w-full py-4 rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-300
                  ${tempSensation 
                    ? 'bg-stone-800 text-stone-50 shadow-lg hover:shadow-xl hover:bg-stone-700 translate-y-0' 
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'}
                `}
              >
                {tempSensation ? <Save className="w-4 h-4" /> : null}
                {tempSensation ? 'Confirmar Registro' : 'Selecione uma sensação'}
              </button>
            </div>

          </div>
        </div>
      )}
      
      {/* Floating Guidance */}
      {!selectedPart && (
        <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
          <p className="text-stone-500 text-sm font-serif italic bg-white/70 inline-block px-6 py-3 rounded-full backdrop-blur-sm border border-white shadow-sm transition-all duration-500">
            {isPlaying ? "Ouça o guia. Toque no corpo para registrar sensações." : "Pausado. Toque no play para continuar."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Scanner;