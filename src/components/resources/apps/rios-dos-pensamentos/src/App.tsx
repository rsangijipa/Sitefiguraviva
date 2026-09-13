/**
 * Instituto Figura Viva - Portal do Aluno
 * Aplicação Central com Integração Completa do Rio dos Pensamentos
 */

import React, { useState } from 'react';
import { UserProfile } from './types';
import { DEMO_USERS } from './features/interactive-resources/thought-river/repository';
import { ResourcesCatalog } from './features/portal/ResourcesCatalog';
import { ThoughtRiverExperience } from './features/interactive-resources/thought-river/ThoughtRiverExperience';
import { StudentHistory } from './features/portal/StudentHistory';
import { ThoughtRiverAdmin } from './features/admin/ThoughtRiverAdmin';
import { 
  ArrowLeft,
  User, 
  Settings, 
  History, 
  ShieldCheck, 
} from 'lucide-react';

type CurrentRoute = 'catalog' | 'river' | 'history' | 'admin';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]); // Sofia Albuquerque (aluna)
  // A janela do meio já inicia com a aplicação do rio dos pensamentos aberta
  const [currentRoute, setCurrentRoute] = useState<CurrentRoute>('river');

  const handleSwitchUser = (userId: string) => {
    const selected = DEMO_USERS.find(u => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
      // Se era admin e mudou para aluno enquanto estava na tela admin, volta para o rio
      if (currentRoute === 'admin' && selected.role !== 'admin') {
        setCurrentRoute('river');
      }
    }
  };

  const handleBack = () => {
    if (currentRoute !== 'river') {
      setCurrentRoute('river');
    } else {
      // Se já está no rio, recarrega suavemente a experiência
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFAF4] text-[#262B22] flex flex-col font-['Karla',sans-serif] selection:bg-[#F1E9DB] selection:text-[#005A1F]">
      {/* Barra de Navegação Superior Refatorada */}
      <header className="w-full bg-[#FDFAF4] border-b-2 border-[#D8CFBE] px-4 sm:px-6 lg:px-8 py-3 sticky top-0 z-30 shadow-none">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* LADO ESQUERDO: Botão de Voltar */}
          <div className="flex items-center min-w-[120px]">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-[16px] border-2 border-[#D8CFBE] bg-[#FDFAF4] hover:bg-[#F1E9DB] hover:border-[#96551F] text-xs sm:text-sm font-medium text-[#262B22] transition-colors cursor-pointer"
              aria-label="Voltar para a experiência central"
              title="Voltar"
            >
              <ArrowLeft className="w-4 h-4 text-[#96551F]" strokeWidth={2.5} />
              <span className="font-semibold text-[#005A1F]">Voltar</span>
            </button>
          </div>

          {/* NO MEIO: Nome da Aplicação Centralizado */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-2 min-w-0">
            <div className="flex items-center gap-2 justify-center">
              <h1 className="font-['Fraunces'] text-lg sm:text-2xl font-bold text-[#005A1F] tracking-tight truncate">
                Rio dos Pensamentos
              </h1>
              <div className="w-5 h-1 rounded-full gradient-confluencia hidden sm:block shrink-0" aria-hidden="true" />
            </div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-[#96551F] uppercase tracking-wider truncate">
              Instituto Figura Viva · Registro Confluência
            </p>
          </div>

          {/* LADO DIREITO: Ações Rápidas e Perfil de Usuário */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 min-w-[120px]">
            <nav className="flex items-center gap-1.5" aria-label="Ações rápidas">
              <button
                type="button"
                onClick={() => setCurrentRoute(currentRoute === 'history' ? 'river' : 'history')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[40px] rounded-[14px] text-xs sm:text-sm font-medium transition-colors cursor-pointer border ${
                  currentRoute === 'history'
                    ? 'bg-[#005A1F] text-[#FDFAF4] border-[#005A1F]'
                    : 'bg-[#FDFAF4] text-[#262B22] border-[#D8CFBE] hover:bg-[#F1E9DB]'
                }`}
                title="Visualizar histórico privado de sessões"
              >
                <History className="w-3.5 h-3.5 text-[#96551F]" strokeWidth={2} />
                <span className="hidden md:inline">Histórico</span>
              </button>

              {currentUser.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => setCurrentRoute(currentRoute === 'admin' ? 'river' : 'admin')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[40px] rounded-[14px] text-xs sm:text-sm font-medium transition-colors cursor-pointer border ${
                    currentRoute === 'admin'
                      ? 'bg-[#005A1F] text-[#FDFAF4] border-[#005A1F]'
                      : 'bg-[#FDFAF4] text-[#96551F] border-[#D8CFBE] hover:bg-[#F1E9DB]'
                  }`}
                  title="Painel Editorial de Conteúdo (Admin)"
                >
                  <Settings className="w-3.5 h-3.5" strokeWidth={2} />
                  <span className="hidden md:inline">Admin</span>
                </button>
              )}
            </nav>

            {/* Alternador de Perfil para testes de RLS e privacidade */}
            <div className="relative">
              <label htmlFor="user-selector" className="sr-only">
                Alternar Perfil Ativo
              </label>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[14px] bg-[#F1E9DB] border border-[#D8CFBE]">
                <User className="w-3.5 h-3.5 text-[#005A1F] shrink-0" strokeWidth={2} />
                <select
                  id="user-selector"
                  value={currentUser.id}
                  onChange={(e) => handleSwitchUser(e.target.value)}
                  className="bg-transparent text-xs font-medium text-[#262B22] focus:outline-none cursor-pointer pr-1 max-w-[100px] sm:max-w-none truncate"
                  title="Alternar perfil ativo do aluno"
                >
                  {DEMO_USERS.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.role === 'admin' ? '(Admin)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Dinâmico conforme a rota ativa */}
      <div className="flex-1 flex flex-col">
        {currentRoute === 'catalog' && (
          <ResourcesCatalog
            currentUser={currentUser}
            onOpenResource={(slug) => {
              if (slug === 'rio-dos-pensamentos') {
                setCurrentRoute('river');
              }
            }}
            onOpenHistory={() => setCurrentRoute('history')}
          />
        )}

        {currentRoute === 'river' && (
          <ThoughtRiverExperience
            currentUser={currentUser}
            onNavigateToCatalog={() => setCurrentRoute('catalog')}
            onNavigateToHistory={() => setCurrentRoute('history')}
          />
        )}

        {currentRoute === 'history' && (
          <StudentHistory
            currentUser={currentUser}
            onBackToCatalog={() => setCurrentRoute('catalog')}
            onOpenResource={(slug) => {
              if (slug === 'rio-dos-pensamentos') {
                setCurrentRoute('river');
              }
            }}
          />
        )}

        {currentRoute === 'admin' && (
          <ThoughtRiverAdmin
            currentUser={currentUser}
            onBackToPortal={() => setCurrentRoute('catalog')}
          />
        )}
      </div>

      {/* Rodapé institucional com princípios de ética e design Confluência */}
      <footer className="w-full border-t-2 border-[#D8CFBE] bg-[#FDFAF4] px-4 py-5 text-center text-xs text-[#6B6B63]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#005A1F]" />
            <span>Instituto Figura Viva · Design System Confluência v1.0</span>
          </div>

          <div className="flex items-center gap-4 text-[#6B6B63]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#005A1F]" strokeWidth={2} />
              Práticas subjetivas sem avaliação diagnóstica
            </span>
            <span>·</span>
            <span>WCAG AA Acessível</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
