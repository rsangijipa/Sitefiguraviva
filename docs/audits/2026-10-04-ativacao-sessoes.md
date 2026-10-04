# Ativação da proteção de sessões

Após autorização explícita do proprietário, a migração `20261004163454_block_17_session_revocation.sql` foi aplicada ao projeto `jdxorryvmcvtqsddkpdm` e registrada no histórico com a mesma versão do arquivo local.

Verificação no banco: 42 políticas restritivas em tabelas públicas e uma em Storage; RPC com parâmetros disponível somente para service_role. O helper das políticas consulta apenas a identidade da própria requisição. As seis sessões ativas existentes continuam aceitas. Nenhum perfil real foi bloqueado, promovido ou alterado pelo teste.

Os seis testes de ciclo de sessão/permissões e os três testes de RLS autenticada passaram depois da instalação. As transações foram revertidas; não restaram usuários de teste. Sessões anteriores a bloqueio/reativação ou mudança de cargo foram recusadas, e uma sessão nova foi aceita.

O servidor passa a consultar a sessão por padrão, após verificar o token no Supabase Auth. Erro da RPC ou sessão inexistente/revogada nega acesso. `AUTH_SESSION_CHECK_MODE=profile` é uma exceção explícita para diagnóstico fora de Vercel Production. Na Vercel Production, a checagem é obrigatória mesmo com profile. Ausência da variável ou valor enforce habilita a verificação em qualquer ambiente. Não foram lidas nem modificadas credenciais ou variáveis da Vercel nesta operação.

A revisão cobre correção, clareza, arquitetura, segurança e desempenho: a checagem permanece no helper canônico; tabelas de consulta têm chaves primárias; a política usa subconsulta para evitar avaliação por linha; as permissões não ampliam acesso aos dados existentes. O teste dos guards usa um JWT fictício com session_id e também verifica negação de administrador ativo com sessão revogada.

Advisors: os avisos informativos de tabelas sem políticas desapareceram; continuam os avisos anteriores de search_path e proteção contra senhas vazadas. A função current_auth_session_is_active acrescenta avisos de SECURITY DEFINER executável por anon/authenticated: sua execução é intencional e limitada à própria identidade, sem parâmetros para consultar terceiros. A RPC parametrizada permanece inacessível a esses papéis.

- [Aviso de search_path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable).
- [Funções SECURITY DEFINER públicas](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable).
- [Funções SECURITY DEFINER autenticadas](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
- [Proteção de senhas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

Advisors de desempenho ainda indicam 33 FKs sem índice, 16 índices sem uso observado, 18 grupos de políticas permissivas e uma avaliação por linha na política antiga presence_authenticated_write. O gate de sessão novo não apareceu nesse último aviso. Esses apontamentos exigem análise de consultas e uso antes de alterações amplas; não foram criados/removidos índices indiscriminadamente nesta ativação. [Índices de FKs](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys), [avaliação RLS](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan), [índices sem uso](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index), [políticas permissivas](https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies).

AUTH-02 tem a correção principal implementada no servidor e no banco. Ainda exige jornada autenticada real e homologação de bloqueio/reativação, alteração de cargo e Storage. O impedimento de autorização/aplicação da migração foi resolvido. Os registros do bloco 17 descrevem o estado anterior à autorização; este documento registra a ativação posterior.
