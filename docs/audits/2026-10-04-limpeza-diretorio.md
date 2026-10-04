# Limpeza do diretório e preparação de histórico único

Data: 04/10/2026. A solicitação autoriza retirar arquivos inúteis e substituir o histórico remoto por uma única versão limpa. Este documento registra a versão preparada; o recibo da publicação e os backups são preservados fora do repositório.

Foram retirados **199 arquivos**: 157 dos 205 candidatos de código originais, nove configurações de protótipos, 25 scripts antigos sem consumo pelos comandos atuais, sete relatórios/geradores antigos e um template de ambiente de aplicativo independente. As pastas antigas **.worktrees** e **.superpowers** foram arquivadas fora do diretório, incluindo os seus arquivos; não entram no total de 199. A cópia de cada arquivo retirado foi conferida por SHA-256 antes da exclusão.

Os **48 candidatos originais preservados** têm consumidores em rotas/testes ou alterações recentes e dependências desses arquivos. Retirar todos os 205 anteriormente quebrou 14 suítes; este lote conserva esses contratos. Testes, migrations, ferramentas de CI e documentação operacional são necessários ao projeto mesmo sem entrar no bundle. Os assets públicos foram conservados: referências calculadas ou dados do banco impedem tratar ausência em um import como prova de inutilidade.

## Verificação

A comparação congelada completa/enxuta passou build nativa e TypeScript nas duas versões: **114 entradas App Router** e **26 rotas pré-renderizadas**, com os mesmos conjuntos. Nas duas cópias: **472 testes Jest em 109 suítes aprovados**, sete testes e uma suíte de emulador ignorados. A cópia enxuta passou lint e 14 testes dos scripts.

A primeira validação consolidada detectou uma chamada antiga com a propriedade index em ResourcesSection, durante uma edição paralela. O ajuste já presente no workspace foi incorporado, sem alterar o trabalho dessa outra edição. A validação final voltou a passar lint, scripts, Jest, tipos, build e **cinco testes públicos de navegador**. Logs da falha foram preservados. O primeiro teste de navegador exigiu encerrar seu servidor isolado na limpeza; a execução final usa servidor explicitamente gerenciado.

Execução local em Windows/Node 26 e Chromium 153 instalado; CI usa Linux/Node 24 e o Chromium fixado pelo Playwright. Fixtures locais, nenhuma credencial operacional, nenhum pagamento real. Não é comprovação de SMTP, dados Pix, integração autenticada ou operação de produção, nem benchmark de desempenho. [Evidência estruturada](2026-10-03-evidence/cleanup-validation.json).

## Versão do GitHub

A nova base inclui as correções anteriores, as migrações e os scripts admitidos pela CI. Exclui arquivos de ambiente reais, caches, dependências instaladas, metadados locais de agentes, o gitlink de .worktrees e backups. README e DEPLOY foram atualizados para orientar a estrutura atual e distinguir Supabase de consumidores Firebase ainda existentes.

A substituição exige um commit sem pai, proteção contra alterações remotas concorrentes e retirada das branches/tags que apontam para o histórico anterior. O backup GitHub verificado contém 14 branches e 22 tags; existe também um backup do histórico local. Nenhum desses backups deve ser enviado ao GitHub. Uma atualização de main pode acionar publicação automática pela Vercel.

A substituição das branches/tags não revoga chaves e não garante apagar objetos de caches, pull requests ou forks. [Orientação oficial do GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository). As credenciais antigas continuam pendentes conforme [roteiro operacional](../operations/credenciais-e-vercel.md).

## Recuperação e próximos passos

Os arquivos retirados, checkouts antigos, manifests e bundles de recuperação estão no laboratório privado cleanup-2026-10-04, fora deste projeto. Antes de novos pushes, sincronizar a base local com o commit novo; não mesclar o histórico antigo. Alterações posteriores feitas por outra tarefa precisam ser preservadas e verificadas antes da publicação seguinte.

ORG-01: arquivo de checkout antigo/gitlink retirado da versão preparada. ORG-03: limpeza por lote executada; revisão do código preservado e consolidação de contratos ainda têm trabalho. Permanecem as pendências operacionais e comerciais do [relatório de progresso](2026-10-04-progresso-relatorio.md).
