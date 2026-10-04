# Implementação do bloco 07 — materiais privados e Storage

Data: 03/10/2026, horário de Manaus. Este bloco corrige a exposição de materiais identificada na auditoria; a conclusão do EAD continua posterior ao lançamento do site e das inscrições.

## Correções entregues

Novos PDFs de curso são enviados pelo servidor ao bucket privado `course-materials`, com limite de 10 MiB, MIME PDF e conferência do cabeçalho do arquivo. A rota exige administrador ativo e limita a requisição antes de interpretar o formulário. O caminho usa o curso e um UUID novo; o upload não sobrescreve arquivos. O formulário persiste bucket/caminho, sem URL pública ou URL temporária. A prévia local usa uma URL do navegador revogada ao fechar ou substituir o arquivo.

O servidor verifica se o objeto enviado existe e corresponde ao PDF antes de cadastrar o material. Visibilidade e módulo passaram a campos próprios do banco. O campo de publicação existente ganhou controles na tela. O banco verifica se módulo e aula pertencem ao curso e impede novas referências de arquivo por URL pública. Foram retiradas as opções de arquivo compactado que não tinham upload implementado; o fluxo oferece PDF e link HTTPS externo.

A mudança de visibilidade aguarda a gravação e recarrega os dados. Uma falha mantém a indicação anterior e informa o erro. Há controles para publicar/ocultar. Atualização e exclusão verificam simultaneamente ID do material e ID do curso, conferem erros do SDK e não anunciam sucesso quando nenhum registro é encontrado. A exclusão remove somente o registro do material: não usa um caminho enviado pelo navegador para apagar arquivos. Objetos eventualmente órfãos exigem inventário e limpeza separados.

O portal recebe os materiais no carregamento inicial e na atualização da consulta. A listagem entrega título, tipo, descrição e endereço interno de download, sem caminhos privados ou links externos brutos. O download usa a identidade da sessão verificada e consulta novamente a autorização no banco; o usuário não fornece o aluno a consultar. Somente então é emitida uma URL assinada de 60 segundos, com respostas sem cache e sem envio de Referer. Falhas de autorização ou arquivo ausente não produzem um link de Storage.

A regra exige perfil ativo. Alunos precisam de matrícula ativa ou concluída, acesso não expirado, curso publicado aberto/fechado e material publicado. Módulo/aula vinculados também precisam estar publicados. Materiais após conclusão exigem matrícula no estado concluído. Materiais de equipe exigem vínculo de autor/tutor/admin no curso; um tutor global sem vínculo não recebe acesso. Administrador ativo pode visualizar cursos e materiais em preparação. Isso não valida as regras pedagógicas de conclusão, que continuam em PED-01/EAD-04.

Avatares novos usam o bucket público separado `public-avatars`, com limite de 5 MiB e tipos de imagem. O upload de avatar de perfil mantém a sanitização de imagem existente. Fotos institucionais também deixam de gerar URLs públicas para o bucket privado `uploads`. Capas e documentos intencionalmente públicos continuam no fluxo público.

## Supabase aplicado e conferido

Migração `20261004014441_block_07_private_course_materials.sql` aplicada e registrada no projeto atual. O nome foi emitido em UTC; o relatório usa a data local de Manaus.

Foram criadas quatro funções `SECURITY INVOKER`: validação de referências por trigger, predicado de leitura, resolução individual e listagem autorizada. Resolução/listagem têm execução restrita ao backend. O predicado é executável por authenticated para RLS, limita a consulta à própria identidade e não devolve conteúdo/links. As novas funções não usam os privilégios do proprietário.

A política restritiva de materiais impede que uma política permissiva antiga ignore visibilidade/publicação. Políticas restritivas de Storage negam acesso direto ao novo bucket privado, inclusive pelo SDK administrativo no navegador, e limitam `uploads` a administradores ativos. Isso é necessário porque foi encontrada uma política permissiva antiga que autorizava leitura ampla a usuários autenticados. Novos envios/atualizações no caminho público de materiais do curso são bloqueados. Privilégios de TRUNCATE, REFERENCES e TRIGGER em lesson_materials foram retirados de anon/authenticated; RLS não substitui a retirada desses privilégios desnecessários.

A consulta `supabase/tests/block_07_verification.sql` confirmou: quatro campos novos, quatro funções com SECURITY INVOKER, cinco políticas restritivas previstas, bucket privado de 10 MiB e bucket de avatares público de 5 MiB. Permanecem zero materiais cadastrados e zero objetos nos dois buckets novos. Arquivos anteriores preservados: seis em course-assets, dois em uploads e dois em public-book-covers. Um administrador ativo, duas fichas, zero pedidos/eventos Pix e zero eventos administrativos; `inactive_profiles_with_active_enrollment = 0`. Os mesmos 14 avisos anteriores do advisor permanecem; nenhum foi declarado resolvido neste bloco.

## Verificação

- 32 verificações SQL passaram em PostgreSQL isolado PGlite: estados de matrícula, expiração, perfil inativo, publicação, vínculo de equipe, conclusão, referências cruzadas, URLs, RPCs e proteção contra políticas permissivas antigas.
- 408 testes Jest passaram em 100 suítes; sete testes e uma suíte permanecem ignorados. Os novos testes cobrem identidade da sessão, assinatura de download, falhas do SDK, tamanho/conteúdo do upload, referências privadas e atualização da visibilidade na tela.
- TypeScript e lint direcionado aos 24 arquivos alterados passaram.
- Build final passou (exit 0, 137 segundos). Comparação de 1.298 arquivos de código/conteúdo/testes com o snapshot compilado não encontrou diferença.

O laboratório usou credenciais fictícias, Supabase local somente de leitura e Next 15.5.25 com WASM. Os testes de comportamento usaram registros fictícios ou SDK simulado. No banco real foram aplicados esquema, buckets e permissões e feitas consultas agregadas. Não foram enviados arquivos reais, alteradas contas/matrículas/pagamentos, enviados e-mails ou removidos arquivos reais. As consultas de Storage listaram metadados; o conteúdo dos arquivos antigos não foi baixado.

Evidência sanitizada: [implementacao-bloco-07.json](2026-10-03-evidence/implementacao-bloco-07.json). Scripts, snapshots e logs privados: `C:\Users\aless\.codex\visualizations\2026\10\03\01a10335-acef-7420-876c-e473e31d8446\validation-block-07`.

A distinção entre acesso público/privado segue os [fundamentos de buckets do Supabase](https://supabase.com/docs/guides/storage/buckets/fundamentals) e o [controle de acesso por políticas](https://supabase.com/docs/guides/storage/security/access-control). O download usa a [API de URL assinada](https://supabase.com/docs/reference/javascript/storage-from-createsignedurl).

## Limites e próxima etapa

O frontend permanece local. A política aplicada já bloqueia o upload antigo de materiais para course-assets; é necessário publicar a versão corrigida para operar o novo fluxo. Homologar com contas de teste: administrador envia/publica PDF; aluno ativo baixa; matrícula pendente, cancelada, expirada ou conta desativada é negada; conclusão libera somente os materiais correspondentes; ocultação/revogação impede uma nova assinatura.

Uma URL assinada já emitida pode ser usada durante seus 60 segundos de validade. Um arquivo já baixado não pode ser recuperado por revogar a matrícula. Links HTTPS externos dependem da autorização do próprio provedor; para material restrito, usar o upload privado.

Não foram encontrados materiais cadastrados nem arquivos no prefixo courses/.../materials dos buckets anteriores. Existem três PDFs em course-assets cuja finalidade ainda precisa ser classificada e dois arquivos antigos em uploads. O bucket público inteiro não foi convertido nem seus arquivos removidos, porque também atende conteúdo público. SEC-03 permanece parcial até classificar esses PDFs, revisar consumidores históricos e homologar o fluxo publicado. Imagens inseridas no editor de aulas continuam no fluxo público; proteger todo conteúdo de aulas/mídia integra o trabalho futuro do EAD.

Os 205 candidatos a remoção continuam preservados. Este bloco não repetiu o experimento de exclusão nem concluiu que todos podem ser apagados. O experimento anterior passou na build, mas apresentou regressões nos testes.

A próxima prioridade permanece a homologação completa site → conta → ficha → Pix inicial → conferência → acesso, com valores comerciais, dados do recebedor, SMTP e redirecionamentos configurados pelo responsável. Também permanecem segredos históricos, dependências, contato/SEO e CI/recuperação. O EAD completo não está liberado para lançamento por este bloco.
