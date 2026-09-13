/**
 * PortalHeader - Barra de Navegação Canônica do Portal do Aluno
 * Instituto Figura Viva - Design System v1.0
 */

import React from 'react';
import { Sparkles, Shield, User, ChevronDown } from 'lucide-react';
import { UserProfile } from '../../types';

interface PortalHeaderProps {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  currentUser,
  availableUsers,
  onSelectUser,
  currentRoute,
  onNavigate,
}) => {
  return (
    <header
      id="portal-global-header"
      className="bg-[#FDFAF4] border-b-2 border-[#D8CFBE] px-4 sm:px-6 md:px-8 py-3.5 sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Marca Figura Viva */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('/portal/recursos')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-[#005A1F] text-[#FDFAF4] flex items-center justify-center font-heading font-bold text-sm">
              FV
            </div>
            <div>
              <span className="font-heading font-bold text-base sm:text-lg text-[#005A1F] tracking-tight block leading-none">
                Instituto Figura Viva
              </span>
              <span className="text-[11px] text-[#96551F] font-medium tracking-wide">
                Portal do Aluno
              </span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1 ml-4 border-l-2 border-[#D8CFBE] pl-4">
            <button
              type="button"
              onClick={() => onNavigate('/portal/recursos')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                currentRoute.startsWith('/portal/recursos')
                  ? 'bg-[#F1E9DB] text-[#005A1F] border border-[#D8CFBE]'
                  : 'text-[#4B4B49] hover:bg-[#F1E9DB]'
              }`}
            >
              Recursos Interativos
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/admin/recursos/necessidades-agora')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                currentRoute.startsWith('/admin')
                  ? 'bg-[#005A1F] text-[#FDFAF4]'
                  : 'text-[#96551F] hover:bg-[#F1E9DB]'
              }`}
            >
              <Shield className="w-3.5 h-3.5 stroke-2" />
              <span>Gestão Editorial (Admin)</span>
            </button>
          </nav>
        </div>

        {/* Seletor de Usuário Autenticado (Simula Auth com Isolamento RLS Real) */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F1E9DB] border border-[#D8CFBE] text-xs">
              <span className="w-6 h-6 rounded-full bg-[#005A1F] text-[#FDFAF4] font-bold text-[10px] flex items-center justify-center">
                {currentUser.avatarInitials}
              </span>
              <div className="text-left hidden sm:block">
                <span className="font-bold text-[#262B22] block leading-none">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-[#6B6B63] capitalize">
                  {currentUser.role === 'admin' ? 'Curadoria Editorial' : 'Aluno'}
                </span>
              </div>

              <select
                id="user-profile-switcher"
                aria-label="Alternar perfil de teste RLS"
                value={currentUser.id}
                onChange={(e) => {
                  const u = availableUsers.find((user) => user.id === e.target.value);
                  if (u) onSelectUser(u);
                }}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                title="Alternar entre alunos e admin para testar isolamento de histórico privado (RLS)"
              >
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B6B63]" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
