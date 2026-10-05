# Preparação da validação autenticada do EAD

## Estado atual

O ambiente de homologação ainda não existe, conforme informado nesta conversa. A jornada autenticada foi preparada, mas **não foi executada contra um backend real**. O teste anterior de conclusão procurava aulas arbitrárias e terminava verificando apenas o título da página de certificados; isso não comprovava emissão.

`e2e/completion-journey.spec.ts` agora verifica um curso explícito: troca da aula retomada, persistência após navegação completa, conclusão da última aula, progresso após recarregar e certificado do curso específico na listagem e no detalhe. Se o curso, a conta ou o conteúdo não atendem às precondições, o teste falha em vez de aceitar outro curso.

## Dados necessários no ambiente isolado

Prepare uma conta de aluno exclusiva para o piloto e uma conta administrativa para o setup existente. O aluno deve ter matrícula ativa no curso publicado. O curso precisa ter pelo menos duas aulas e satisfazer as regras reais de certificação.

Antes de cada execução:

- Todas as aulas, exceto a última, estão concluídas.
- A última aula é textual, contém conteúdo acessível e tem um título único no curso.
- A aula registrada como última acessada é outra aula, para comprovar a mudança da retomada.
- Ainda não existe certificado desse aluno para esse curso.
- Não há requisitos pendentes de avaliação/presença que impeçam a certificação.

O teste consome esse estado inicial. Não há retry automático: repetir sem restaurar os dados não comprovaria a transição. O workflow serializa suas próprias execuções; reserve a conta para esse teste e não rode outras jornadas mutáveis contra ela ao mesmo tempo.

## Configuração no GitHub

O workflow manual `.github/workflows/ead-pilot.yml` usa o ambiente `homologacao` já previsto pelo repositório. Depois que existir uma aplicação de staging conectada a um banco separado, configure:

| Tipo | Nome | Conteúdo |
| --- | --- | --- |
| Variável do ambiente | `E2E_BASE_URL` | Origem HTTPS de staging, sem caminho ou parâmetros |
| Variável do ambiente | `E2E_SUPABASE_PROJECT_REF` | Identificador do projeto de banco separado da produção |
| Variável do ambiente | `E2E_ISOLATED_ENVIRONMENT` | `true` |
| Variável do ambiente | `E2E_ALLOW_MUTATIONS` | `true` |
| Secret do ambiente | `E2E_STUDENT_EMAIL` / `E2E_STUDENT_PASSWORD` | Conta exclusiva do aluno piloto |
| Secret do ambiente | `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | Conta administrativa de teste |

Na execução manual, forneça ID e título exato do curso, mais ID e título exato da última aula. Esses valores são passados por variáveis de ambiente, não interpolados em comandos de shell.

O preflight recusa produção, dados incompletos e IDs com separadores de caminho ou parâmetros. A execução não publica traces nem storageState como artifacts. A suíte geral pula esse teste quando nenhum piloto explícito foi informado; o workflow dedicado exige todos os dados antes de abrir o navegador.

## Correção encontrada na preparação

O `CertificateIssueCard` inicializava o estado de emissão apenas na primeira renderização. Como o certificado existente é consultado depois pelo lobby, o retorno assíncrono podia manter o botão de emissão visível. O estado agora acompanha o certificado recebido e restringe a emissão local ao curso correspondente.

Validação local: lint dos arquivos alterados, typecheck, 43 testes de scripts, 8 testes focados em certificados (incluindo 3 novos casos do cartão), descoberta do teste pelo Playwright e parsing do workflow YAML. Esses checks não substituem a execução autenticada em staging.

## Cache no CI real

Os três CIs mais recentes consultados estavam aprovados. O [run 161](https://github.com/rsangijipa/Sitefiguraviva/actions/runs/37228468986) usa o workflow remoto sem etapa de cache de `.next/cache` e sem Knip. As alterações de performance permanecem locais; portanto, ainda não há cache hit ou tempo pós-alteração para comparar. Essa medição requer publicar as alterações e observar duas execuções compatíveis do workflow.

Este piloto verifica a matrícula previamente ativa, retomada, conclusão de texto e emissão do certificado. Criação/aprovação de matrícula, progresso de vídeo, avaliação e presença continuam fora da cobertura deste teste.
