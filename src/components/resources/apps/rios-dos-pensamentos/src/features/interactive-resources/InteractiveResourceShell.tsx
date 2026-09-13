/**
 * Shell Base para Recursos Interativos do Instituto Figura Viva
 * Registro Visual: CONFLUÊNCIA
 * Fornece arquitetura consistente para todos os microapps do portal.
 */

import React from 'react';
import { ArrowLeft, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';
import { ResourceState } from '../../types';

interface InteractiveResourceShellProps {
  title: string;
  subtitle?: string;
  category?: string;
  state: ResourceState;
  onBackToCatalog: () => void;
  onRetry?: () => void;
  errorMessage?: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  hideHeader?: boolean;
}

export const InteractiveResourceShell: React.FC<InteractiveResourceShellProps> = ({
  title,
  subtitle,
  category = 'Confluência',
  state,
  onBackToCatalog,
  onRetry,
  errorMessage,
  children,
  headerActions,
  hideHeader = false,
}) => {
  return (
    <div className="w-full min-h-[calc(100dvh-70px)] flex flex-col bg-[#FDFAF4] text-[#262B22]">
      {/* 1. ResourceHeader: compacto e padronizado (oculto quando a barra superior central já fornece a navegação) */}
      {!hideHeader && (
        <header className="w-full border-b-2 border-[#D8CFBE] bg-[#FDFAF4] px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-20">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={onBackToCatalog}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] min-w-[44px] rounded-[16px] border-2 border-[#D8CFBE] hover:border-[#96551F] hover:bg-[#F1E9DB] text-xs sm:text-sm font-medium text-[#262B22] transition-colors cursor-pointer"
                aria-label="Voltar para a lista de Recursos Interativos"
              >
                <ArrowLeft className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
                <span className="hidden sm:inline">Recursos</span>
              </button>

              <div className="min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-[#F1E9DB] text-[#005A1F] uppercase border border-[#D8CFBE]">
                    {category}
                  </span>
                  <div className="w-6 h-1 rounded-full gradient-confluencia" aria-hidden="true" />
                </div>
                <h1 className="font-['Fraunces'] text-lg sm:text-xl font-bold text-[#005A1F] truncate mt-0.5">
                  {title}
                </h1>
              </div>
            </div>

            {/* Ações adicionais do cabeçalho */}
            {headerActions && (
              <div className="flex items-center gap-2">
                {headerActions}
              </div>
            )}
          </div>
        </header>
      )}

      {/* 2. Conteúdo Principal segundo o estado */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col">
        {state === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center" role="status">
            <div className="w-10 h-10 border-4 border-[#D8CFBE] border-t-[#005A1F] rounded-full animate-spin mb-4" />
            <p className="font-['Fraunces'] text-lg text-[#005A1F]">Preparando o leito do rio...</p>
            <p className="text-xs text-[#6B6B63] mt-1">Carregando parâmetros do Instituto Figura Viva</p>
          </div>
        )}

        {state === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto" role="alert">
            <div className="w-12 h-12 rounded-full bg-[#F1E9DB] flex items-center justify-center mb-4 border border-[#96551F]">
              <AlertTriangle className="w-6 h-6 text-[#96551F]" strokeWidth={2} />
            </div>
            <h2 className="font-['Fraunces'] text-xl font-semibold text-[#96551F] mb-2">
              Não foi possível carregar esta experiência
            </h2>
            <p className="text-sm text-[#6B6B63] mb-6">
              {errorMessage || 'Houve uma oscilação na conexão com o portal. Seus dados continuam seguros.'}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-[16px] bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] text-sm font-medium transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-[#FDFAF4]" strokeWidth={2} />
                <span>Tentar novamente</span>
              </button>
            )}
          </div>
        )}

        {state === 'empty' && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
            <Sparkles className="w-8 h-8 text-[#96551F] mb-3" strokeWidth={2} />
            <h2 className="font-['Fraunces'] text-lg text-[#005A1F] font-semibold mb-1">
              Nenhuma prática ativa
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6B63]">
              O recurso está em espera. Inicie uma nova sessão para começar a observar.
            </p>
          </div>
        )}

        {(state === 'ready' || state === 'active' || state === 'paused' || state === 'completed' || state === 'reduced-motion') && (
          <div className="flex-1 flex flex-col gap-4 sm:gap-6">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
