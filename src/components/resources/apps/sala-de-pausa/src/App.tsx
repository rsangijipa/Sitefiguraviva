/**
 * @license
 * Instituto Figura Viva - Aplicativo Oficial: Sala de Pausa (Registro Confluência)
 * Aplicação dedicada exclusivamente à Sala de Pausa com:
 * 1. Barra Superior contendo botão de voltar e nome do aplicativo.
 * 2. Janela do Meio contendo todos os recursos do aplicativo (Práticas, Histórico Privado, Guia Editorial e Paisagem Sonora).
 * 3. Design System Confluência v1.0, persistência com isolamento RLS e acessibilidade completa.
 */

import React, { useState, useRef, useCallback } from 'react';
import { SalaDePausaTopBar, SalaDePausaTab } from './features/interactive-resources/pause-room/components/SalaDePausaTopBar';
import { SalaDePausaWindow } from './features/interactive-resources/pause-room/SalaDePausaWindow';
import { SqlSchemaModal } from './features/portal/SqlSchemaModal';
import { supabaseClient, DEMO_USERS } from './services/supabase/client';
import { webAudio } from './services/audio/webAudioService';
import { UserProfile } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => supabaseClient.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<SalaDePausaTab>('praticas');
  const [isPracticeActive, setIsPracticeActive] = useState<boolean>(false);
  const [activePracticeTitle, setActivePracticeTitle] = useState<string | undefined>();
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState<boolean>(false);

  // Referência para o gatilho de voltar registrado pela Janela Central
  const backTriggerRef = useRef<(() => void) | null>(null);

  const handleRegisterBackTrigger = useCallback((trigger: () => void) => {
    backTriggerRef.current = trigger;
  }, []);

  // Botão de voltar acionado na barra superior
  const handleTopBarBack = () => {
    if (backTriggerRef.current) {
      backTriggerRef.current();
    } else if (currentTab !== 'praticas') {
      setCurrentTab('praticas');
    }
  };

  // Alternador de som de igarapé
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    webAudio.setMuted(nextMute);
  };

  // Alternador de movimento reduzido
  const handleToggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
  };

  // Sincroniza usuário autenticado para testes de isolamento de histórico RLS
  const handleUserChange = (userKey: keyof typeof DEMO_USERS) => {
    supabaseClient.setCurrentUser(userKey);
    setCurrentUser(supabaseClient.getCurrentUser());
  };

  // Rótulo do botão de voltar de acordo com o contexto
  const getBackLabel = () => {
    if (isPracticeActive) return 'Interromper e voltar';
    if (currentTab !== 'praticas') return 'Voltar às práticas';
    return 'Início';
  };

  return (
    <div 
      id="sala-de-pausa-app"
      className={`min-h-[100dvh] flex flex-col bg-[#FDFAF4] text-[#262B22] selection:bg-[#F1E9DB] ${
        reducedMotion ? 'reduced-motion-active' : ''
      }`}
    >
      {/* 1. BARRA SUPERIOR OBRIGATÓRIA: BOTÃO DE VOLTAR E NOME DO APLICATIVO */}
      <SalaDePausaTopBar
        appName="Sala de Pausa"
        onBack={handleTopBarBack}
        canGoBack={isPracticeActive || currentTab !== 'praticas'}
        backLabel={getBackLabel()}
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        isPracticeActive={isPracticeActive}
        activePracticeTitle={activePracticeTitle}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={handleToggleReducedMotion}
        currentUser={currentUser}
        onUserChange={handleUserChange}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
      />

      {/* 2. JANELA DO MEIO COM TODOS OS RECURSOS DO APLICATIVO */}
      <div className="flex-1 flex flex-col justify-center">
        <SalaDePausaWindow
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          currentUser={currentUser}
          reducedMotion={reducedMotion}
          onToggleReducedMotion={handleToggleReducedMotion}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onActiveStateChange={(isActive, practiceTitle) => {
            setIsPracticeActive(isActive);
            setActivePracticeTitle(practiceTitle);
          }}
          registerBackTrigger={handleRegisterBackTrigger}
        />
      </div>

      {/* 3. RODAPÉ INSTITUCIONAL FIGURA VIVA (REGISTRO CONFLUÊNCIA) */}
      <footer 
        id="sala-de-pausa-footer"
        className="w-full border-t-2 border-[#D8CFBE] bg-[#FDFAF4] py-4 px-4 text-center text-xs text-[#6B6B63]"
        role="contentinfo"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[#005A1F]">Instituto Figura Viva</span>
            <span>•</span>
            <span className="text-[#96551F] font-semibold">Sala de Pausa (Registro Confluência)</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span>Autonomia e sem cobranças</span>
            <span>•</span>
            <span>Dados privados protegidos por RLS</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsSchemaModalOpen(true)}
              className="text-[#005A1F] underline hover:text-[#07614C] transition-colors"
            >
              Auditar Schema SQL
            </button>
          </div>
        </div>
      </footer>

      {/* Modal de Auditoria do Schema Supabase / PostgreSQL */}
      <SqlSchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />
    </div>
  );
}
