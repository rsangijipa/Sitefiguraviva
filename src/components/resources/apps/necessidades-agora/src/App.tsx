/**
 * Instituto Figura Viva - Portal do Aluno
 * Aplicação Central e Roteamento de Recursos Interativos
 * Registro Confluência
 */

import React, { useState, useEffect } from 'react';
import { PortalHeader } from './components/portal/PortalHeader';
import { ResourcesCatalog } from './components/portal/ResourcesCatalog';
import { CurrentNeedsExperience } from './features/interactive-resources/current-needs/CurrentNeedsExperience';
import { NeedsHistory } from './features/interactive-resources/current-needs/components/NeedsHistory';
import { AdminNeedsCatalog } from './features/interactive-resources/current-needs/admin/AdminNeedsCatalog';
import { UserProfile } from './types';

// Usuários simulados para verificação da segurança e isolamento de dados (RLS)
const SEED_USERS: UserProfile[] = [
  {
    id: 'user-ana-101',
    name: 'Ana Souza',
    email: 'ana.souza@figura-viva.org.br',
    role: 'student',
    avatarInitials: 'AS',
  },
  {
    id: 'user-bruno-202',
    name: 'Bruno Lima',
    email: 'bruno.lima@figura-viva.org.br',
    role: 'student',
    avatarInitials: 'BL',
  },
  {
    id: 'admin-coord-999',
    name: 'Coordenação Pedagógica',
    email: 'coordenacao@figura-viva.org.br',
    role: 'admin',
    avatarInitials: 'CP',
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(SEED_USERS[0]);
  const [currentRoute, setCurrentRoute] = useState<string>('/portal/recursos/necessidades-agora');

  // Sincronização suave com histórico do navegador
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path && path !== '/') {
        setCurrentRoute(path);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    try {
      window.history.pushState({}, '', route);
    } catch {
      // Navegação local segura se pushState for restrito no iframe
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-[100dvh] bg-[#FDFAF4] text-[#262B22] flex flex-col font-sans">
      {/* Barra de Navegação Global do Portal do Aluno (exibida no catálogo e no admin) */}
      {(currentRoute === '/portal/recursos' ||
        currentRoute.startsWith('/admin')) && (
        <PortalHeader
          currentUser={currentUser}
          availableUsers={SEED_USERS}
          onSelectUser={(u) => setCurrentUser(u)}
          currentRoute={currentRoute}
          onNavigate={navigate}
        />
      )}

      {/* Roteador das Vistas Canônicas */}
      <div className="flex-1 flex flex-col">
        {/* Rota 1: Catálogo do Portal */}
        {currentRoute === '/portal/recursos' && (
          <ResourcesCatalog
            onOpenNeedsExperience={() =>
              navigate('/portal/recursos/necessidades-agora')
            }
            onOpenNeedsHistory={() =>
              navigate('/portal/recursos/necessidades-agora/historico')
            }
          />
        )}

        {/* Rota 2: Experiência Interativa "Necessidades Agora" */}
        {currentRoute === '/portal/recursos/necessidades-agora' && (
          <CurrentNeedsExperience
            userId={currentUser.id}
            onNavigateToCatalog={() => navigate('/portal/recursos')}
          />
        )}

        {/* Rota 3: Histórico Privado Dedicado */}
        {currentRoute === '/portal/recursos/necessidades-agora/historico' && (
          <div className="flex-1 flex flex-col">
            <PortalHeader
              currentUser={currentUser}
              availableUsers={SEED_USERS}
              onSelectUser={(u) => setCurrentUser(u)}
              currentRoute={currentRoute}
              onNavigate={navigate}
            />
            <main className="flex-1">
              <NeedsHistory
                userId={currentUser.id}
                onBackToExperience={() =>
                  navigate('/portal/recursos/necessidades-agora')
                }
                onNewExperience={() =>
                  navigate('/portal/recursos/necessidades-agora')
                }
              />
            </main>
          </div>
        )}

        {/* Rota 4: Gestão Editorial de Necessidades (Admin) */}
        {currentRoute.startsWith('/admin') && (
          <main className="flex-1">
            <AdminNeedsCatalog
              adminName={currentUser.name}
              onBackToPortal={() => navigate('/portal/recursos')}
            />
          </main>
        )}
      </div>
    </div>
  );
}
