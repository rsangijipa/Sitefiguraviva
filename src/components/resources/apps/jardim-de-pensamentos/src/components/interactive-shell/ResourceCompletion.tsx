import React from 'react';
import { Bookmark, RotateCcw, ArrowLeft } from 'lucide-react';

interface ResourceCompletionProps {
  title?: string;
  supportText?: string;
  savedCount: number;
  onViewSaved: () => void;
  onRestart: () => void;
  onBackToPortal: () => void;
}

export const ResourceCompletion: React.FC<ResourceCompletionProps> = ({
  title = 'Você pode voltar quando quiser.',
  supportText = 'As folhas efêmeras desta sessão deixaram o jardim suavemente. Seus pensamentos guardados continuam em segurança no seu histórico privado.',
  savedCount,
  onViewSaved,
  onRestart,
  onBackToPortal,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 bg-[#FDFAF4] border-2 border-[#96551F] rounded-[24px] text-center my-auto">
      {/* Marcador Confluência: sem drop-shadow, profundidade por camadas */}
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#F1E9DB] border-2 border-[#005A1F] flex items-center justify-center text-[#005A1F]">
        <svg
          className="w-8 h-8 stroke-[2px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold font-fraunces text-[#005A1F] mb-3">
        {title}
      </h2>

      <p className="text-base text-[#262B22] leading-relaxed mb-6 max-w-md mx-auto">
        {supportText}
      </p>

      {savedCount > 0 && (
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-[#F1E9DB] border-2 border-[#D8CFBE] rounded-full text-sm text-[#07614C] font-medium">
          <Bookmark className="w-4 h-4 text-[#96551F]" />
          <span>
            {savedCount === 1
              ? '1 pensamento guardado nesta sessão'
              : `${savedCount} pensamentos guardados nesta sessão`}
          </span>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
        <button
          type="button"
          onClick={onViewSaved}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#005A1F] hover:bg-[#07614C] text-[#FDFAF4] font-medium rounded-full transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#005A1F]"
        >
          <Bookmark className="w-5 h-5 stroke-[2px]" />
          <span>Ver pensamentos guardados</span>
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#F1E9DB] hover:bg-[#D8CFBE] text-[#262B22] font-medium rounded-full border-2 border-[#D8CFBE] transition-colors min-h-[44px]"
        >
          <RotateCcw className="w-5 h-5 stroke-[2px] text-[#005A1F]" />
          <span>Entrar no jardim novamente</span>
        </button>

        <button
          type="button"
          onClick={onBackToPortal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 text-[#6B6B63] hover:text-[#262B22] transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2px]" />
          <span>Voltar ao Portal</span>
        </button>
      </div>
    </div>
  );
};
