# Cadastro central de mediadores

Na administração, abra **Cursos & Formações → Cadastro de mediadores**. Use **Novo mediador** para cadastrar nome, título profissional, foto e currículo. **Editar** atualiza o perfil em todos os cursos vinculados. A exclusão é bloqueada enquanto houver vínculos.

Ao criar ou editar um curso, selecione os nomes no campo **Selecionar mediadores**, em ordem alfabética portuguesa. A seleção aceita vários nomes e pode ser esvaziada. Salve o curso para confirmar os vínculos. No computador, use Ctrl/⌘ para selecionar vários nomes. O link de gerenciamento abre outra aba para preservar o formulário; **Atualizar lista** carrega novos cadastros.

## Dados e segurança

- `public.mediators` guarda cada perfil uma vez; nomes iguais, desconsiderando maiúsculas e espaços externos, são bloqueados.
- `public.course_mediators` guarda os vínculos com chaves estrangeiras. `details.mediatorIds` transporta somente referências; o trigger sincroniza os vínculos na mesma transação do curso.
- A migração `20261004191847_centralized_mediators.sql` foi aplicada ao projeto `jdxorryvmcvtqsddkpdm`. Três registros históricos foram consolidados em **dois perfis e três vínculos**, preservando os currículos. Fotos históricas foram referenciadas, sem copiar ou apagar objetos de Storage.
- Dados duplicados de mediadores foram retirados de `details` e `legacy_payload`. O mapa de permissões `team` permanece separado do cadastro público. Cadastrar ou vincular um mediador não cria uma conta nem concede permissões de tutor.
- As ações do servidor exigem administrador e validam os campos. RLS limita a leitura pública aos perfis vinculados a cursos publicados; sessões autenticadas também passam pelo bloqueio de revogação.
- Catálogo, página do curso, homepage e administração carregam os perfis centrais por relacionamento, sem uma consulta por mediador.

## Validação

Build de produção, lint e tipos passaram em uma cópia sem `.env` operacional. **624 testes unitários**, **32 testes de scripts** e **7 cenários públicos de navegador** passaram. Os 18 arquivos de código e testes desta implementação foram comparados com a cópia validada. Alterações de outras tarefas no diretório não fazem parte desta validação nem deste commit.

Os testes SQL em `supabase/tests/centralized_mediators.sql` passaram antes e depois da aplicação, sempre com rollback: **16 verificações** de reutilização, atualização compartilhada, vínculo inválido, exclusão vinculada, duplicação, remoção de seleção, visibilidade pública e acesso sem sessão válida. Nenhum perfil ou curso de teste permaneceu no banco.

Testes de interface verificam ordem alfabética, seleção múltipla, remoção de todos os vínculos e preservação da seleção quando a listagem falha. Testes das ações verificam autorização administrativa, validação, atualização do perfil e erros de duplicação/exclusão vinculada.

O advisor de segurança não trouxe novos alertas para as tabelas ou o trigger criados. Permanecem os alertas anteriores, registrados na auditoria de sessões: [search_path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable), [funções públicas](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [funções autenticadas](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) e [proteção de senhas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

A conferência com uma conta real de administrador em produção deve incluir upload de foto, seleção em um curso existente e visualização pública do currículo atualizado. Os testes automatizados de interface usam dados isolados e não substituem essa conferência operacional.
