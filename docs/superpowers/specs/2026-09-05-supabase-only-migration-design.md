# Migração completa para Supabase

## Objetivo

Eliminar toda dependência ativa de Firebase do Figura Viva. Supabase passa a
ser a única plataforma de autenticação, banco de dados e armazenamento de
arquivos. A migração também corrige capas de cursos que ainda apontam para o
bucket Firebase desativado.

## Escopo

- Remover Firebase Auth e a ponte de tokens entre Supabase e Firebase.
- Substituir leituras e escritas Firestore por repositórios Supabase.
- Criar tabelas, migrações e políticas RLS para os domínios ainda exclusivos do
  Firestore: conteúdo público/CMS, blog, galeria, equipe, configurações,
  inscrições, notificações, eventos, certificados, avaliações, gamificação e
  métricas.
- Migrar uploads de imagens, PDFs e materiais para Supabase Storage.
- Criar bucket público de capas e publicar as três capas locais:
  `superviso-clnica-co-visar`, `III Formação Clínica em Gestalt-Terapia` e
  `experincia-atemporal`.
- Atualizar as três colunas de imagem dos cursos (`cover_image_url`,
  `image_url`, `thumbnail_url`) com URLs Supabase.
- Remover configurações, CSP, service worker, variáveis, pacotes, scripts,
  regras e testes Firebase.

## Arquitetura alvo

O cliente utiliza apenas `createSupabaseBrowserClient()` e as políticas RLS
para dados permitidos ao usuário autenticado. Rotas e server actions utilizam
o cliente de serviço somente para operações administrativas e para fluxos que
precisam de privilégios explícitos. Não haverá cliente Firebase, SDK de Admin
ou token de compatibilidade.

Os acessos de domínio ficam atrás de repositórios Supabase. Componentes e
páginas não acessam tabelas diretamente; os pontos que ainda fazem isso serão
encaminhados por hooks e ações já existentes ou equivalentes. Datas serão ISO
ou `timestamptz`; não serão expostos tipos `Timestamp` do Firebase.

Os arquivos são organizados em buckets por finalidade:

- `course-assets`: capas, thumbnails e materiais públicos de cursos;
- `uploads`: imagens e anexos geridos pela administração, com políticas por
  papel e caminhos prefixados por domínio.

As capas são públicas porque compõem páginas abertas. Materiais e documentos
privados continuam protegidos por políticas ou URLs assinadas, conforme o
fluxo atual exigir.

## Dados e segurança

As migrations são aditivas e idempotentes. Cada tabela tem RLS habilitada;
leitura pública só é liberada para conteúdo explicitamente publicado. Escritas
administrativas exigem o papel administrativo já usado pelo projeto. Fluxos
que recebem dados públicos — como inscrição — continuam com validação no
servidor e limitação de taxa.

A criação e o upload das capas usam a chave de serviço somente em um script
local de execução única. O script não imprime segredos, valida que os arquivos
existem, cria o bucket quando necessário, faz upload idempotente e atualiza
somente cursos que correspondam por ID ou slug. Ele retorna um relatório sem
credenciais, incluindo URLs e linhas atualizadas.

Não será tentada uma exportação de Firebase: o usuário confirmou que o
Supabase é a fonte atual. Dados exclusivamente presentes no Firebase não
estarão disponíveis após o corte.

## Ordem de execução

1. Inventariar importações e classificar cada fluxo Firebase por domínio.
2. Completar schema Supabase e RLS para os domínios faltantes.
3. Implementar repositórios e adaptar server actions, API routes e hooks.
4. Migrar uploads e executar a publicação das capas locais.
5. Remover autenticação em ponte, listeners, SDKs e configurações Firebase.
6. Remover dependências e artefatos legados somente após não haver imports
   ativos.
7. Executar testes de unidade, integração, tipo, lint, build e smoke tests de
   autenticação, cursos, inscrição, admin e uploads.

## Falhas e observabilidade

Erros Supabase terão mensagens tratadas para o usuário e detalhes estruturados
nos logs de servidor. URLs de imagem ausentes usam um placeholder local em vez
de tentar URLs Firebase. Falhas de upload não atualizam os registros de curso.
Os erros de extensões do navegador não são tratados pela aplicação.

## Critérios de aceite

- Nenhuma importação, variável de ambiente, host CSP ou dependência de runtime
  Firebase permanece no produto.
- Não há listener Firestore no navegador.
- Login, logout e autorização administrativa funcionam apenas por Supabase.
- Cursos, conteúdo público, portal e administração carregam sem erros de
  permissão Firebase.
- As três capas locais estão no Storage Supabase e aparecem nos cursos.
- Build, verificações de tipo, lint e testes relevantes passam.
