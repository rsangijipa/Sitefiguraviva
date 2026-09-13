/**
 * AdminCMS - Painel de Gestão de Conteúdo Editorial & Supabase RLS
 * Instituto Figura Viva - Registro Confluência
 *
 * Princípios Obrigatórios:
 * - Admin gerencia conteúdo editorial, ordem, licenças e metadados.
 * - Admin NÃO consulta percepções pessoais ou relatos íntimos de alunos.
 * - RLS habilitada em todas as tabelas privadas.
 * - Disponibiliza o script SQL de migração oficial para Supabase.
 */

import React, { useState } from 'react';
import {
  Database,
  Shield,
  FileCode,
  Copy,
  Check,
  Radio,
  BookOpen,
  Lock,
  EyeOff,
} from 'lucide-react';
import {
  globalRepository,
  SUPABASE_MIGRATIONS_SQL,
} from '../features/interactive-resources/awareness-sounds/repository';
import { ResourceContentVersion } from '../features/interactive-resources/awareness-sounds/types';
import { SOUND_LIBRARY_MANIFEST } from '../features/interactive-resources/awareness-sounds/audio/assetLoader';

export const AdminCMS: React.FC = () => {
  const versions = globalRepository.getContentVersions();
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'versions' | 'assets' | 'migrations'>('versions');

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_MIGRATIONS_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div id="admin-cms-page" className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Cabeçalho */}
      <div className="space-y-1 text-left border-b-2 border-[#D8CFBE] pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#96551F]">
          Gestão Pedagógica & Acústica
        </span>
        <h1 className="font-heading text-3xl font-bold text-[#005A1F]">
          Administração de Conteúdo & RLS
        </h1>
        <p className="text-sm text-[#4B4B49]">
          Controle editorial de versões do microapp Sons para Awareness e políticas de banco de dados Supabase.
        </p>
      </div>

      {/* Barreira Ética RLS: Proibição de Espionagem */}
      <div className="p-4 rounded-3xl bg-[#F1E9DB] border-2 border-[#96551F] flex items-start gap-3">
        <EyeOff className="w-5 h-5 text-[#96551F] shrink-0 mt-0.5" strokeWidth={2} />
        <div className="text-xs sm:text-sm text-[#262B22] leading-relaxed space-y-1">
          <p className="font-bold text-[#96551F]">
            Privacidade Arquitetural: Aluno Protegido por RLS
          </p>
          <p>
            O perfil administrativo <strong>não tem acesso</strong> às anotações, percepções de direção ou reflexões íntimas registradas pelos alunos. As políticas do Supabase (<code className="bg-[#FDFAF4] px-1.5 py-0.5 rounded border border-[#D8CFBE]">USING (auth.uid() = user_id)</code>) bloqueiam qualquer leitura administrativa de dados subjetivos.
          </p>
        </div>
      </div>

      {/* Subnavegação da Administração */}
      <div className="flex border-b border-[#D8CFBE] gap-4 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('versions')}
          className={`pb-2 transition-colors border-b-2 ${
            activeTab === 'versions'
              ? 'border-[#005A1F] text-[#005A1F]'
              : 'border-transparent text-[#6B6B63] hover:text-[#262B22]'
          }`}
        >
          Versões de Conteúdo ({versions.length})
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`pb-2 transition-colors border-b-2 ${
            activeTab === 'assets'
              ? 'border-[#005A1F] text-[#005A1F]'
              : 'border-transparent text-[#6B6B63] hover:text-[#262B22]'
          }`}
        >
          Manifesto de Licenças e Assets
        </button>
        <button
          onClick={() => setActiveTab('migrations')}
          className={`pb-2 transition-colors border-b-2 ${
            activeTab === 'migrations'
              ? 'border-[#005A1F] text-[#005A1F]'
              : 'border-transparent text-[#6B6B63] hover:text-[#262B22]'
          }`}
        >
          Migrações SQL Supabase (DDL)
        </button>
      </div>

      {/* Conteúdo 1: Versões */}
      {activeTab === 'versions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase text-[#005A1F] tracking-wide">
              Versões Publicadas e Rascunhos
            </h2>
            <span className="text-xs text-[#6B6B63]">
              Tabela: <code className="font-mono">resource_content_versions</code>
            </span>
          </div>

          <div className="space-y-3">
            {versions.map((ver) => (
              <div
                key={ver.id}
                className="p-5 rounded-[24px] bg-[#FDFAF4] border-2 border-[#D8CFBE] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-heading font-bold text-lg text-[#005A1F]">
                      v{ver.version}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        ver.status === 'published'
                          ? 'bg-[#F1E9DB] border-[#01C94D] text-[#005A1F]'
                          : 'bg-[#F1E9DB] border-[#FED701] text-[#96551F]'
                      }`}
                    >
                      {ver.status === 'published' ? 'Publicada' : 'Rascunho Editorial'}
                    </span>
                  </div>
                  <p className="text-xs text-[#4B4B49]">{ver.changelog}</p>
                  <p className="text-[11px] text-[#6B6B63] mt-1">
                    Revisor: {ver.reviewer} • {ver.scenesCount} cenas acústicas
                  </p>
                </div>

                <div className="text-xs font-semibold text-[#005A1F] self-start sm:self-auto">
                  {ver.status === 'published' ? 'Em uso no Portal' : 'Em homologação'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conteúdo 2: Assets e Licenças */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase text-[#005A1F] tracking-wide">
              Licenciamento e Verificação Acústica
            </h2>
            <span className="text-xs text-[#6B6B63]">
              4 arquivos de áudio validados
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(SOUND_LIBRARY_MANIFEST).map((sound) => (
              <div
                key={sound.id}
                className="p-5 rounded-[24px] bg-[#FDFAF4] border-2 border-[#D8CFBE] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-base text-[#005A1F]">
                    {sound.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#F1E9DB] text-[#96551F] font-semibold text-[10px]">
                    {sound.mimeType}
                  </span>
                </div>
                <p className="text-[#4B4B49]">{sound.textualDescription}</p>
                <div className="pt-2 border-t border-[#D8CFBE] space-y-1 text-[#6B6B63]">
                  <div><strong>Autoria:</strong> {sound.author}</div>
                  <div><strong>Licença:</strong> {sound.license}</div>
                  <div><strong>Versão acústica:</strong> {sound.version}</div>
                  <div><strong>Duração de loop:</strong> {sound.durationSeconds}s</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conteúdo 3: Migrações SQL Supabase */}
      {activeTab === 'migrations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase text-[#005A1F] tracking-wide">
                Script de Migração Supabase / PostgreSQL
              </h2>
              <p className="text-xs text-[#6B6B63]">
                Inclui tabelas, índices e políticas de Row Level Security (RLS).
              </p>
            </div>
            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#005A1F] text-[#FDFAF4] text-xs font-semibold hover:bg-[#07614C] transition-colors touch-target-min"
            >
              {copiedSql ? (
                <>
                  <Check className="w-4 h-4 text-[#01C94D]" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#FDFAF4]" />
                  <span>Copiar SQL</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 rounded-[24px] bg-[#262B22] text-[#FDFAF4] font-mono text-xs overflow-x-auto border-2 border-[#4B4B49] max-h-96 leading-relaxed">
            {SUPABASE_MIGRATIONS_SQL}
          </pre>
        </div>
      )}
    </div>
  );
};
