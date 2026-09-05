# Rastreamento de Conflitos de Merge - Modernização

**Status**: 🔄 Em Progresso - Aguardando Análise Completa

---

## Métricas Preliminares

- **Arquivos Alterados**: 323
- **Inserções**: 31,778+
- **Deleções**: 6,390-
- **Linhas de Código Impactadas**: ~38k

### Magnitude da Mudança
```
🔴 MUITO GRANDE - Requer análise sistemática
   - 323 files é considerado "major refactor"
   - Potencial para múltiplos conflitos
   - Revisão granular necessária
```

---

## Áreas Identificadas de Conflito Potencial

### 1. Arquitetura Frontend
- [ ] Estrutura de componentes
- [ ] Organização de pastas (lib/, components/, actions/)
- [ ] Pattern de hooks e estado
- **Status**: 🔍 Aguardando análise

### 2. Dependências (package.json)
- [ ] Versões de libs atualizadas
- [ ] Novas dependências adicionadas
- [ ] Libs removidas ou deprecadas
- **Status**: 🔍 Aguardando análise

### 3. TypeScript Configuration
- [ ] tsconfig.json
- [ ] tsconfig.base.json (23+ linhas adicionadas)
- [ ] Path aliases
- **Status**: 🔍 Aguardando análise

### 4. Next.js Configuration
- [ ] next.config.mjs (49 linhas alteradas)
- [ ] Build otimizations
- [ ] Middleware
- **Status**: 🔍 Aguardando análise

### 5. Testes & Setup
- [ ] jest.config.js (13 linhas alteradas)
- [ ] jest.setup.js (16 linhas alteradas)
- [ ] playwright.config.ts
- [ ] E2E test files
- **Status**: 🔍 Aguardando análise

### 6. Tailwind & Styling
- [ ] tailwind.config.js (207 linhas alteradas!)
- [ ] Tema e design tokens
- [ ] Breakpoints e utilities customizadas
- **Status**: 🔍 Aguardando análise

### 7. Segurança & Middleware
- [ ] middleware.ts (12 linhas alteradas)
- [ ] Policies (CSP, CORS)
- [ ] Autenticação paths
- **Status**: 🔍 Aguardando análise

### 8. Componentes Críticos
- [ ] arvoredasemocoes (3d components)
- [ ] ExperienceClient/ExperienceRoot
- [ ] TreeScene (3D rendering)
- [ ] AnimatedComponents
- **Status**: 🔍 Aguardando análise

---

## Arquivos Que DEVEM SER PRESERVADOS

```
CRÍTICO (sem sobrescrita):
├── src/lib/firebase/admin.ts (root)
├── src/components/arvoredasemocoes/**/* (recently fixed)
├── src/lib/server/quote-repository.ts
├── Supabase migration files
├── Firestore rules & security
└── Environment configuration

REVISAR ANTES DE SOBRESCREVER:
├── package.json (merge inteligente)
├── tsconfig.json (path aliases)
├── next.config.mjs (build config)
├── jest.config.js (test setup)
├── .env.example (vars)
└── CI/CD workflows

MESCLAR COM PREFERÊNCIA POR MODERN:
├── Componentes UI
├── Performance optimizations
├── Accessibility improvements
├── New features
└── Refactored patterns
```

---

## Estratégia de Resolução

### Para Cada Conflito:

1. **ENTENDER**
   - De onde veio a mudança?
   - Qual é a intenção?
   - Qual é o impacto?

2. **DECIDIR**
   - Usar versão atual (ours)?
   - Usar versão moderna (theirs)?
   - Mesclar manualmente (both)?

3. **TESTAR**
   - Typecheck passa?
   - Build funciona?
   - Tests passam?
   - Sem regressions?

4. **DOCUMENTAR**
   - Por que foi escolhido X?
   - Qual foi a tradeoff?
   - Há algo que não foi preservado?

---

## Conflitos Resolvidos

*A ser preenchido durante merge*

| Arquivo | Tipo | Decisão | Razão | Status |
|---------|------|---------|-------|--------|
| TBD | TBD | TBD | TBD | 🔄 |

---

## Conflitos Em Andamento

*A ser preenchido durante merge*

| Arquivo | Tipo | Observações |
|---------|------|------------|
| TBD | TBD | TBD |

---

## Conflitos Pendentes

*A ser preenchido durante merge*

| Arquivo | Tipo | Prioridade |
|---------|------|-----------|
| TBD | TBD | 🔴/🟡/🟢 |

---

## Checklist de Validação Pós-Merge

### Build & Type Checking
- [ ] `npm run build` completa sem erros
- [ ] `npm run typecheck` passa (0 errors)
- [ ] `npm run lint` passa (0 errors)
- [ ] Sem warnings críticos

### Testes
- [ ] `npm test -- --runInBand` passa
- [ ] Cobertura de testes >= 75%
- [ ] Sem testes flaky
- [ ] `npm run test:e2e -- --project=public` passa

### Funcionalidades Críticas
- [ ] Supabase auth funciona
- [ ] Firebase admin calls funcionam
- [ ] Arvoredasemocoes renderiza
- [ ] TreeScene 3D renders
- [ ] Animations funcionam
- [ ] Public gallery loads
- [ ] Admin panel accessible

### Performance
- [ ] Build size comparável
- [ ] Nenhuma regressão de performance
- [ ] LCP, FCP dentro dos limites
- [ ] Sem memory leaks

### Segurança
- [ ] CSP header válido
- [ ] CORS properly configured
- [ ] Sem vulnerabilidades conhecidas
- [ ] Supabase RLS ativas

---

**Última Atualização**: 2026-09-05 22:15  
**Próxima Revisão**: Após análise do agent (30-45 min)
