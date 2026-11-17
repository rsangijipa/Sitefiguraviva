# Validação local e bloqueios do piloto — 16/11/2026

## Resultado

A base `3956074`, com a correção de `e2e/resources-smoke.spec.ts`, passou na validação local em cópia isolada, sem arquivos de credenciais. Foram usados Node 24.22.3, instalação limpa via `npm ci` e os serviços fictícios de `scripts/check-ci.mjs`.

| Verificação | Resultado |
| --- | --- |
| ESLint de src, tests e e2e | Aprovado |
| Testes de scripts | 57 aprovados, nenhum ignorado |
| Jest | 183 suítes aprovadas; 933 testes aprovados; 7 ignorados |
| TypeScript geral e de segurança | Aprovados |
| Marca | 421 arquivos, zero erros |
| Assets | 81 WebP, 5,77 MiB; três candidatos WAV verificados |
| Auditoria completa de dependências | Zero vulnerabilidades reportadas |
| Verificador de segredos do release | Nenhum padrão detectado; não comprova revogação histórica |
| Build de produção | Aprovada |
| Playwright público | Oito testes aprovados após a correção |

Os sete testes ignorados pertencem às regras legadas do Firestore e dependem do emulador. Houve avisos de `act` em testes React e avisos de módulos/cache durante a compilação, sem falha nesses checks.

## Correção do smoke

A primeira execução aprovou sete testes públicos e falhou, inclusive na repetição, ao procurar o texto antigo “Modo selecionado” no Igarapé. O redirecionamento de `/recursos/lago` estava correto.

O teste agora verifica a URL canônica, o estado acessível do botão de modo estático, a disponibilidade do toque na água e a alternância entre os modos. Também confirma que a entrada direta com `modo=estatico` começa estática. Nenhuma asserção foi transformada em skip.

Após a alteração, o lint do arquivo passou e build + smoke foram repetidos juntos com uma nova fixture: ambos aprovados, oito testes públicos passando em 11,7 segundos. A aplicação não foi alterada por essa correção.

Logs e evidências locais ficam em `reports/release-2026-11-16/`, ignorado pelo Git. Alterações posteriores de EAD no diretório compartilhado não integram esta validação.

## Bloqueios para liberar o piloto

| Próxima entrega | Evidência necessária para encerrar |
| --- | --- |
| Homologação isolada | Frontend, Auth, banco e Storage separados, contas de teste e fixtures explícitas |
| Cadastro e acesso por pagamento | Cadastro, confirmação de e-mail, conferência Pix, aprovação/rejeição e acesso direto testados; isolamento entre dois alunos |
| Conclusão do EAD | Retomada e progresso persistentes após novo login, avaliação e certificado conforme política pedagógica definida |
| Histórico dos recursos | Guardar, recuperar e excluir registros de teste com matrícula válida e regras operacionais verificadas |
| Curadoria e acessibilidade | Revisão docente dos materiais, escuta dos áudios, teclado, leitor de tela, zoom e movimento reduzido |
| Oferta e operação | Curso piloto, valores, calendário, suporte, e-mails recebidos, backup/restauração e rollback comprovados |
| Publicação rastreável | CI no commit final e verificação da versão efetivamente hospedada |

O cenário dedicado de conclusão pressupõe matrícula já ativa: não comprova cadastro, Pix ou aprovação. `e2e/enrollment-gate.spec.ts` ainda contém placeholders marcados como `fixme`.

Não houve escrita em serviços reais, alteração de conteúdo publicado ou deploy. Os resultados locais não atestam a configuração atual da hospedagem. Referências: [roteiro do release](../operations/release-validation.md), [piloto autenticado](2026-10-04-ead-performance/ead-pilot.md) e [decisões pedagógicas do EAD](2026-11-15-ead-moodle-comparacao.md).
