/**
 * PortalHeader - Cabeçalho Institucional do Portal do Aluno
 * Instituto Figura Viva - Registro Confluência
 */

import React from 'react';
import { Sparkles, User, Shield, Compass, BookOpen, Clock, Lock } from 'lucide-react';

export type PortalTab = 'catalog' | 'resource-experience' | 'history' | 'admin';

interface PortalHeaderProps {
  currentTab: PortalTab;
  onSelectTab: (tab: PortalTab) => void;
  currentUser: { name: string; role: 'aluno' | 'admin' | 'anonimo'; id: string };
  onSwitchUserRole: (role: 'aluno' | 'admin' | 'anonimo') => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onSwitchUserRole,
}) => {
  return (
    <header className="w-full bg-[#FDFAF4] border-b-2 border-[#D8CFBE] sticky top-0 z-40">
      {/* Acento Linear Confluência: Aurora -> Vazante -> Broto */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FE538B] via-[#FED701] to-[#01C94D]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Marca Institucional */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('catalog')}
            className="text-left group flex items-center gap-2.5 touch-target-min"
          >
            <div className="w-9 h-9 rounded-2xl bg-[#005A1F] text-[#FDFAF4] flex items-center justify-center font-heading font-bold text-base">
              FV
            </div>
            <div>
              <div className="font-heading font-bold text-base sm:text-lg text-[#005A1F] tracking-tight group-hover:text-[#07614C] transition-colors">
                Instituto Figura Viva
              </div>
              <div className="text-[11px] text-[#96551F] font-medium tracking-wide uppercase">
                Portal do Aluno • Confluência
              </div>
            </div>
          </button>
        </div>

        {/* Navegação Principal */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            id="tab-nav-catalog"
            onClick={() => onSelectTab('catalog')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-full transition-colors touch-target-min ${
              currentTab === 'catalog' || currentTab === 'resource-experience'
                ? 'bg-[#F1E9DB] text-[#005A1F] font-semibold'
                : 'text-[#4B4B49] hover:bg-[#F1E9DB]'
            }`}
          >
            Recursos Interativos
          </button>

          <button
            id="tab-nav-history"
            onClick={() => onSelectTab('history')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-full transition-colors touch-target-min ${
              currentTab === 'history'
                ? 'bg-[#F1E9DB] text-[#005A1F] font-semibold'
                : 'text-[#4B4B49] hover:bg-[#F1E9DB]'
            }`}
          >
            Meu Histórico Privado
          </button>

          <button
            id="tab-nav-admin"
            onClick={() => onSelectTab('admin')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-full transition-colors touch-target-min ${
              currentTab === 'admin'
                ? 'bg-[#F1E9DB] text-[#005A1F] font-semibold'
                : 'text-[#4B4B49] hover:bg-[#F1E9DB]'
            }`}
          >
            CMS & Banco RLS
          </button>
        </nav>

        {/* Perfil & Seletor de Sessão RLS */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F1E9DB] border border-[#D8CFBE] text-xs">
            <span className="w-2 h-2 rounded-full bg-[#01C94D]" />
            <span className="font-semibold text-[#262B22]">{currentUser.name}</span>
            <span className="text-[10px] uppercase font-bold text-[#96551F]">
              ({currentUser.role})
            </span>
          </div>

          <select
            value={currentUser.role}
            onChange={(e) => onSwitchUserRole(e.target.value as 'aluno' | 'admin' | 'anonimo')}
            aria-label="Alternar papel de usuário para teste de isolamento RLS"
            className="text-xs bg-[#FDFAF4] border border-[#D8CFBE] rounded-full px-2.5 py-1.5 text-[#4B4B49] focus:outline-none focus:border-[#005A1F]"
          >
            <option value="aluno">Aluno: Mariana</option>
            <option value="admin">Administrador (CMS)</option>
            <option value="anonimo">Sessão Anônima</option>
          </select>
        </div>
      </div>
    </header>
  );
};
