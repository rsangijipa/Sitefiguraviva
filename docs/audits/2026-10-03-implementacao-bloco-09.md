# Implementação do bloco 09 — autorização e conteúdo privado de aulas

Data: 03/10/2026, horário de Manaus. Objetivo: proteger as entradas de conteúdo já existentes sem antecipar a conclusão pedagógica do EAD.

## Problemas confirmados

A ação getLessonContentAction lia aulas pelo repositório administrativo sem validar sessão ou matrícula. O guard assertCanAccessCourse estava marcado com use server e aceitava identidade e isAdmin do chamador; essa combinação era inadequada para uma ação pública. O manifesto da build do bloco 08 confirma o registro desse guard como ação. Na build atual ele não aparece entre as ações públicas. O diagnóstico combina código, manifesto e reprodução isolada, sem alegar exploração HTTP contra o site publicado.

No banco atual, a política de leitura de aulas permitia a qualquer matriculado ativo obter também aulas em rascunho. A leitura de módulos podia ser pública sem exigir publicação do módulo. Os dois papéis do navegador tinham concessões de gravação e TRUNCATE; mesmo quando RLS impedia uma gravação normal, TRUNCATE não recebe o filtro por linha. Havia 13 aulas, sete módulos e zero blocos explicitamente em rascunho na consulta inicial. Zero rascunhos não elimina a necessidade da proteção.

O SSR da página da aula serializava a estrutura administrativa completa. O helper de conteúdo filtrava a lista blocks, mas retornava também lesson com os blocos originais. Uma filtragem apenas da lista externa não protegia a resposta.

## Correções

Os helpers de sessão, acesso, autoria e conteúdo são server-only. O acesso passa a confirmar a sessão ativa, recusar identidade de outra pessoa e derivar a permissão administrativa do perfil persistido, ignorando o parâmetro antigo isAdmin. Curso precisa existir; curso publicado aberto ou fechado permite consumo com matrícula ativa/concluída. Prazo de acesso vale também para Pix e outras formas de pagamento; data inválida recusa acesso. Assinatura sem prazo continua recusada.

Administrador ativo pode visualizar conteúdo administrativo. Equipe explicitamente atribuída ao curso pode pré-visualizar seu conteúdo de curso publicado; o papel global de tutor não autoriza acesso a qualquer curso. A edição, revisão e publicação de módulo/aula exigem administrador ou tutor com atribuição naquele curso. O helper de gravação valida módulo, formato básico dos blocos e usa RPC com curso, módulo e aula no filtro.

A leitura de conteúdo exige acesso ao curso, módulo e aula publicados para aluno. Resposta e propriedades SSR usam uma projeção explícita, removem módulos/aulas em rascunho e filtram blocos tanto na lista externa quanto dentro da aula. A matrícula pendente mantém informação comercial com aviso de bloqueio, sem estrutura de aulas nem consulta de progresso. O catálogo comercial usa a ementa própria, separada do conteúdo privado.

A migração restringe metadados por perfil ativo, publicação, vínculo de equipe ou matrícula ativa/concluída não vencida. Policies restritivas impedem uma policy permissiva antiga de reabrir a leitura. RLS continua habilitada. O navegador perde gravações e recebe somente SELECT de colunas de metadados; blocks, video_url e legacy_payload não são concedidos. SELECT * é recusado. As colunas concedidas mantêm os relacionamentos necessários às políticas de materiais/progresso. Leitura/gravação completa continua no backend, por ações protegidas. A função nova usa SECURITY INVOKER, search_path fixo e não é executável por visitante.

## Verificação e aplicação

- 52 verificações SQL isoladas passaram: 32 regressões de materiais privados e 20 verificações adicionais de aulas, colunas, grants, perfis e execução do roteiro de leitura por papel.
- 463 testes Jest passaram em 105 suítes, sem falhas; sete testes e uma suíte permanecem ignorados.
- TypeScript e lint direcionado aos 17 arquivos de código/teste alterados passaram.
- Build final passou (exit 0, 269 segundos), com Next 15.5.25/WASM, credenciais fictícias e serviço Supabase local somente de leitura. A comparação de 1305 arquivos de código/conteúdo/testes com a cópia compilada não encontrou diferenças. Arquivos de ambiente foram excluídos intencionalmente.
- O manifesto contém as ações protegidas de aula e não registra os dez helpers internos de sessão, acesso e conteúdo conferidos. Isso não substitui a revisão dos demais 125 registros de ações do manifesto.

Migração 20261004031548_block_09_private_lesson_access.sql aplicada e registrada no projeto atual. O catálogo confirmou RLS, policies restritivas, metadados concedidos e colunas privadas/gravações diretas recusadas. Um teste somente de leitura sob authenticated confirmou acesso do administrador aos metadados, recusa de blocos/vídeos e bloqueio de uma identidade sem perfil. A transação foi desfeita. Não foram usados tokens nem sessões reais de alunos.

As 13 aulas e os sete módulos mantêm os mesmos resumos dos registros antes/depois; nenhuma alteração de conteúdo foi executada. inactive_profiles_with_active_enrollment permanece zero. Os 14 avisos de segurança anteriores do advisor continuam presentes; nenhum aviso novo no conjunto verificado.

Consulta versionada: supabase/tests/block_09_verification.sql. [Evidência sanitizada](2026-10-03-evidence/implementacao-bloco-09.json). Scripts, snapshots e logs privados: C:\Users\aless\.codex\visualizations\2026\10\03\01a10335-acef-7420-876c-e473e31d8446\validation-block-09.

As regras de matrícula pendente, vencida, conta inativa, tutor não vinculado e rascunhos foram ensaiadas com fixtures PostgreSQL e sessões simuladas. O teste remoto cobre permissões efetivas e leitura por papel, sem criar dados para simular esses estados no projeto atual.

## Limites e próximos passos

As correções de aplicação continuam locais; a migração no banco não atualiza uma ação de servidor do site já publicado. Publicar e homologar esta versão ainda é necessário para proteger essas entradas no ambiente do site. Clientes antigos que consultem SELECT * diretamente nas tabelas terão essa leitura recusada; os caminhos atuais inspecionados usam helpers de servidor e projeções próprias.

Não houve exclusão de aulas, módulos, alunos, arquivos, matrículas ou pagamentos. Os 205 candidatos à limpeza continuam preservados. O teste de build deste bloco cobre a cópia completa; o ensaio anterior sem candidatos continua sendo a evidência para a futura limpeza em lotes.

Este bloco não conclui avaliações, respostas de provas, correção, progresso pedagógico, certificados nem toda a revisão de ações privilegiadas. O helper legado current_user_can_access_course continua existindo para outros domínios; as novas policies de aulas/módulos usam a regra específica deste bloco. A varredura completa de segredos e a revogação de credenciais históricas continuam pendentes.

Próximo bloco: reprodução do release, separação dos executores de testes, scripts necessários versionáveis e CI com build nativa. Confirmar hospedagem e homologação antes da publicação. A build isolada local e os testes simulados não comprovam deploy, entrega de e-mails ou experiência completa no navegador com usuários reais.

Referências técnicas verificadas: [segurança de dados e ações do Next.js](https://nextjs.org/docs/app/guides/data-security) e [verificação de usuário no Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs). O índice changelog.md não pôde ser lido pelo navegador desta sessão; a documentação do tema foi consultada diretamente.
