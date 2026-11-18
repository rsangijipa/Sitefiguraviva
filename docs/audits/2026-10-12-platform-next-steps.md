# Análise da plataforma e próximos passos

Data: 12/10/2026. Escopo: repositório local Figura Viva.

## Decisão recomendada

Priorizar um lançamento piloto com um curso e Pix com conferência manual. A plataforma tem amplitude funcional e evidências anteriores de boa qualidade técnica, mas falta comprovação integrada da operação comercial e educacional. Ampliar funcionalidades agora aumenta a superfície a homologar.

Esta análise combina leitura de rotas, configurações, serviços, testes, CI e relatórios anteriores. Não constitui nova auditoria visual, inspeção do banco remoto ou homologação da produção. Relatórios históricos são evidência datada, não garantia do estado publicado. Nenhuma alteração de dados, cobrança, publicação ou deploy foi feita.

## Mapa de maturidade

| Área | Estado e limite | Próxima entrega |
|---|---|---|
| Site institucional | Home, instituto, formações, biblioteca, estante, galeria e blog implementados. Há evidências anteriores de refinamento; conteúdo editorial e correspondência com ofertas precisam de revisão. | Catálogo piloto consistente em todas as páginas e conteúdo aprovado pela curadoria. |
| Autenticação | Cadastro, confirmação, recuperação, sessão e bloqueio implementados. Relatório anterior comprova login/logout administrativo; entrega real de e-mail e recuperação completa não foram homologadas. | Testar confirmação, reenvio, recuperação, troca de conta, expiração e bloqueio com contas isoladas. |
| Inscrição e Pix | Fluxo, envio de comprovante e gestão administrativa existem. Crédito bancário, duplicidade, rejeição e reembolso exigem prova operacional. | Uma inscrição completa com conferência financeira e liberação correta. |
| EAD | Currículo, aulas, materiais, progresso, avaliações e certificados existem. Navegação e testes unitários não comprovam conclusão integral. | Curso piloto consumido por aluno de teste até certificado verificável. |
| Administração | Relatório de lançamento registra navegação por 18 seções e upload. CRUD completo de cada módulo e permissões de tutor ainda precisam de matriz de homologação. | Criar, editar, publicar, arquivar e negar acessos indevidos em dados isolados. |
| Recursos interativos | Catálogo, experiências, históricos privados, edição e aprovação têm implementação e testes. | Homologar salvar/reabrir/excluir registros, isolamento entre usuários e efeitos de falhas de rede. |
| Dados e segurança | Supabase é o destino canônico, com endurecimento documentado. A migração Firebase permanece incompleta. | Reconciliar fontes por domínio e comprovar permissões contra acessos diretos. |
| Operação | CI, Sentry, endpoint de saúde e documentação presentes. Não foram comprovados nesta análise deploy, alertas recebidos nem restauração de backup. | Release rastreável, monitoramento acionável e recuperação ensaiada. |

## Achados confirmados no código

1. **Migração incompleta e analytics ainda legado.** `npm run audit:firebase` retorna `migration-pending`. `src/actions/analytics.ts` usa Firestore para métricas por aluno/curso e fallback de autenticação legado; `src/components/admin/analytics/AnalyticsDashboard.tsx` chama essas funções. Matrículas e progresso canônicos Supabase podem divergir das métricas antigas. Migrar essas consultas e comparar resultados com uma turma conhecida. Nem toda referência encontrada pela auditoria representa execução ativa: tipos, URLs de capas e configuração precisam ser classificados separadamente.

2. **Stripe não é modalidade pronta para lançamento.** O checkout lê/escreve Supabase, enquanto `src/app/api/billing/webhook/route.ts` ainda usa Firestore para eventos. Há proteção explícita para desabilitar cobrança real. Preservar esse bloqueio; só habilitar uma modalidade futura após migração do webhook, idempotência, concorrência e reconciliação financeira.

3. **Documentação de e-mail diverge da implementação encontrada.** O relatório de refinamento declara integração outbox/Resend. A busca em `src`, `scripts`, `supabase` e `.env.example` não localizou fila outbox ou chamada à API Resend; o reenvio encontrado usa `auth.resend` do Supabase. Isso não exclui SMTP externo configurado no provedor. Conferir versão/branch e configuração remota; distinguir e-mail de autenticação de avisos de inscrição recebida, pagamento em análise e matrícula efetivada.

4. **E2E ainda permite lacunas na jornada.** `e2e/enrollment-gate.spec.ts` está em `describe.fixme`; lifecycle pode pular quando não há curso aberto ou aprovação; conclusão depende de `E2E_COURSE_ID`. A CI pública é útil, mas não prova a operação autenticada. O workflow de homologação já prevê isolamento: provisionar fixtures explícitas e tornar obrigatório o percurso piloto sem skips.

5. **Despacho de eventos sem recuperação demonstrada.** `src/lib/events/bus.ts` grava evento em `audit_logs`, executa worker inline e captura falhas somente em log; a marcação de processado está comentada. O worker de progresso não verifica todos os erros devolvidos pelas consultas/atualização. Confirmar os chamadores ativos antes de alterar; se esse caminho participa do piloto, exigir erro observável, processamento idempotente e mecanismo de repetição. Não criar outra fonte de progresso concorrente com a implementação canônica.

6. **Capacidade de avaliações precisa permanecer explícita.** Código atual e relatório de lançamento indicam uma tentativa; retentativas e duração configurável não devem ser anunciadas como disponíveis. A necessidade pedagógica dessas opções deve ser decidida antes de sua implementação.

## Sequência de execução

### P0 — preparar e homologar o piloto

| Ordem | Entrega | Responsável sugerido | Critério de conclusão |
|---|---|---|---|
| 1 | Congelar escopo do curso piloto e conferir publicação, agenda, fuso, preço, parcelas, Pix e elegibilidade. | Produto/curadoria + desenvolvimento | Mesma oferta na home, catálogo, detalhe, cadastro e inscrição; curso fechado não aceita inscrição. |
| 2 | Disponibilizar homologação com Auth, banco e Storage separados e contas aluno/admin/tutor. | Desenvolvimento/operação | Conexões efetivas conferidas; fixtures reproduzíveis e nenhum dado operacional real usado. |
| 3 | Homologar autenticação e e-mails. Resolver divergência Resend/outbox. | Desenvolvimento/operação | Mensagens recebidas, links corretos, recuperação funcional e falhas/reenvios tratados sem duplicação indevida. |
| 4 | Homologar inscrição → comprovante → revisão → acesso. | Financeiro + desenvolvimento | Valor e favorecido corretos; comprovante não libera acesso sozinho; rejeição, duplicidade e confirmação têm trilha auditável. |
| 5 | Homologar aula → retomada → avaliação → correção → conclusão → certificado. | Pedagógico + desenvolvimento | Persistência após refresh e novo login; nota/progresso coerentes; certificado emitido uma vez e verificação pública com exposição mínima. |
| 6 | Testar permissões e privacidade dessa jornada. | Desenvolvimento | Aluno A não lê anexos/registros do B; bloqueado perde acesso; tutor/admin respeitam seus escopos; acesso direto por API/Storage também é negado. |
| 7 | Preparar release e retorno seguro. | Operação | CI no commit exato, variáveis verificadas, backup/restauração ensaiados, alertas recebidos e procedimento de rollback definido. |

### P1 — estabilizar antes de ampliar a turma

- Migrar analytics e identificar quais serviços legados continuam sendo chamados. Cada domínio exige reconciliação de registros e troca completa de leituras/escritas antes da remoção do Firebase.
- Automatizar o percurso piloto obrigatório, incluindo erros e repetição de ações; manter testes de RLS separados dos testes de regras Firestore.
- Revisar acessibilidade em celular, teclado, temas, zoom e movimento reduzido, com telas carregadas e uma sessão com leitor de tela. As capturas anteriores não certificam conformidade integral.
- Revisar conteúdo institucional e catálogo: datas vencidas, biografias, links de currículo, publicação de blog e categorias reais dos livros. Revalidar achados antigos antes de corrigi-los.
- Medir desempenho com build de produção nas rotas centrais e recursos 3D, em aparelho representativo. Decidir otimizações por latência, erros e volume real; índices sugeridos por relatório remoto antigo precisam de nova confirmação.

### P2 — expansão guiada pelo uso

- Automatização financeira e Stripe apenas com migração canônica e reconciliação concluídas.
- Retentativas e tempo de avaliação conforme política pedagógica aprovada.
- Integrações Google conforme uma necessidade concreta, com OAuth e permissões comprovados; cadastro de links não constitui integração operacional.
- Métricas de conversão, ativação, abandono, conclusão e suporte, com definições consistentes e consentimento quando necessário.

## Regra de liberação

Liberar o piloto quando uma jornada reproduzível cobre todas as etapas P0, sem skips no cenário obrigatório, sem divergências financeiras/de acesso e com recuperação operacional demonstrada. Ampliar a turma depois de observar estabilidade e atendimento no piloto. Estimativas de prazo dependem do ambiente de homologação, conteúdo e disponibilidade dos responsáveis financeiro/pedagógico.

## Evidências e validação

- Nesta execução: lint e TypeScript global passaram; 163 suítes e 833 testes unitários passaram, com uma suíte/sete testes ignorados. Auditoria Firebase confirmou migração pendente. A suíte de scripts não concluiu: conexão HTTP local recusada pelo ambiente com `EACCES 127.0.0.1`; não foi tratada como aprovação nem como defeito confirmado do produto. Logs em `reports/platform-analysis-unit.log` e `reports/platform-analysis-scripts.log`. Build e navegador não foram executados nesta rodada.
- Evidências anteriores: `docs/audits/2026-10-12-launch/README.md` registra 718 unitários, 43 testes de scripts, quatro testes públicos e build aprovado. O relatório de estante registra validações adicionais posteriores; esses números não substituem uma execução atual.
- Referências internas: `docs/architecture/CURRENT.md`, `docs/operations/release-validation.md`, `docs/operations/lancamento-pix-e-sessoes.md`, `.github/workflows/ci.yml` e relatórios de 12/10/2026.

Próxima tarefa concreta: preparar o ambiente e a matriz de homologação do curso piloto, resolvendo em conjunto inscrição/Pix, e-mails e conclusão EAD.
