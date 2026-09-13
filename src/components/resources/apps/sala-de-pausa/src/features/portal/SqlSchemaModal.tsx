/**
 * @license
 * Instituto Figura Viva - Visualizador de Migrações e Regras RLS Supabase
 */

import React, { useState } from 'react';
import { X, Copy, Check, Database, ShieldCheck } from 'lucide-react';

interface SqlSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_CONTENT = `-- Instituto Figura Viva - Schema Supabase / PostgreSQL (Registro Confluência)
-- 1. interactive_resource_sessions: sessões de uso dos microapps
CREATE TABLE IF NOT EXISTS public.interactive_resource_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_slug TEXT NOT NULL CHECK (resource_slug IN ('sala-de-pausa', 'rio-dos-pensamentos')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. interactive_resource_entries: registros privados voluntários
CREATE TABLE IF NOT EXISTS public.interactive_resource_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_slug TEXT NOT NULL,
    session_id UUID REFERENCES public.interactive_resource_sessions(id) ON DELETE SET NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_private BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. pause_sessions: tabela dedicada e tipada da Sala de Pausa
CREATE TABLE IF NOT EXISTS public.pause_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_request_id UUID NOT NULL,
    practice_id TEXT NOT NULL CHECK (practice_id IN ('breathing', 'observing', 'listening', 'movement', 'slowing')),
    practice_title TEXT NOT NULL,
    planned_duration_seconds INTEGER NOT NULL CHECK (planned_duration_seconds IN (120, 180, 300)),
    active_duration_seconds INTEGER NOT NULL CHECK (active_duration_seconds >= 0 AND active_duration_seconds <= 7200),
    ended_by TEXT NOT NULL CHECK (ended_by IN ('timer', 'user', 'switch')),
    reflection TEXT CHECK (char_length(reflection) <= 500),
    content_version TEXT NOT NULL DEFAULT '1.0.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unq_user_client_request UNIQUE(user_id, client_request_id)
);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.pause_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactive_resource_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aluno lê e escreve exclusivamente seu próprio histórico"
ON public.pause_sessions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Aluno gerencia exclusivamente suas entradas privadas"
ON public.interactive_resource_entries FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);`;

export const SqlSchemaModal: React.FC<SqlSchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_CONTENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#262B22]/50 flex items-center justify-center p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schema-modal-title"
    >
      <div className="bg-[#FDFAF4] border-2 border-[#005A1F] rounded-[24px] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-left">
        {/* Cabeçalho */}
        <div className="p-5 border-b-2 border-[#D8CFBE] flex items-center justify-between bg-[#F1E9DB]">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-[#005A1F]" strokeWidth={2} />
            <div>
              <h3 id="schema-modal-title" className="font-serif font-bold text-lg text-[#005A1F]">
                Schema Supabase & RLS (Figura Viva v1.0)
              </h3>
              <p className="text-xs text-[#4B4B49]">
                Tabelas relacionais, constraints, idempotência e políticas de Row Level Security.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#4B4B49] hover:bg-[#FDFAF4] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informações de conformidade */}
        <div className="p-4 bg-[#FDFAF4] border-b border-[#D8CFBE] text-xs text-[#262B22] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#005A1F]" />
            <span>RLS habilitada em todas as tabelas privadas. Aluno lê apenas `auth.uid() = user_id`.</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#005A1F] text-[#005A1F] hover:bg-[#F1E9DB] transition-colors font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar SQL'}</span>
          </button>
        </div>

        {/* Código SQL */}
        <div className="flex-1 p-4 overflow-y-auto bg-[#262B22] text-[#F1E9DB] font-mono text-xs leading-relaxed">
          <pre className="whitespace-pre-wrap">{SQL_CONTENT}</pre>
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-[#D8CFBE] bg-[#F1E9DB] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#005A1F] text-[#FDFAF4] font-medium text-xs hover:bg-[#07614C] transition-colors min-h-[44px]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
