# Evidências da auditoria de 03/10/2026

Base local: `C:/Users/aless/Downloads/Sitefiguraviva`, HEAD `6f29970766eeccad643680d07422bc33ec8a7b31`, com alterações locais anteriores à análise. As evidências não certificam o deploy nem o esquema do banco remoto.

| Arquivo | Conteúdo |
|---|---|
| `inventory.cjs`, `inventory.json` | Grafo estático de imports JS/TS, entradas Next, arquivos candidatos, duplicatas SHA-256 e tamanhos. O script ignora dependências/caches ao percorrer código e não remove arquivos. |
| `export-inventory.cjs` | Exporta CSVs do inventário existente. |
| `unused-candidates.csv` | 205 candidatos não alcançados desde entradas estáticas. Revisão necessária antes de excluir. |
| `duplicate-files.csv` | Nove grupos com conteúdo idêntico. Não comprova que todos os consumidores aceitem uma única cópia. |
| `typecheck.log`, `lint.log` | Comandos concluídos com exit 0. |
| `jest.log`, `build.log` | Falha de inicialização SWC por política de execução do Windows, antes de validar suites/build. |
| `npm-ls.json` | Dependências de primeiro nível instaladas, consulta exit 0. |
| `npm-audit.json` | Audit com `--omit=dev`. JSON normalizado após remover aviso do npm ao final. Exit 1 por entradas afetadas. |
| `firebase-status.json` | Resultado da ferramenta de diagnóstico da migração, `migration-pending`. Contagem textual inclui referências que não são necessariamente caminhos ativos. |
| `probes.cjs`, `probes.json` | Seis reproduções de trechos reais, transpilados em VM com serviços simulados. Sem Supabase/Firebase/Stripe reais, sem gravação de negócio. Não substituem E2E nem teste de exposição HTTP. |
| `live-public.cjs`, `live-public.json` | Navegação anônima de 12 rotas no domínio informado, usando Edge headless. Sem contas, formulários enviados, inscrições ou pagamentos. |
| `live-public-error.log` | Primeira tentativa com Chromium ausente. Foi superada pela execução bem-sucedida com Edge registrada no JSON. |

Comandos de reprodução, a partir da raiz do projeto:

```powershell
npm run typecheck
npm run lint
npm ls --depth=0 --json
npm audit --omit=dev --json
node scripts/check-firebase-migration-status.mjs
node docs/audits/2026-10-03-evidence/inventory.cjs
node docs/audits/2026-10-03-evidence/export-inventory.cjs
node docs/audits/2026-10-03-evidence/probes.cjs
node docs/audits/2026-10-03-evidence/live-public.cjs
```

Jest e build precisam de um ambiente que carregue SWC. Para isolar o build, definir `NEXT_DIST_DIR` antes de `npm run build`. Não alterar política de execução nem usar o ambiente publicado para testar matrícula/aprovação. O script de navegador solicita páginas públicas e gera tráfego GET; nenhum script desta pasta executa os fluxos financeiros reais.

O SQL de verificação em `../2026-10-03-verificacao-supabase.sql` é somente leitura e não foi executado no projeto informado. Valores de chaves/senhas não fazem parte dos entregáveis.

## Complemento: comparação isolada

As primeiras tentativas bloqueadas por SWC são históricas. Duas builds passaram com o pacote oficial WASM em snapshots fora do Git, incluindo uma cópia sem os 205 candidatos. A remoção causou 14 novas falhas de suítes Jest. Ver [comparação completa](<C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-03-comparacao-build.md>) e [plano revisado](<C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-03-plano-implementacao-revisado.md>). Materiais de reprodução devem permanecer privados até revisão de exposição/mitigação.
