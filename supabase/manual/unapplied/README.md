# Migrações nunca aplicadas

Estes arquivos saíram de `supabase/migrations/` na reconciliação de 15/11/2026.

| Arquivo | Situação em produção | Uso no código |
|---|---|---|
| `202609110010_garden_thoughts.sql` | Tabela `garden_thoughts` não existe | `src/features/thought-garden/repository.ts` não é importado por nenhuma rota |
| `202609110012_pause_practices.sql` | Tabela `pause_practices` não existe | Nenhum |

Se algum recurso voltar a precisar dessas tabelas, crie uma migração **nova** com timestamp atual (`supabase migration new <nome>`), copie o SQL e aplique pelo fluxo normal. Não devolva estes arquivos com o timestamp antigo: ele fica antes de versões já aplicadas e exige `db push --include-all`.
