# Estratégia de Merge - Recomendações Práticas

**Baseado em Análise Preliminar**  
**Será refinado com resultados da análise profunda**

---

## 📋 COMPATIBILIDADE DE DEPENDÊNCIAS

### Versões Principais (✅ COMPATÍVEIS)
```
next        ^15.5.12  (ambas) ✅
react       19.0.0    (ambas) ✅
tailwindcss ^3.4.19   (ambas) ✅
```

**Conclusão**: Nenhum breaking change esperado de versões principais.

### Contagem de Dependências
- **main**: 78
- **modernized**: 86
- **Diferença**: +8 novas (análise pendente do agent)

---

## 🎯 ESTRATÉGIA POR CATEGORIA

### 1. DEPENDÊNCIAS (package.json)
**Estratégia**: MERGE INTELIGENTE

```bash
# Abordagem:
1. Manter versões principais iguais (next, react, tailwind)
2. Verificar novas 8 dependências
3. Se são melhorias/extras: ACEITAR
4. Se removem algo: QUESTIONAR

# Comando recomendado:
git checkout --theirs package.json  # Versão moderna como base
# Depois revisar manualmente grandes mudanças
```

### 2. TAILWIND CONFIG (207 linhas mudadas!)
**Estratégia**: USAR VERSÃO MODERN (inteira)

```bash
# Razão: Refatoração extensa → versão moderna tem designs melhores
git checkout --theirs tailwind.config.js

# Mas depois revisar:
# - Verificar que temas estão corretos
# - Testar responsive breakpoints
# - Validar cores customizadas
```

### 3. TYPESCRIPT CONFIG
**Estratégia**: USAR VERSÃO MODERN

```bash
# Mudanças em tsconfig.json e tsconfig.base.json
git checkout --theirs tsconfig.json tsconfig.base.json

# Validar:
# - Path aliases (@/) funcionam
# - Include/exclude patterns ok
# - Strict mode settings
```

### 4. NEXT.JS CONFIG (49 linhas mudadas)
**Estratégia**: MERGE MANUAL (caso a caso)

```bash
# Analisar cada mudança:
# 1. Build otimizations → ACEITAR (modern)
# 2. Sentry config → VALIDAR (ambas têm)
# 3. Middleware → MESCLAR com cuidado
# 4. Plugins → ACEITAR novos

# Comando:
git checkout --ours next.config.mjs
# Depois copiar manualmente as otimizações da modern
```

### 5. COMPONENTES E UI
**Estratégia**: USAR VERSÃO MODERN (com preservação)

```bash
# Para componentes em src/components:
git checkout --theirs src/components/

# EXCETO arvoredasemocoes que foi fixado:
git checkout --ours src/components/arvoredasemocoes/

# Motivo: queremos melhorias UI, mas preservamos fixes recentes
```

### 6. ACTIONS E SERVER LOGIC
**Estratégia**: MERGE MANUAL

```bash
# src/actions/: Mix de ambas versões
# 1. Copiar novas actions da modern
# 2. Manter fixes recentes da current
# 3. Validar que não há duplicação

# src/services/: Usar modern (refatoração arquitetura)
# Mas preservar Firebase/Supabase calls
```

### 7. LIB - CRÍTICO
**Estratégia**: PRESERVAR E MESCLAR

```bash
# src/lib/:
# ✅ PRESERVAR (--ours):
#    - firebase/admin.ts (root)
#    - server/* (quote-repository, etc)
#    - auth/* (autenticação)

# ✅ USAR MODERN (--theirs):
#    - Novas libs utilitárias
#    - Performance utilities
#    - Data utilities

# ⚠️  MESCLAR MANUAL:
#    - Middleware.ts
#    - Config files
```

### 8. TESTES E CI/CD
**Estratégia**: USAR VERSÃO MODERN

```bash
# Versão modern tem testes melhorados
git checkout --theirs jest.config.js
git checkout --theirs jest.setup.js
git checkout --theirs playwright.config.ts
git checkout --theirs e2e/

# Mas preservar testes que já passam:
# Se testes antigos estão em src/actions/__tests__/
# Verificar que não foram removidos
```

---

## 🚨 ORDEM DE RESOLUÇÃO (Recomendada)

### Passo 1: Estrutural (LOW RISK)
1. package.json
2. tsconfig.json, tsconfig.base.json
3. tailwind.config.js
4. .gitignore

**Comando**:
```bash
git checkout --theirs package.json tailwind.config.js tsconfig.*.json .gitignore
git add package.json tailwind.config.js tsconfig.*.json .gitignore
npm install  # Validar que novo package.json funciona
npm run typecheck  # Validar tipos com novo tsconfig
```

### Passo 2: Configuração (MEDIUM RISK)
1. next.config.mjs
2. jest.config.js
3. playwright.config.ts
4. .env.example

**Comando**: Merge manual, linha por linha

### Passo 3: Código Crítico (HIGH RISK)
1. src/lib/ (com estratégia preserve/merge acima)
2. src/middleware.ts
3. src/services/

**Comando**: Checkout seletivo

### Passo 4: Features (MEDIUM RISK)
1. src/components/ (com arvoredasemocoes exception)
2. src/actions/
3. src/app/

**Comando**: Checkout com validação

### Passo 5: Testes (MEDIUM RISK)
1. tests/
2. e2e/
3. src/__tests__/

**Comando**: Checkout com preservação de testes antigos

---

## ✅ VALIDAÇÃO APÓS CADA ETAPA

```bash
# Após Passo 1 (Estrutural):
npm install
npm run typecheck

# Após Passo 2 (Config):
npm run build  # Can build?
npm run lint   # Passa linting?

# Após Passo 3 (Código Crítico):
npm run typecheck  # Tipos ainda OK?
npm test -- --runInBand  # Tests passam?

# Após Passo 4 (Features):
npm run build
npm run lint
npm test

# Após Passo 5 (Testes):
npm test -- --runInBand
npm run test:e2e -- --project=public
```

---

## 🔴 CONFLITOS ESPERADOS (Preparação)

### Arquivo: `src/components/experience/ExperienceRoot.tsx`
**Tipo**: Import conflicts  
**Resolução**: Mesclar imports, testar renders  
**Prioridade**: 🔴 CRÍTICO

### Arquivo: `src/app/layout.tsx`
**Tipo**: Structure changes  
**Resolução**: Usar versão modern, validar nesting  
**Prioridade**: 🟡 MÉDIO

### Arquivo: `src/lib/auth/`
**Tipo**: Logic changes  
**Resolução**: Preserve current, adopt modern patterns  
**Prioridade**: 🔴 CRÍTICO

### Arquivo: `.github/workflows/ci.yml`
**Tipo**: Config changes  
**Resolução**: Mesclar manual, validar steps  
**Prioridade**: 🟡 MÉDIO

---

## 💡 DICAS PRÁTICAS

1. **Use `git mergetool`** se confortável
   ```bash
   git mergetool  # Abre editor visual de conflitos
   ```

2. **Commit incremental**
   ```bash
   git add src/lib/
   git commit -m "merge: resolve src/lib conflicts"
   # Não jogue tudo em um commit
   ```

3. **Revert se necessário**
   ```bash
   git merge --abort  # Se ficar muito complicado
   # Comece de novo com estratégia refinada
   ```

4. **Preserve funcionalidade crítica**
   ```bash
   # Sempre testar após resolver grupo de conflitos
   npm run typecheck
   npm test  # Ao menos testes rápidos
   ```

---

## 📊 ESTIMATIVAS

| Etapa | Arquivos | Tempo | Risco |
|-------|----------|-------|-------|
| 1. Estrutural | 4 | 5min | 🟢 Low |
| 2. Config | 4 | 10min | 🟡 Med |
| 3. Crítico | 10+ | 30min | 🔴 High |
| 4. Features | 50+ | 30min | 🟡 Med |
| 5. Testes | 30+ | 20min | 🟡 Med |
| **Total** | **100+** | **95min** | 🟠 Alto |

---

## 🎯 SUCESSO SIGNIFICA

✅ npm run build → 0 errors  
✅ npm run typecheck → 0 errors  
✅ npm run lint → passa  
✅ npm test → 100% passing  
✅ npm run test:e2e → 100% passing  
✅ Visual inspection → nenhuma regressão  
✅ Performance → comparável ou melhor  

---

**Será atualizado com recomendações específicas após análise do agent.**

**Last Updated**: 2026-09-05 22:25  
**Status**: 🟡 Aguardando análise profunda para refinamentos
