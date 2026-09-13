import React from 'react';
import { Leaf, Waves, Wind, Compass, Sparkles, User, Shield, Bookmark, ExternalLink } from 'lucide-react';
import { UserSessionProfile } from '../interactive-resources/thought-garden/types';

interface PortalCatalogProps {
  currentUser: UserSessionProfile;
  onSelectUser: (user: UserSessionProfile) => void;
  onOpenThoughtGarden: () => void;
  onOpenSavedThoughts: () => void;
  onOpenAdmin: () => void;
}

export const PortalCatalog: React.FC<PortalCatalogProps> = ({
  currentUser,
  onSelectUser,
  onOpenThoughtGarden,
  onOpenSavedThoughts,
  onOpenAdmin,
}) => {
  return (
    <div className="w-full min-h-[100dvh] bg-[#FDFAF4] text-[#262B22] flex flex-col select-text">
      {/* Barra Superior do Portal do Aluno */}
      <header className="w-full bg-[#FDFAF4] border-b-2 border-[#D8CFBE] px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Logotipo Marca Instituto Figura Viva */}
            <div className="w-10 h-10 rounded-full bg-[#005A1F] flex items-center justify-center text-[#FDFAF4] font-bold font-fraunces text-base">
              FV
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#96551F] uppercase tracking-wider block">
                Portal do Aluno
              </span>
              <h1 className="text-base sm:text-lg font-bold font-fraunces text-[#005A1F]">
                Instituto Figura Viva
              </h1>
            </div>
          </div>

          {/* Alternador de Perfil do Aluno (Simulação de Autenticação para Provas de Isolamento A/B) */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-xs text-[#6B6B63] bg-[#F1E9DB] px-3 py-1.5 rounded-full border border-[#D8CFBE]">
              <User className="w-3.5 h-3.5 text-[#005A1F]" />
              <span>Sessão ativa: <strong>{currentUser.name}</strong></span>
            </div>

            <select
              aria-label="Alternar perfil de aluno para teste de isolamento de dados"
              value={currentUser.id}
              onChange={(e) => {
                if (e.target.value === 'student_a') {
                  onSelectUser({
                    id: 'student_a',
                    name: 'Mariana Silva',
                    email: 'mariana.silva@figura-viva.edu.br',
                    role: 'student',
                  });
                } else if (e.target.value === 'student_b') {
                  onSelectUser({
                    id: 'student_b',
                    name: 'Carlos Oliveira',
                    email: 'carlos.oliveira@figura-viva.edu.br',
                    role: 'student',
                  });
                } else {
                  onSelectUser({
                    id: 'student_anon',
                    name: 'Visitante da Sessão',
                    email: 'anon@local.session',
                    role: 'student',
                    isAnonymous: true,
                  });
                }
              }}
              className="text-xs font-medium bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-full px-2.5 py-1.5 text-[#262B22] focus:border-[#005A1F] min-h-[44px]"
            >
              <option value="student_a">Mariana (Aluna A)</option>
              <option value="student_b">Carlos (Aluno B)</option>
              <option value="student_anon">Sessão Anônima</option>
            </select>

            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#005A1F] hover:bg-[#F1E9DB] px-3 py-2 rounded-full border border-[#005A1F] transition-colors min-h-[44px]"
              title="Acesso à Gestão Editorial"
            >
              <Shield className="w-3.5 h-3.5 text-[#005A1F]" />
              <span className="hidden md:inline">Painel Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Faixa Confluência Decorativa Discreta */}
      <div className="h-1 gradient-confluencia opacity-80" aria-hidden="true" />

      {/* Conteúdo Principal do Portal */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* Boas-vindas e Introdução ao Registro Confluência */}
        <div className="mb-8">
          <span className="text-xs font-semibold text-[#96551F] uppercase tracking-wider block mb-1">
            Espaço Confluência • Recursos Interativos
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-fraunces text-[#005A1F] mb-2">
            Recursos e Práticas para o seu Momento
          </h2>
          <p className="text-sm text-[#4B4B49] max-w-2xl leading-relaxed">
            Ferramentas interativas criadas para pousar a atenção, acolher expressões do momento e integrar práticas sem cobrança de desempenho.
          </p>
        </div>

        {/* Grade de Recursos Interativos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Principal: Jardim de Pensamentos */}
          <article className="p-6 bg-[#FDFAF4] border-2 border-[#96551F] rounded-[24px] flex flex-col justify-between hover:border-[#005A1F] transition-colors group">
            <div>
              {/* Cabeçalho do Card */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#F1E9DB] border-2 border-[#005A1F] flex items-center justify-center text-[#005A1F]">
                  <Leaf className="w-6 h-6 stroke-[2px]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#96551F] bg-[#F1E9DB] px-2.5 py-1 rounded-full">
                    2–5 min
                  </span>
                </div>
              </div>

              <span className="text-xs font-semibold text-[#07614C] uppercase tracking-wider block mb-1">
                Confluência • Escrita Breve
              </span>

              <h3 className="text-xl font-bold font-fraunces text-[#005A1F] mb-2 group-hover:text-[#07614C] transition-colors">
                Jardim de Pensamentos
              </h3>

              <p className="text-sm text-[#262B22] leading-relaxed mb-6">
                Dê uma forma passageira ao que passa pela sua mente.
              </p>
            </div>

            <div className="pt-4 border-t border-[#D8CFBE] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onOpenThoughtGarden}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#005A1F] hover:bg-[#07614C] text-[#FDFAF4] font-medium text-xs sm:text-sm rounded-full transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#005A1F]"
              >
                <span>Entrar no jardim</span>
              </button>

              <button
                type="button"
                onClick={onOpenSavedThoughts}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#6B6B63] hover:text-[#005A1F] transition-colors min-h-[44px]"
                title="Ver pensamentos guardados"
              >
                <Bookmark className="w-4 h-4 text-[#96551F]" />
                <span className="hidden sm:inline">Guardados</span>
              </button>
            </div>
          </article>

          {/* Card Referência: Rio de Sensações */}
          <article className="p-6 bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-[24px] flex flex-col justify-between opacity-80">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#F1E9DB] border-2 border-[#07614C] flex items-center justify-center text-[#07614C]">
                  <Waves className="w-6 h-6 stroke-[2px]" />
                </div>
                <span className="text-[11px] font-semibold text-[#6B6B63] bg-[#F1E9DB] px-2.5 py-1 rounded-full">
                  3–5 min
                </span>
              </div>

              <span className="text-xs font-semibold text-[#6B6B63] uppercase tracking-wider block mb-1">
                Confluência • Passagem Contínua
              </span>

              <h3 className="text-xl font-bold font-fraunces text-[#07614C] mb-2">
                Rio de Sensações
              </h3>

              <p className="text-sm text-[#4B4B49] leading-relaxed mb-6">
                Acompanhe o curso das sensações físicas que chegam e continuam seu fluxo.
              </p>
            </div>

            <div className="pt-4 border-t border-[#D8CFBE] flex items-center justify-between">
              <span className="text-xs text-[#6B6B63] font-medium">Em breve no catálogo</span>
              <button
                type="button"
                disabled
                className="px-4 py-2 bg-[#D8CFBE] text-[#6B6B63] rounded-full text-xs font-medium cursor-not-allowed"
              >
                Explorar
              </button>
            </div>
          </article>

          {/* Card Referência: Mapeamento Corporal */}
          <article className="p-6 bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-[24px] flex flex-col justify-between opacity-80">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#F1E9DB] border-2 border-[#96551F] flex items-center justify-center text-[#96551F]">
                  <Compass className="w-6 h-6 stroke-[2px]" />
                </div>
                <span className="text-[11px] font-semibold text-[#6B6B63] bg-[#F1E9DB] px-2.5 py-1 rounded-full">
                  5 min
                </span>
              </div>

              <span className="text-xs font-semibold text-[#6B6B63] uppercase tracking-wider block mb-1">
                Soma • Conexão Corporal
              </span>

              <h3 className="text-xl font-bold font-fraunces text-[#005A1F] mb-2">
                Mapeamento da Postura
              </h3>

              <p className="text-sm text-[#4B4B49] leading-relaxed mb-6">
                Reconheça tensões, pontos de apoio e equilíbrio no seu corpo presente.
              </p>
            </div>

            <div className="pt-4 border-t border-[#D8CFBE] flex items-center justify-between">
              <span className="text-xs text-[#6B6B63] font-medium">Em breve no catálogo</span>
              <button
                type="button"
                disabled
                className="px-4 py-2 bg-[#D8CFBE] text-[#6B6B63] rounded-full text-xs font-medium cursor-not-allowed"
              >
                Explorar
              </button>
            </div>
          </article>
        </div>

        {/* Seção Explicativa dos Princípios Confluência */}
        <section className="mt-12 p-6 bg-[#F1E9DB]/50 border-2 border-[#D8CFBE] rounded-[24px]">
          <h3 className="text-base font-bold font-fraunces text-[#005A1F] mb-2">
            Sobre as Experiências do Registro Confluência
          </h3>
          <p className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed mb-3">
            As ferramentas interativas do Instituto Figura Viva foram desenvolvidas para respeitar a autonomia subjetiva de cada pessoa. Não existem pontuações de &ldquo;sucesso&rdquo;, julgamentos diagnósticos ou métricas de desempenho emocional.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B6B63]">
            <span>• WCAG AA Acessível</span>
            <span>• Modo Movimento Reduzido</span>
            <span>• Áudio 100% Opcional</span>
            <span>• Armazenamento Privado</span>
          </div>
        </section>
      </main>
    </div>
  );
};
