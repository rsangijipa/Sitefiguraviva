# Plano: Necessidades Agora — Implementação Completa

## Visão Geral

Reimplementar o recurso "Necessidades Agora" de ponta a ponta, migrando do protótipo simples (`NeedsNowApp.tsx`) para uma experiência completa seguindo as convenções do repositório Figura Viva.

## Baseline Encontrada

| Item | Estado Atual |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Stack | Supabase (auth + DB), Tailwind CSS, Zod, lucide-react |
| Recursos interativos | Dois padrões coexistem: `src/features/` (emotion-wheel) e `src/components/resources/apps/` (apps encapsulados em ResourceWindow) |
| Persistência | Tabela `interactive_resource_entries` com RLS já criada (migration 202609100010) |
| Catálogo | `resourceCatalog.tsx` lista "necessidades-agora" como `coming-soon`, categoria PERCEBER |
| Rotas portal | `/portal/recursos/roda-das-emocoes/page.tsx` serve como padrão para recursos com persistência |
| Design tokens | Variáveis CSS `--color-primary` (Verde Raiz), `--color-areia`, `--color-aurora`, etc. em `globals.css` |
| App atual | `NeedsNowApp.tsx` — protótipo com 75 linhas, seleção básica sem persistência |

## Decisões Arquiteturais

### 1. Localização do código

Seguir o padrão `src/features/interactive-resources/current-needs/` inspirado no emotion-wheel:

```
src/features/interactive-resources/current-needs/
├── CurrentNeedsExperience.tsx      # Componente principal (fluxo completo)
├── types.ts                        # Tipos TypeScript
├── schema.ts                       # Schemas Zod para validação
├── content.ts                      # Catálogo editorial versionado (seed)
├── repository.ts                   # Camada Supabase (CRUD)
└── components/
    ├── NeedCard.tsx                # Card individual de necessidade
    ├── NeedsLibrary.tsx            # Grade de catálogo (3 colunas desktop)
    ├── PresentNeedsTray.tsx        # Bandeja "Mais presentes agora" (35%)
    ├── NeedPriorityControls.tsx    # Controles "Mover acima/abaixo"
    ├── SmallStepForm.tsx           # FormGesture opcional (small step)
    ├── NeedsSummary.tsx            # Tela de revisão/resumo
    └── NeedsHistory.tsx            # Histórico de registros
```

### 2. Roteamento

Criar rotas dentro de `/portal/recursos/necessidades-agora/`:

```
src/app/portal/recursos/necessidades-agora/
├── page.tsx               # Experiência principal
├── loading.tsx            # Loading state
└── error.tsx              # Error boundary

src/app/portal/recursos/necessidades-agora/historico/
├── page.tsx               # Lista de registros salvos
└── error.tsx
```

### 3. Admin content management

Gerenciamento de conteúdo entra no painel admin existente (`AdminShell` em `src/app/admin/`), não numa rota isolada. Criar página `/admin/recursos/necessidades-agora/content` reutilizando shell admin.

### 4. Catálogo editorial

Catálogo publicado em `content.ts` (versionado). Se futuro CMS existir, migration substitui `content.ts` por tabela `resource_content_versions` reutilizando o padrão existing de `resource_slug` + `version`.

### 5. Persistência

Reutilizar tabela `interactive_resource_entries` existente. Coluna `payload` JSONB com estrutura específica validada na camada repository:

```json
{
  "status": "selected",
  "entries": [
    {"needId": "descanso", "labelSnapshot": "Descanso"}
  ],
  "ordered": false,
  "focusEntryId": null,
  "smallStep": null
}
```

## Arquivos Criados

### Feature core (6 arquivos)

1. **`types.ts`** (~60 linhas)
2. **`schema.ts`** (~80 linhas) - Zod validation
3. **`content.ts`** (~120 linhas) - Seed editorial 8 necessidades
4. **`repository.ts`** (~150 linhas) - Supabase CRUD layer
5. **`CurrentNeedsExperience.tsx`** (~600-700 linhas)
6. **`components/`** (7 subcomponentes)

### Páginas de rota (5 arquivos)

7. **`page.tsx`**, **`loading.tsx`**, **`error.tsx`** — experiência principal
8. **`historico/page.tsx`**, **`historico/error.tsx`** — histórico

### Atualizações existentes (2 arquivos)

9. **`resourceCatalog.tsx`** — mudar `coming-soon` → `available`
10. **Migration SQL** — payload CHECK constraint

## Layout

Desktop: grade 3 colunas (65%) + bandeja Areia (35%). Mobile: grade 2 colunas, bandeja abaixo no fluxo. Tablet: composição intermediária.

## Fluxo

`intro → selecting → prioritizing (optional) → optionalStep → reviewing → saved | exit`

## Regras Principais

- Máximo 5 seleções
- Ordem = ordem de escolha; ordenar é explícito
- Efêmero padrão; salvar exige ação consciente
- Gesto pequeno ≤300 chars, nunca gera tarefa externa
- "Outra" ≤80 chars, "Ainda não sei" permite indefinição

## Design System

Tokens: `bg-paper` (#FDFAF4), `bg-areia` (#F1E9DB), `border-primary/text-primary` (#005A1F), `text-broto` (#01C94D), `text-pedra` (#6B6B63), `border-nevoa` (#D8CFBE). Fraunces nos títulos, Karla na interface. Cards rounded-2xl (24px). Botões min-h-[44px]. Transições 160-240ms. Reduced motion respeitado.

Ícones: lucide-react allowlist (Sleep, Users, Shield, Compass, PenTool, HandHelping, Lock, Sparkles).

## Privacidade

RLS existente aplicável. Intro informa modo efêmero. Confirmação de salvamento menciona privacidade. Aviso: "Professores e outros alunos não têm acesso".

## Testes

Unitários: schema + repository. E2E Playwright: fluxo completo, keyboard only, 390/768/1440px, reduced motion.

## Migração

CHECK constraint em `interactive_resource_entries.payload` para resource_slug='necessidades-agora': entries ≤5, label_snapshot present or status='unsure'.

## Limitações

1. Ícones customizados SVG se exigidos depois (usar lucide-first)
2. Analytics stub se tracker não existir
3. Admin CMS como follow-up se não existir CMS existente
4. Migrações criadas, não aplicadas em produção sem autorização

## Ordem

1. types/schema/content
2. repository
3. components UI
4. CurrentNeedsExperience
5. Rotas portal
6. resourceCatalog update
7. Migration SQL
8. Testes
9. typecheck/lint/build verification
