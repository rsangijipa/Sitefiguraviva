# Como conferir as credenciais e preparar a Vercel

Atualizado em 04/10/2026. Você informou hospedagem na Vercel e domínio na UOL; homologação separada e banco recebedor ainda não estão confirmados. Este roteiro não executa rotação, exclusão ou publicação.

## 1. Identificar o projeto correto

O projeto atual é FiguraViva, ref jdxorryvmcvtqsddkpdm. A verificação direcionada do histórico encontrou credenciais associadas ao projeto antigo ponhrxfdfbzaronotelp. Uma segunda referência, svffadtbyuyodajbwpsa, apareceu em URLs históricas; isso sozinho não comprova exposição de credenciais desse segundo projeto.

A integração atual listou três projetos acessíveis e nenhum desses dois antigos. Ausência nessa lista não prova exclusão: podem pertencer a outra conta/organização ou estar fora do acesso concedido à integração.

Entre no [painel Supabase](https://supabase.com/dashboard), confira as organizações e procure o identificador antigo. Se não aparecer, confira a conta usada na criação ou peça ao antigo responsável uma comprovação de exclusão/revogação, sem valores de chaves. Não troque credenciais do projeto atual supondo que isso revoga as do antigo.

## 2. Se o projeto antigo ainda existe

Antes de alterar, registre quais aplicações dependem dele e preserve os dados necessários. Excluir um projeto com banco/arquivos é uma decisão separada; a presença de uma chave antiga no histórico não autoriza apagar dados.

Em Settings → API Keys, crie uma secret key nova e atualize os componentes de servidor que usam a chave comprometida. Confirme funcionamento e só então remova a secret key antiga. Para service_role/anon legadas, migre os consumidores e desative as chaves legadas nessa seção. Criar uma chave nova não revoga a antiga. A chave de servidor nunca deve usar prefixo NEXT_PUBLIC_. [Procedimento oficial de rotação](https://supabase.com/docs/guides/getting-started/api-keys#rotate-a-leaked-or-compromised-key).

Se o JWT secret também foi exposto, abra a seção JWT Signing Keys da configuração de Auth. Prepare uma nova chave de assinatura, faça a rotação e depois revogue a chave antiga, seguindo as esperas e avisos do painel. Rotação sozinha mantém tokens antigos válidos até a revogação. Para revogar o segredo legado, primeiro desative anon/service_role legadas. Essa mudança pode invalidar sessões e precisa ser coordenada com os consumidores. [Chaves de assinatura Supabase](https://supabase.com/docs/guides/auth/signing-keys).

Se a senha Postgres estava exposta, altere-a em Database → Settings e atualize as conexões diretas/pooler, ferramentas e automações que a usam. Isso é separado da rotação da API. [Senha do banco](https://supabase.com/docs/guides/troubleshooting/fatal-password-authentication-failed).

Guarde somente confirmação de projeto, data, categorias de credenciais revogadas e resultado dos testes. Não cole senhas/tokens neste chat nem no repositório. Depois da revogação, a limpeza do histórico Git deve ser coordenada com os colaboradores; apagar o arquivo atual não remove as versões antigas. A investigação feita aqui foi direcionada, não uma varredura completa de segredos.

## 3. Conferir a Vercel

Abra o projeto do site e confira o deployment de Production, a origem Git, o commit e o domínio associado. Em Settings → Environment Variables, separe Production de Preview/Development. Alterações de variáveis passam a valer nos novos deployments; publicar novamente deve seguir o checklist do release. [Variáveis na Vercel](https://vercel.com/docs/environment-variables).

Um Preview só serve como homologação se também usa Auth, banco, Storage e contas separados. Para este repositório, use NEXT_PUBLIC_BASE_URL com a origem HTTPS do ambiente; produção deve apontar para https://www.institutofiguraviva.com.br. Não copie credenciais de produção para permitir testes que gravam dados em Preview. O fluxo autenticado de CI exige isolamento declarado e projeto Supabase separado; confirme a conexão efetiva antes de habilitá-lo.

O domínio registrado na UOL não muda a configuração das chaves Supabase. Não há necessidade de alterar DNS para revogar credenciais. SMTP, destinatários permitidos e dados bancários/Pix continuam dependendo de configuração e teste reais.

## Bloqueio no código — bloco 13

A build verifica as variáveis públicas antes da compilação. Os clientes e os scripts de manutenção revisados recusam URLs/chaves dos dois projetos históricos e a combinação de URL/chave legada de projetos diferentes. Chaves sb_secret_ e JWTs service_role são recusados no navegador; o cliente privilegiado não aceita chave pública como substituta. Erros não mostram os valores das chaves.

O navegador aceita NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY. No servidor, SUPABASE_SECRET_KEY tem precedência sobre SUPABASE_SERVICE_ROLE_KEY. As duas aliases configuradas são verificadas na build: retire valores antigos não utilizados em vez de deixá-los ao lado da chave nova. RATE_LIMIT_HASH_SECRET pode manter a identidade dos contadores durante rotação; sua mudança também precisa ser coordenada. Não há necessidade de trocar as chaves atuais somente para usar estas proteções.

Este bloqueio reconhece os formatos conhecidos e verifica coerência de configuração. A API Supabase ainda valida a credencial; o código não verifica assinaturas JWT nem comprova revogação. O histórico principal foi substituído e seu backup privado preservado no bloco 12; cópias, PRs, forks e caches anteriores podem continuar existindo.

## Confirmação que falta

Informar apenas: projeto antigo encontrado/excluído; categorias de credenciais revogadas e data; endereço de homologação com banco separado; banco recebedor Pix. Não é necessário enviar valores secretos.

### Origem pública e atendimento — bloco 14

Metadados, JSON-LD, sitemap, robots e cartão social usam NEXT_PUBLIC_BASE_URL, com fallback para https://www.institutofiguraviva.com.br quando ausente. Configure somente uma origem HTTPS, sem caminho, usuário, senha, parâmetros ou fragmentos; HTTP é permitido apenas em loopback. O redirecionamento de Auth continua exigindo sua configuração explícita. O e-mail confirmado pelo proprietário é contato@figuraviva.com.br, compartilhado pelo rodapé e pelo suporte do portal. Preview/homologação ainda precisam de política de indexação e verificação separada; configuração no código não comprova ajuste na Vercel.
