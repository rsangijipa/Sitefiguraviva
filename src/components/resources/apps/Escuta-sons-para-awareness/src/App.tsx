/**
 * Instituto Figura Viva - Portal do Aluno
 * Aplicação Central & Integração do Microapp Confluência "Sons para Awareness"
 */

import React, { useState } from 'react';
import { PortalHeader, PortalTab } from './components/PortalHeader';
import { ResourceCatalog } from './components/ResourceCatalog';
import { StudentHistory } from './components/StudentHistory';
import { AdminCMS } from './components/AdminCMS';
import { AwarenessSoundsExperience } from './features/interactive-resources/awareness-sounds/AwarenessSoundsExperience';
import { globalRepository } from './features/interactive-resources/awareness-sounds/repository';

export default function App() {
  const [currentTab, setCurrentTab] = useState<PortalTab>('resource-experience');
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    role: 'aluno' | 'admin' | 'anonimo';
    id: string;
  }>({
    name: 'Mariana Rios',
    role: 'aluno',
    id: 'user_aluno_mariana_01',
  });

  const handleSwitchUserRole = (role: 'aluno' | 'admin' | 'anonimo') => {
    if (role === 'aluno') {
      const user = { name: 'Mariana Rios', role: 'aluno' as const, id: 'user_aluno_mariana_01' };
      setCurrentUser(user);
      globalRepository.setAuthenticatedUser(user.id, false);
    } else if (role === 'admin') {
      const user = { name: 'Coordenação Pedagógica', role: 'admin' as const, id: 'admin_pedagogico_01' };
      setCurrentUser(user);
      globalRepository.setAuthenticatedUser(user.id, false);
      setCurrentTab('admin');
    } else {
      const user = { name: 'Sessão Efêmera', role: 'anonimo' as const, id: 'anonimo_' + Math.random().toString(36).slice(2, 7) };
      setCurrentUser(user);
      globalRepository.setAuthenticatedUser(user.id, true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFAF4] text-[#262B22] flex flex-col font-karla selection:bg-[#F1E9DB] selection:text-[#005A1F]">
      {/* Cabeçalho do Portal */}
      <PortalHeader
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onSwitchUserRole={handleSwitchUserRole}
      />

      {/* Conteúdo da Aba Ativa */}
      <main className="flex-1 w-full p-3 sm:p-6 flex flex-col">
        {currentTab === 'catalog' && (
          <ResourceCatalog
            onOpenAwarenessSounds={() => setCurrentTab('resource-experience')}
          />
        )}

        {currentTab === 'resource-experience' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <AwarenessSoundsExperience
              onBackToCatalog={() => setCurrentTab('catalog')}
            />
          </div>
        )}

        {currentTab === 'history' && <StudentHistory />}

        {currentTab === 'admin' && <AdminCMS />}
      </main>

      {/* Rodapé Institucional Confluência */}
      <footer className="w-full bg-[#FDFAF4] border-t-2 border-[#D8CFBE] py-6 px-4 sm:px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B6B63]">
          <div className="flex items-center gap-2">
            <span className="font-heading font-semibold text-[#005A1F]">
              Instituto Figura Viva
            </span>
            <span>•</span>
            <span>Design System v1.0 — Registro Confluência</span>
          </div>

          <div className="text-center sm:text-right">
            <span>Privacidade e autonomia garantidas • Conformidade WCAG AA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
