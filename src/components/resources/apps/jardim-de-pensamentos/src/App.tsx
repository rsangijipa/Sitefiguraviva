import React, { useState } from 'react';
import { UserSessionProfile } from './features/interactive-resources/thought-garden/types';
import { ThoughtGardenExperience } from './features/interactive-resources/thought-garden/ThoughtGardenExperience';
import { SavedThoughtsList } from './features/interactive-resources/thought-garden/components/SavedThoughtsList';
import { RotateCcw, AlertTriangle } from 'lucide-react';

const DEFAULT_USER: UserSessionProfile = {
  id: 'student_a',
  name: 'Mariana Silva',
  email: 'mariana.silva@figura-viva.edu.br',
  role: 'student',
};

export default function App() {
  const [currentUser] = useState<UserSessionProfile>(DEFAULT_USER);
  const [currentRoute, setCurrentRoute] = useState<'garden' | 'saved'>('garden');
  const [gardenSessionKey, setGardenSessionKey] = useState<number>(1);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  // Ação do botão "Voltar" na barra superior
  const handleBack = () => {
    if (currentRoute === 'saved') {
      setCurrentRoute('garden');
    } else {
      // No jardim, confirma se o usuário deseja reiniciar o canteiro
      setShowRestartConfirm(true);
    }
  };

  const handleConfirmRestart = () => {
    setShowRestartConfirm(false);
    setGardenSessionKey((k) => k + 1);
  };

  return (
    <div className="w-full min-h-[100dvh] bg-[#FDFAF4] text-[#262B22] font-sans antialiased selection:bg-[#F1E9DB] selection:text-[#005A1F]">
      {currentRoute === 'garden' ? (
        <ThoughtGardenExperience
          key={gardenSessionKey}
          userId={currentUser.id}
          onBackToPortal={handleBack}
          onOpenSavedThoughts={() => setCurrentRoute('saved')}
        />
      ) : (
        <SavedThoughtsList
          userId={currentUser.id}
          onBackToGarden={() => setCurrentRoute('garden')}
          onBackToPortal={() => setCurrentRoute('garden')}
        />
      )}

      {/* Diálogo Elegante de Confirmação do Botão "Voltar" no Jardim */}
      {showRestartConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="restart-dialog-title"
          className="fixed inset-0 z-50 bg-[#262B22]/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-[#FDFAF4] border-2 border-[#96551F] rounded-[24px] max-w-md w-full p-6 text-center shadow-lg">
            <div className="w-12 h-12 rounded-full bg-[#F1E9DB] border-2 border-[#96551F] text-[#96551F] flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6 stroke-[2px]" />
            </div>

            <h3 id="restart-dialog-title" className="text-lg font-bold font-fraunces text-[#005A1F] mb-2">
              Reiniciar visita ao jardim?
            </h3>

            <p className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed mb-6">
              Esta ação reorganiza o canteiro e recoloca as folhas de acolhimento originais. Seus pensamentos guardados continuam preservados com total segurança.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowRestartConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6B6B63] hover:text-[#262B22] rounded-full hover:bg-[#F1E9DB] transition-colors min-h-[44px]"
              >
                Continuar no jardim
              </button>

              <button
                type="button"
                onClick={handleConfirmRestart}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-[#005A1F] hover:bg-[#07614C] text-[#FDFAF4] rounded-full transition-colors min-h-[44px] shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar canteiro</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
