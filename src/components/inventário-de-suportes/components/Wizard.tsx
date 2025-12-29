import React, { useState, useRef, useEffect } from 'react';
import { SupportCategory, SupportItem } from '../types';
import { Button } from './Button';
import { Plus, X, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface WizardProps {
  onComplete: (items: SupportItem[]) => void;
  onBack: () => void;
}

const CATEGORIES = [
  {
    id: SupportCategory.PEOPLE,
    title: "Pessoas",
    subtitle: "Sua Tribo",
    description: "Quem são as almas que te fazem sentir seguro(a)? Amigos, família, terapeutas, ou até figuras inspiradoras.",
    placeholder: "Ex: Minha avó, João do trabalho..."
  },
  {
    id: SupportCategory.ROUTINES,
    title: "Rotinas",
    subtitle: "Seus Rituais",
    description: "Quais pequenos hábitos te ajudam a se centrar? O café da manhã lento, caminhar, skin care, ler antes de dormir.",
    placeholder: "Ex: Beber água ao acordar..."
  },
  {
    id: SupportCategory.PLACES,
    title: "Lugares",
    subtitle: "Seus Refúgios",
    description: "Onde você se sente em paz? Pode ser um canto do sofá, um parque, o mar, ou um lugar imaginário.",
    placeholder: "Ex: A poltrona da sala..."
  },
  {
    id: SupportCategory.PRACTICES,
    title: "Práticas",
    subtitle: "Sua Nutrição",
    description: "O que você faz que alimenta sua essência? Yoga, desenhar, ouvir música, cozinhar, meditar.",
    placeholder: "Ex: Playlist de Lo-fi..."
  },
  {
    id: SupportCategory.BELIEFS,
    title: "Crenças",
    subtitle: "Suas Raízes",
    description: "No que você acredita que te dá esperança? Espiritualidade, filosofia ou valores pessoais inegociáveis.",
    placeholder: "Ex: 'Isso também passa'..."
  }
];

export const Wizard: React.FC<WizardProps> = ({ onComplete, onBack }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [items, setItems] = useState<SupportItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const currentCategory = CATEGORIES[activeStep];
  const isLastStep = activeStep === CATEGORIES.length - 1;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeStep]);

  const handleAddItem = () => {
    if (!inputValue.trim()) return;
    
    const newItem: SupportItem = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      category: currentCategory.id
    };

    setItems([...items, newItem]);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleNext = () => {
    if (inputValue.trim()) {
      handleAddItem();
    }
    
    if (isLastStep) {
      onComplete(items);
    } else {
      setActiveStep(prev => prev + 1);
      setInputValue('');
    }
  };

  const handlePrev = () => {
    if (activeStep === 0) {
      onBack();
    } else {
      setActiveStep(prev => prev - 1);
    }
  };

  const currentItems = items.filter(i => i.category === currentCategory.id);

  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-8 fade-in flex flex-col h-[85vh]">
      
      {/* Organic Progress Indicators */}
      <div className="flex justify-center gap-3 mb-10">
        {CATEGORIES.map((cat, idx) => (
          <div 
            key={cat.id} 
            className={`transition-all duration-500 rounded-full ${
              idx === activeStep 
                ? 'w-8 h-2 bg-terra-400' 
                : idx < activeStep 
                  ? 'w-2 h-2 bg-moss-400' 
                  : 'w-2 h-2 bg-stone-300'
            }`} 
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col relative z-10">
        <header className="mb-10 text-center">
          <span className="text-terra-500 font-serif italic text-lg mb-1 block">
            {currentCategory.subtitle}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-ink mb-4">{currentCategory.title}</h2>
          <p className="text-moss-700 leading-relaxed max-w-lg mx-auto font-light">{currentCategory.description}</p>
        </header>

        {/* Boho Input Area - Underlined style */}
        <div className="mb-10 relative max-w-xl mx-auto w-full group">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentCategory.placeholder}
            className="w-full bg-transparent border-b-2 border-stone-300 py-4 pr-12 text-xl md:text-2xl font-serif text-ink focus:border-terra-400 focus:outline-none transition-colors placeholder:text-stone-400/70"
          />
          <button 
            onClick={handleAddItem}
            disabled={!inputValue.trim()}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-moss-600 hover:text-terra-500 disabled:opacity-0 transition-all transform hover:scale-110"
          >
            <Plus size={28} strokeWidth={1.5} />
          </button>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto min-h-[100px] mb-6 px-4">
          <ul className="flex flex-wrap justify-center gap-3">
            {currentItems.map(item => (
              <li key={item.id} className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-5 py-3 rounded-full border border-stone-200 shadow-sm animate-[fadeIn_0.3s_ease-out] group hover:border-terra-200 transition-colors">
                <span className="text-moss-900 font-medium">{item.text}</span>
                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-stone-400 hover:text-terra-400 ml-1 transition-colors"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
            {currentItems.length === 0 && (
              <li className="text-stone-400 italic font-serif text-lg opacity-60 mt-4">
                Sua lista está aguardando...
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8 pb-4">
        <Button variant="ghost" onClick={handlePrev} className="text-moss-600">
          <ArrowLeft size={18} />
          <span className="hidden md:inline">Voltar</span>
        </Button>
        <Button onClick={handleNext} className="bg-ink hover:bg-black text-paper rounded-full px-8">
          {isLastStep ? 'Finalizar' : 'Continuar'}
          {isLastStep ? <Check size={18} /> : <ArrowRight size={18} />}
        </Button>
      </div>
    </div>
  );
};