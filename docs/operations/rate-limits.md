# Limites de requisições do lançamento

Implementação do bloco 08. As variáveis abaixo são do servidor; nunca usar prefixo NEXT_PUBLIC para segredos.

## Armazenamento compartilhado

Em produção, sem configuração Redis, os contadores usam a função `consume_request_rate_limit` e a tabela `request_rate_limits` do Supabase. A migração do bloco 08 deve estar aplicada. Essa opção usa a infraestrutura existente do projeto, sujeita à capacidade do banco. A janela é fixa e começa na primeira requisição; requisições posteriores não prolongam seu prazo.

Quando `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` estiverem presentes, o backend selecionado será Upstash, com janela deslizante. Configurar as duas variáveis em conjunto. Uma configuração incompleta, erro ou demora não troca automaticamente para outro contador nem libera a operação. Verificar disponibilidade e latência do backend escolhido.

`RATE_LIMIT_HASH_SECRET` é opcional, mas recomendado: segredo aleatório de pelo menos 32 caracteres, igual em todas as instâncias do mesmo ambiente. Sem ele, usa-se a chave privada Supabase já exigida pelo backend. Sua rotação altera as chaves dos contadores e reinicia a associação das janelas; coordenar a mudança entre instâncias. Usar projetos/Redis/segredos separados para homologação e produção. Não enviar esses valores em mensagens ou relatórios.

IPs, e-mails e identificadores não são armazenados em texto nos contadores. O servidor calcula HMAC SHA-256 incluindo operação e limites. Os contadores Supabase têm RLS, permissões somente para o backend e limpeza em lotes de até 50 registros expirados há mais de um dia. O TTL não é uma execução agendada: contadores antigos são removidos com novas requisições. Configurar uma rotina de manutenção se o ambiente ficar sem tráfego por longos períodos.

O tempo de espera da aplicação é limitado a três segundos. Falhas de proteção suspendem a operação; os endpoints de sincronização de sessão, ficha e uploads respondem 503 com indicação de nova tentativa. Não interpretar essa resposta como senha incorreta ou pagamento recebido. Um timeout pode ter consumido a tentativa no backend antes da resposta da aplicação; isso é conservador.

Em desenvolvimento/teste sem Redis configurado, o contador em memória é local e tem limite de entradas. A homologação publicada roda em modo produção e precisa do backend compartilhado.

## Identificação de origem

Na Vercel, a variável nativa `VERCEL=1` seleciona `x-vercel-forwarded-for`, com fallback para `x-forwarded-for`, conforme os headers produzidos pela plataforma. Não definir VERCEL manualmente em outro provedor para aceitar um header enviado pelo visitante.

Em outro provedor, definir `RATE_LIMIT_IP_HEADER` somente depois de confirmar qual header o proxy controla e sobrescreve. Valores aceitos: `x-real-ip`, `x-forwarded-for`, `cf-connecting-ip` ou `x-vercel-forwarded-for`. O proxy deve impedir que o cliente escolha esse valor, e o servidor de origem deve estar protegido contra acesso que contorne o proxy. Para um header com cadeia de IPs, utiliza-se o primeiro elemento validado.

Sem configuração de origem confiável, ou com IP inválido/ausente, a origem é `unknown`. Requisições assim compartilham um contador conservador. Conferir essa configuração antes de publicar: várias pessoas não devem aparecer como uma única origem. Proxies, redes compartilhadas e VPNs podem agrupar visitantes legítimos; conferir o comportamento com duas redes de teste.

## Recuperação, cadastro e escopo

A interface de recuperação solicita a ação de servidor. Essa ação valida e normaliza o e-mail, limita origem e destino, e usa o redirecionamento `NEXT_PUBLIC_BASE_URL` já definido para Auth. Destino limitado retorna uma confirmação genérica sem enviar novamente e sem indicar se a conta existe. Falhas de SMTP/configuração não são anunciadas como envio concluído.

O cadastro para curso, a sincronização de sessão, o envio de ficha/comprovante e as operações existentes que chamam `rateLimit` usam o mesmo helper compartilhado em produção. O login por senha e outras APIs públicas do Supabase Auth também dependem das proteções nativas do provedor. Conferir rate limits, entrega de e-mail, confirmação e eventual CAPTCHA no ambiente de homologação. Habilitar CAPTCHA exige integrar seu token ao formulário/servidor antes de ativar a exigência.

## Homologação necessária

1. Confirmar hospedagem, URL de homologação, backend selecionado e configuração de IP. Usar chaves próprias do ambiente de testes.
2. Em duas instâncias, repetir a mesma operação/identidade e confirmar um único limite agregado. Repetir com identidades/operações distintas e verificar isolamento.
3. Simular backend indisponível e confirmar ausência de cookie, conta criada, e-mail ou arquivo novo. Restabelecer o backend e respeitar a janela existente.
4. Testar recuperação com e-mail existente/inexistente, reenvio e SMTP real, com contas autorizadas de teste.
5. Confirmar que aluno ativo lê apenas sua ficha, tutor sem permissão não lê terceiros e perfil desativado perde leitura. Gravações diretas no navegador devem ser negadas, inclusive para administrador.

As verificações locais com SDK simulado e PostgreSQL isolado não demonstram uma corrida entre conexões independentes no ambiente publicado.

Referências: [headers de requisição Vercel](https://vercel.com/docs/headers/request-headers), [timeout e cache do Upstash](https://upstash.com/docs/redis/sdks/ratelimit-ts/features), [RLS e privilégios Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security).
