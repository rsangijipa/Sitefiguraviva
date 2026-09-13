/**
 * @license
 * Instituto Figura Viva - PortalHeader (Registro Confluência)
 * Cabeçalho do Portal do Aluno com identificação, navegação e alternador de perfil para teste de RLS A/B.
 */

import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { DEMO_USERS, supabaseClient } from '../../services/supabase/client';
import { Compass, Clock, BookOpen, ShieldCheck, Database, Users, Sparkles } from 'lucide-react';

interface PortalHeaderProps {
  currentView: 'catalog' | 'history' | 'admin';
  onNavigate: (view: 'catalog' | 'history' | 'admin') => void;
  currentUser: UserProfile;
  onUserChange: (userKey: keyof typeof DEMO_USERS) => void;
  onOpenSchemaModal: () => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onUserChange,
  onOpenSchemaModal,
}) => {
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  return (
    <header className="w-full bg-[#FDFAF4] border-b-2 border-[#D8CFBE] sticky top-0 z-30">
      {/* Linha superior de acento Confluência (Aurora -> Vazante -> Broto) */}
      <div className="w-full h-1 confluencia-accent-line" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Identidade do Instituto */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#005A1F] text-[#FDFAF4] flex items-center justify-center font-serif font-bold text-lg">
              FV
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-widest text-[#96551F] font-bold block">
                Instituto Figura Viva
              </span>
              <h1 className="text-lg sm:text-xl font-serif font-bold text-[#005A1F] leading-none">
                Portal do Aluno
              </h1>
            </div>
          </div>

          {/* Botão mobile de usuário */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#D8CFBE] bg-[#F1E9DB] text-xs font-medium text-[#005A1F]"
            >
              <span>{currentUser.avatarInitials}</span>
            </button>
          </div>
        </div>

        {/* Navegação Principal */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 md:pb-0" aria-label="Navegação do portal">
          <button
            id="nav-btn-recursos"
            type="button"
            onClick={() => onNavigate('catalog')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px] whitespace-nowrap ${
              currentView === 'catalog'
                ? 'bg-[#005A1F] text-[#FDFAF4]'
                : 'text-[#4B4B49] hover:bg-[#F1E9DB] hover:text-[#005A1F]'
            }`}
          >
            <Compass className="w-4 h-4 text-inherit" strokeWidth={2} />
            <span>Recursos Interativos</span>
          </button>

          <button
            id="nav-btn-historico"
            type="button"
            onClick={() => onNavigate('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px] whitespace-nowrap ${
              currentView === 'history'
                ? 'bg-[#005A1F] text-[#FDFAF4]'
                : 'text-[#4B4B49] hover:bg-[#F1E9DB] hover:text-[#005A1F]'
            }`}
          >
            <Clock className="w-4 h-4 text-inherit" strokeWidth={2} />
            <span>Histórico Privado</span>
          </button>

          <button
            id="nav-btn-admin"
            type="button"
            onClick={() => onNavigate('admin')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px] whitespace-nowrap ${
              currentView === 'admin'
                ? 'bg-[#96551F] text-[#FDFAF4]'
                : 'text-[#4B4B49] hover:bg-[#F1E9DB] hover:text-[#96551F]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-inherit" strokeWidth={2} />
            <span>Gestão Editorial</span>
          </button>
        </nav>

        {/* Lado Direito: Alternador de Usuário (Simulação de RLS A/B e Anonimato) + Schema SQL */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Botão de Auditoria SQL Supabase */}
          <button
            id="btn-open-schema-modal"
            type="button"
            onClick={onOpenSchemaModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB] text-xs font-medium transition-colors min-h-[44px]"
            title="Ver schema PostgreSQL e regras de segurança RLS"
          >
            <Database className="w-3.5 h-3.5 text-[#07614C]" strokeWidth={2} />
            <span>Schema & RLS</span>
          </button>

          {/* Seletor de Perfil para testes de isolamento de dados */}
          <div className="relative">
            <button
              id="btn-user-profile-menu"
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border-2 border-[#D8CFBE] bg-[#F1E9DB] hover:border-[#005A1F] transition-all text-left min-h-[44px]"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div className="w-7 h-7 rounded-full bg-[#005A1F] text-[#FDFAF4] flex items-center justify-center text-xs font-bold font-sans">
                {currentUser.avatarInitials}
              </div>
              <div className="hidden lg:block leading-tight">
                <span className="text-xs font-bold text-[#005A1F] block">{currentUser.name}</span>
                <span className="text-[10px] text-[#6B6B63] block">
                  {currentUser.role === 'admin' ? 'Admin Editorial' : currentUser.role === 'student' ? 'Aluno(a)' : 'Visitante'}
                </span>
              </div>
            </button>

            {/* Menu Dropdown de troca de usuário */}
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
                    <span>RLS Ativa: Isolamento Estrito</span>
                  </div>
                </div>

                <p className="text-[10px] uppercase tracking-wider text-[#96551F] font-bold mb-1.5">
                  Alternar perfil para teste:
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
