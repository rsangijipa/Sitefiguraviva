import React from 'react';
import { SupportKit, SupportCategory, EnhancedSupportItem } from '../types';
import { Button } from './Button';
import { RotateCcw, Share2, Sparkles } from 'lucide-react';

interface KitResultProps {
  kit: SupportKit;
  onReset: () => void;
}

export const KitResult: React.FC<KitResultProps> = ({ kit, onReset }) => {
  
  const itemsByCategory = kit.items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<SupportCategory, EnhancedSupportItem[]>);

  const categoriesOrder = [
    SupportCategory.PEOPLE,
    SupportCategory.ROUTINES,
    SupportCategory.PLACES,
    SupportCategory.PRACTICES,
    SupportCategory.BELIEFS
  ];

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-12 fade-in relative">
      
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-terra-100/40 rounded-full blur-3xl -z-10 mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-moss-100/40 rounded-full blur-3xl -z-10 mix-blend-multiply pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-16 relative z-10">
        <span className="text-terra-500 uppercase tracking-widest text-xs font-bold mb-3 block">Seu Manifesto</span>
        <div className="relative inline-block">
          <h2 className="text-4xl md:text-6xl font-serif text-ink mb-6 leading-tight max-w-3xl mx-auto">
            "{kit.mantra}"
          </h2>
          <Sparkles className="absolute -top-6 -right-6 text-terra-300 opacity-60" size={40} />
        </div>
        <div className="w-16 h-1 bg-moss-300 mx-auto my-6 rounded-full opacity-60" />
        <p className="text-lg text-moss-800 italic max-w-xl mx-auto font-serif leading-relaxed opacity-80">
          {kit.summary}
        </p>
      </div>

      {/* Grid - Masonry feel */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 mb-16">
        {categoriesOrder.map((cat, idx) => {
          const catItems = itemsByCategory[cat];
          if (!catItems || catItems.length === 0) return null;

          // Alternate card styles slightly
          const cardBg = idx % 2 === 0 ? 'bg-white' : 'bg-[#faf9f6]';

          return (
            <div key={cat} className={`break-inside-avoid ${cardBg} p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-stone-100 blob-shape-2 hover:shadow-lg transition-all duration-500`}>
              <h3 className="font-serif text-2xl text-ink mb-6 border-b border-terra-100 pb-2 inline-block">
                {cat}
              </h3>
              
              <ul className="space-y-6">
                {catItems.map(item => (
                  <li key={item.id} className="group">
                    <div className="text-moss-900 font-medium text-lg mb-1">{item.text}</div>
                    <div className="flex items-start gap-3">
                      <span className="text-terra-400 text-lg font-serif italic mt-0.5">→</span>
                      <p className="text-sm text-stone-500 font-light leading-relaxed group-hover:text-moss-700 transition-colors">
                        {item.shortcut}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 border-t border-stone-200 pt-10">
        <Button onClick={onReset} variant="ghost">
          <RotateCcw size={16} />
          Recomeçar
        </Button>
        <Button onClick={() => window.print()} variant="primary" className="shadow-terra-200">
          <Share2 size={16} />
          Salvar Kit
        </Button>
      </div>
      
      <div className="mt-16 text-center opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-xs font-serif tracking-widest text-moss-800">
           INVENTÁRIO DE SUPORTES
        </p>
      </div>
    </div>
  );
};