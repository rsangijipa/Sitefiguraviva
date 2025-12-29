import React, { useState } from 'react';
import { Step, SupportItem, SupportKit } from './types';
import { Welcome } from './components/Welcome';
import { Wizard } from './components/Wizard';
import { Loading } from './components/Loading';
import { KitResult } from './components/KitResult';
import { generateSupportKit } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('welcome');
  const [kit, setKit] = useState<SupportKit | null>(null);

  const handleStart = () => {
    setStep('wizard');
  };

  const handleWizardComplete = async (items: SupportItem[]) => {
    setStep('processing');
    try {
      const generatedKit = await generateSupportKit(items);
      setKit(generatedKit);
      setStep('result');
    } catch (e) {
      console.error("Failed to generate kit", e);
      setStep('wizard');
    }
  };

  const handleReset = () => {
    setKit(null);
    setStep('welcome');
  };

  return (
    <div className="min-h-screen bg-paper bg-noise font-sans selection:bg-terra-200 selection:text-ink relative overflow-hidden">
      
      {/* Global decorative corner if deeper inside the app */}
      {step !== 'welcome' && (
         <div className="fixed top-[-10%] right-[-5%] w-[300px] h-[300px] bg-stone-200/40 rounded-full blur-3xl pointer-events-none -z-0" />
      )}

      <main className="container mx-auto max-w-6xl min-h-screen flex flex-col relative z-10">
        
        {/* Header - Minimalist */}
        {step !== 'welcome' && (
          <header className="p-8 pb-0 flex items-center justify-center md:justify-start fade-in">
             <div className="font-serif font-bold text-ink tracking-widest text-xs uppercase border-b border-terra-300 pb-1 cursor-pointer hover:text-terra-600 transition-colors" onClick={() => setStep('welcome')}>
               Inventário
             </div>
          </header>
        )}

        <div className="flex-1 flex flex-col justify-center py-6">
          {step === 'welcome' && <Welcome onStart={handleStart} />}
          {step === 'wizard' && (
            <Wizard 
              onComplete={handleWizardComplete} 
              onBack={() => setStep('welcome')} 
            />
          )}
          {step === 'processing' && <Loading />}
          {step === 'result' && kit && <KitResult kit={kit} onReset={handleReset} />}
        </div>
      </main>
    </div>
  );
};

export default App;