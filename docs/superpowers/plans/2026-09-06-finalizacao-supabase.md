# Plano único de finalização Firebase → Supabase

## Fase 1 — Núcleo de runtime

Migrar emissor de certificados, progress service, gamificação, métricas e billing webhook para os repositórios/tabelas Supabase existentes. Preservar autorização, idempotência e contratos públicos.

## Fase 2 — Actions e superfícies administrativas

Migrar actions administrativas e páginas/hooks restantes para chamarem módulos Supabase, eliminando acesso direto ao banco nas rotas e componentes.

## Fase 3 — Configuração e remoção do legado

Remover variáveis Firebase, CSP/hosts Firebase, scripts de sincronização/backfill, regras Firestore, diretórios Firebase e dependências npm, somente após `rg` confirmar ausência de imports.

## Fase 4 — Organização e estabilidade

Consolidar serviços/repositórios duplicados por domínio, manter compatibilidade onde necessário, corrigir avisos de testes e revisar estados de erro/carregamento.

## Fase 5 — Gates finais

Executar typecheck, lint, testes, build e auditoria. Corrigir regressões até todos passarem; registrar resultado final e migrações SQL necessárias.
