/**
 * @license
 * Instituto Figura Viva - Barra Superior da Sala de Pausa (Registro Confluência)
 * Componente obrigatório: Botão de voltar e Nome do aplicativo "Sala de Pausa".
 * Inclui controles de acessibilidade (movimento calmo), som de igarapé e perfil de teste RLS.
 */

import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Sliders, ShieldCheck, Database, HelpCircle } from 'lucide-react';
import { UserProfile } from '../../../../types';
import { DEMO_USERS } from '../../../../services/supabase/client';

export type SalaDePausaTab = 'praticas' | 'historico' | 'editorial' | 'paisagem-sonora';

interface SalaDePausaTopBarProps {
  appName?: string;
  onBack: () => void;
  canGoBack?: boolean;
  backLabel?: string;
  currentTab: SalaDePausaTab;
  onTabChange: (tab: SalaDePausaTab) => void;
  isPracticeActive?: boolean;
  activePracticeTitle?: string;
  isMuted: boolean;
  onToggleMute: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  currentUser: UserProfile;
  onUserChange: (userKey: keyof typeof DEMO_USERS) => void;
  onOpenSchemaModal?: () => void;
}

export const SalaDePausaTopBar: React.FC<SalaDePausaTopBarProps> = ({
  appName = 'Sala de Pausa',
  onBack,
  canGoBack = true,
  backLabel = 'Voltar',
  currentTab,
  onTabChange,
  isPracticeActive = false,
  activePracticeTitle,
  isMuted,
  onToggleMute,
  reducedMotion,
  onToggleReducedMotion,
  currentUser,
  onUserChange,
  onOpenSchemaModal,
}) => {
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  return (
    <header 
      id="sala-de-pausa-topbar" 
      className="w-full bg-[#FDFAF4] border-b-2 border-[#D8CFBE] sticky top-0 z-40 shadow-xs"
      role="banner"
    >
      {/* Linha superior de acento Confluência (Aurora -> Vazante -> Broto) */}
      <div className="w-full h-1 confluencia-accent-line" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Bloco Esquerdo: Botão Voltar + Nome do Aplicativo */}
        <div className="flex items-center justify-between md:justify-start gap-2.5 sm:gap-4">
          {/* Botão de Voltar mandatório */}
          <button
            id="btn-topbar-voltar"
            type="button"
            onClick={onBack}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-[#005A1F] ${
              canGoBack
                ? 'text-[#005A1F] hover:bg-[#F1E9DB] border-2 border-[#D8CFBE] hover:border-[#005A1F]'
                : 'text-[#6B6B63] hover:bg-[#F1E9DB]/50 border-2 border-[#D8CFBE]/60'
            }`}
            aria-label={backLabel}
            title={backLabel}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-inherit" strokeWidth={2.5} />
            <span className="font-sans text-xs sm:text-sm">{backLabel}</span>
          </button>

          {/* Divisor vertical */}
          <div className="h-7 w-[2px] bg-[#D8CFBE] hidden sm:block" aria-hidden="true" />

          {/* Nome do Aplicativo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#005A1F] text-[#FDFAF4] flex items-center justify-center font-serif font-bold text-base sm:text-lg shrink-0">
              FV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#96551F] font-bold">
                  Instituto Figura Viva
                </span>
                {isPracticeActive && activePracticeTitle && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#01C94D]/20 text-[#005A1F] border border-[#01C94D]">
                    Em pausa: {activePracticeTitle}
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-[#005A1F] leading-tight flex items-center gap-2">
                <span>{appName}</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Bloco Central: Abas Rápidas da Janela da Sala de Pausa */}
        {!isPracticeActive && (
          <nav 
            className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none"
            aria-label="Recursos da Sala de Pausa"
          >
            <button
              id="tab-btn-praticas"
              type="button"
              onClick={() => onTabChange('praticas')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[40px] whitespace-nowrap ${
                currentTab === 'praticas'
                  ? 'bg-[#005A1F] text-[#FDFAF4] shadow-xs'
                  : 'text-[#4B4B49] hover:bg-[#F1E9DB] hover:text-[#005A1F]'
              }`}
            >
              Práticas da Sala
            </button>

            <button
              id="tab-btn-historico"
              type="button"
              onClick={() => onTabChange('historico')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[40px] whitespace-nowrap ${
                currentTab === 'historico'
                  ? 'bg-[#005A1F] text-[#FDFAF4] shadow-xs'
                  : 'text-[#4B4B49] hover:bg-[#F1E9DB] hover:text-[#005A1F]'
              }`}
            >
              Meu Histórico Privado
            </button>

            <button
              id="tab-btn-editorial"
              type="button"
              onClick={() => onTabChange('editorial')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[40px] whitespace-nowrap ${
                currentTab === 'editorial'
                  ? 'bg-[#96551F] text-[#FDFAF4] shadow-xs'
                  : 'text-[#4B4B49] hover:bg-[#F1E9DB] hover:text-[#96551F]'
              }`}
            >
              Guia & Roteiros
            </button>

            <button
              id="tab-btn-paisagem"
              type="button"
              onClick={() => onTabChange('paisagem-sonora')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[40px] whitespace-nowrap ${
                currentTab === 'paisagem-sonora'
                  ? 'bg-[#07614C] text-[#FDFAF4] shadow-xs'
                  : 'text-[#4B4B49] hover:bg-[#F1E9DB] hover:text-[#07614C]'
              }`}
            >
              Áudio de Igarapé
            </button>
          </nav>
        )}

        {/* Bloco Direito: Controles de Áudio, Movimento, Usuário & RLS */}
        <div className="flex items-center gap-1.5 sm:gap-2 self-end md:self-auto">
          {/* Alternar som de igarapé */}
          <button
            id="btn-topbar-mute"
            type="button"
            onClick={onToggleMute}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 transition-all min-h-[40px] text-xs font-medium ${
              isMuted 
                ? 'border-[#D8CFBE] text-[#6B6B63] hover:bg-[#F1E9DB]' 
                : 'bg-[#F1E9DB] border-[#07614C] text-[#07614C]'
            }`}
            title={isMuted ? 'Ativar som de igarapé' : 'Silenciar áudio'}
            aria-label={isMuted ? 'Ativar som' : 'Silenciar som'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-[#6B6B63]" strokeWidth={2} />
                <span className="hidden sm:inline">Silêncio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#07614C]" strokeWidth={2} />
                <span className="hidden sm:inline">Igarapé</span>
              </>
            )}
          </button>

          {/* Alternar movimento calmo */}
          <button
            id="btn-topbar-reduced-motion"
            type="button"
            onClick={onToggleReducedMotion}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 transition-all min-h-[40px] text-xs font-medium ${
              reducedMotion
                ? 'bg-[#F1E9DB] border-[#96551F] text-[#96551F]'
                : 'border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB]'
            }`}
            title={reducedMotion ? 'Movimento calmo ativo' : 'Alternar para movimento reduzido'}
            aria-label="Alternar movimento reduzido"
          >
            <Sliders className="w-4 h-4 text-inherit" strokeWidth={2} />
            <span className="hidden sm:inline">
              {reducedMotion ? 'Movimento calmo' : 'Animações'}
            </span>
          </button>

          {/* Botão de Auditoria SQL Supabase */}
          {onOpenSchemaModal && (
            <button
              id="btn-topbar-sql-schema"
              type="button"
              onClick={onOpenSchemaModal}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB] text-xs font-medium transition-colors min-h-[40px]"
              title="Auditar Schema SQL e Políticas RLS do Supabase"
            >
              <Database className="w-3.5 h-3.5 text-[#07614C]" strokeWidth={2} />
              <span>RLS</span>
            </button>
          )}

          {/* Menu de Usuário para teste de privacidade RLS */}
          <div className="relative">
            <button
              id="btn-topbar-profile"
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border-2 border-[#D8CFBE] bg-[#F1E9DB] hover:border-[#005A1F] transition-all text-left min-h-[40px]"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div className="w-6 h-6 rounded-full bg-[#005A1F] text-[#FDFAF4] flex items-center justify-center text-[11px] font-bold font-sans">
                {currentUser.avatarInitials}
              </div>
              <span className="text-xs font-bold text-[#005A1F] hidden sm:inline max-w-[80px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>
            </button>

            {/* Dropdown de troca de usuário */}
            {showUserMenu && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-[#FDFAF4] border-2 border-[#005A1F] rounded-2xl shadow-xl p-3 z-50 text-xs"
                role="menu"
              >
                <div className="pb-2 mb-2 border-b border-[#D8CFBE]">
                  <p className="font-bold text-[#005A1F] text-sm">{currentUser.name}</p>
                  <p className="text-[#6B6B63] text-[11px] truncate">{currentUser.email}</p>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-[#07614C] font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>RLS: Sessões 100% privadas</span>
                  </div>
                </div>

                <p className="text-[10px] uppercase tracking-wider text-[#96551F] font-bold mb-1.5">
                  Alternar perfil para teste de privacidade:
                </p>

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      onUserChange('sofia');
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between ${
                      currentUser.id === DEMO_USERS.sofia.id ? 'bg-[#F1E9DB] text-[#005A1F] font-bold' : 'hover:bg-[#F1E9DB]'
                    }`}
                  >
                    <span>Sofia Mendes (Aluna A)</span>
                    {currentUser.id === DEMO_USERS.sofia.id && <span className="text-[10px] text-[#005A1F]">Ativo</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onUserChange('lucas');
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between ${
                      currentUser.id === DEMO_USERS.lucas.id ? 'bg-[#F1E9DB] text-[#005A1F] font-bold' : 'hover:bg-[#F1E9DB]'
                    }`}
                  >
                    <span>Lucas Silveira (Aluno B)</span>
                    {currentUser.id === DEMO_USERS.lucas.id && <span className="text-[10px] text-[#005A1F]">Ativo</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onUserChange('admin');
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between ${
                      currentUser.id === DEMO_USERS.admin.id ? 'bg-[#F1E9DB] text-[#96551F] font-bold' : 'hover:bg-[#F1E9DB]'
                    }`}
                  >
                    <span>Dra. Helena (Admin Editorial)</span>
                    {currentUser.id === DEMO_USERS.admin.id && <span className="text-[10px] text-[#96551F]">Ativo</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onUserChange('guest');
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between ${
                      currentUser.id === DEMO_USERS.guest.id ? 'bg-[#F1E9DB] text-[#6B6B63] font-bold' : 'hover:bg-[#F1E9DB]'
                    }`}
                  >
                    <span>Visitante (Sessão efêmera)</span>
                    {currentUser.id === DEMO_USERS.guest.id && <span className="text-[10px] text-[#6B6B63]">Ativo</span>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
