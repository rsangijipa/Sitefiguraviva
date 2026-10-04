# Revisão da auditoria e plano de implementação — Instituto Figura Viva

> Bloco 11: dependências corrigidas e JSON-LD protegido; auditoria de produção de 17 entradas/sete altas para oito moderadas/nenhuma alta. Instalação isolada, testes e build do snapshot passaram; alterações paralelas posteriores requerem validação consolidada; Vercel/Node 24/Linux e homologação pendentes. Consulte [o relatório do bloco 11](2026-10-04-implementacao-bloco-11.md) e [a comparação dos 45 itens](2026-10-04-progresso-relatorio.md).

> Bloco 10: runners separados, CI sem credenciais, scripts necessários admitidos no versionamento e homologação autenticada manual configurados. Testes locais aprovados; execução no GitHub, ambiente separado e publicação pendentes. Consulte [o relatório do bloco 10](2026-10-04-implementacao-bloco-10.md).

> Bloco 09: autorização de aulas derivada da sessão, edição por equipe do curso, filtragem de rascunhos no conteúdo/SSR e colunas privadas protegidas. Migração aplicada e leitura por papel verificada no Supabase; frontend local e homologação pendentes. Consulte [o relatório do bloco 09](2026-10-03-implementacao-bloco-09.md).

> Bloco 08: fichas com leitura própria/administrativa ativa e gravações pelo servidor; limite compartilhado em produção e recuperação de senha protegida implementados. Migração aplicada e ensaio do contador desfeito no Supabase; frontend local, hospedagem e homologação pendentes. Consulte [o relatório do bloco 08](2026-10-03-implementacao-bloco-08.md).

> Bloco 07: materiais privados, download autorizado, visibilidade/publicação persistidas e avatares em bucket separado implementados. Migração aplicada e verificada no Supabase; frontend local e PDFs históricos pendentes de classificação/homologação. Consulte [o relatório do bloco 07](2026-10-03-implementacao-bloco-07.md).

> Bloco 06: governança de contas, preservação de histórico, conversão canônica de ficha para Pix pendente e primeiro acesso implementados. Migração aplicada e permissões conferidas no Supabase; frontend, SMTP e jornada completa ainda exigem publicação/homologação. Consulte [o relatório do bloco 06](2026-10-03-implementacao-bloco-06.md).

> Bloco 05: publicação da oferta separada de inscrição/EAD, detalhe por ID/slug, campos comerciais persistidos e cache inicial corrigido. Migração aplicada ao Supabase; publicação e homologação ainda pendentes. Consulte [o relatório do bloco 05](2026-10-03-implementacao-bloco-05.md).

> Bloco 04: inscrição e Pix de matrícula ou primeira parcela implementados no código local; migração aplicada e permissões conferidas no Supabase. Publicação, configuração dos valores e homologação bancária permanecem pendentes. Consulte [o relatório do bloco 04](2026-10-03-implementacao-bloco-04.md).

> Bloco 03 implementado no código local: cadastro com confirmação de e-mail e recuperação de senha. Build, tipos, lint e 295 testes passaram. SMTP, URLs permitidas, homologação e publicação permanecem pendentes. Consulte [o relatório do bloco 03](2026-10-03-implementacao-bloco-03.md).

> Atualização de implementação (03/10/2026): os blocos 01 e 02 começaram a ser executados. Três migrações foram aplicadas e verificadas no Supabase; as correções de autenticação permanecem no código local, aguardando publicação. Consulte [o relatório de implementação](2026-10-03-implementacao-blocos-01-02.md) e o backlog atualizado. As seções abaixo preservam a análise feita antes dessas correções.

**Data:** 03/10/2026. **Objetivo:** lançar primeiro o site e as inscrições com Pix conferido manualmente; concluir o EAD depois. Este documento revisa o relatório anterior com a segunda opinião, novas inspeções e um experimento real de build. O diagnóstico abaixo preserva a revisão original; os avisos de atualização acima e os relatórios por bloco registram as correções entregues.

## 1. Decisões e resultados principais

1. A segunda opinião acrescentou riscos relevantes: credenciais no histórico Git, permissões de RPCs privilegiadas e materiais privados enviados para um bucket público. Esses itens antecedem a organização estética do diretório.
2. **As builds completa e sem os 205 arquivos candidatos passaram**, em duas cópias isoladas do workspace. Typecheck também passou nas duas e os manifestos de rotas coincidiram. Porém, retirar os 205 arquivos causou **14 novas falhas de suítes Jest**. Não excluir a lista inteira.
3. O resultado informado `inactive_profiles_with_active_enrollment = 0` indica ausência dessa combinação nos registros consultados. **Não comprova que o servidor negue acesso a um perfil desativado.** O problema de autorização continua sujeito a teste de comportamento.
4. O plugin Supabase falhou na instalação, conforme informado. Nenhuma conexão administrativa com o banco remoto foi estabelecida nesta análise. Migrações, chamadas do aplicativo e SQL foram examinados localmente; ACLs, políticas e buckets efetivamente implantados permanecem pendentes.
5. Para Pix manual, a geração local do QR é suficiente e gratuita como software. O projeto já possui `qrcode` e um gerador BR Code. O maior trabalho é persistir a cobrança, conferir o recebimento e aprovar a matrícula com consistência.

**Parecer:** manter o lançamento dividido em duas liberações: site/ofertas confiáveis e, em seguida, inscrição/cadastro/Pix manual homologados. Segurança daquilo que já está exposto deve ser corrigida antes dessas liberações, mesmo que pertença ao EAD. Não ampliar recursos complementares enquanto o percurso comercial não estiver aprovado.

## 2. Base examinada e limites

Base local: `C:\Users\aless\Downloads\Sitefiguraviva`, HEAD `6f29970766eeccad643680d07422bc33ec8a7b31`, com alterações locais preexistentes. Esse HEAD corresponde ao main verificado anteriormente; o workspace modificado não equivale ao commit e nenhum dos dois prova qual versão está publicada. Antes de corrigir, identificar commit e configuração do deploy.

A segunda opinião foi lida integralmente em `Texto colado.txt`. Foram confrontados seus principais pontos com o código atual, migrações e histórico Git disponível. A investigação do histórico foi direcionada aos caminhos alegados, com resultados redigidos sem valores de segredos; **não foi uma varredura completa com Gitleaks/TruffleHog**. Nenhuma chave encontrada foi usada para acessar serviços.

As reproduções adicionais usaram serviços simulados. O teste público de consentimento apenas navegou e clicou em aceitar/recusar cookies, sem cadastro, inscrição ou pagamento. Não houve alteração de políticas, dados, visibilidade do GitHub, credenciais ou deploy. Os 205 arquivos originais foram preservados e comparados por hash com a cópia completa.

Evidências novas, snapshots e ferramentas de reprodução ficam fora do repositório, em:

`C:\Users\aless\.codex\visualizations\2026\10\03\01a10335-acef-7420-876c-e473e31d8446\build-comparison`

O [relatório original](<C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-03-relatorio-lancamento.md>) continua sendo a base dos achados de backend, frontend, administração e EAD. Este documento e o [backlog revisado](<C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-03-backlog-revisado.csv>) atualizam suas prioridades.

## 3. Avaliação da segunda opinião

| Ponto | Verificação e ajuste | Prioridade |
|---|---|---|
| Credenciais no histórico | Confirmadas em versões históricas de `.env` e `next-platform/populate-supabase.mjs`: senha/URLs Postgres, JWT secret, service role e chave secreta. Projeto antigo com prefixo `ponh…`, distinto do atual `jdxorry…`. Validade e revogação não verificadas. A expiração nominal lida do JWT é dezembro de **2035**, não 2036; esse metadado não prova acesso ativo. | SEC-01, P0 até esclarecer revogação/projeto antigo |
| RPCs `SECURITY DEFINER` | Três migrações revogam apenas de `PUBLIC`, concedem a `service_role` e não verificam identidade internamente. Concessões específicas a `anon`/`authenticated` podem sobreviver. A função de XP já revoga dos três papéis. O risco é forte, mas permissões reais precisam ser consultadas. `SECURITY DEFINER` usa privilégios do **proprietário**, que não é necessariamente superusuário. | SEC-02, verificar imediatamente; P0 se executáveis por visitante/aluno |
| Progresso manipulável | As políticas permitem escrita própria conforme matrícula/publicação, sem demonstrar cumprimento pedagógico. O problema é distinto de nota de prova. Progresso baseado em interação do navegador também não prova presença; a política acadêmica precisa definir o que constitui conclusão válida. | PED-01, antes de emitir certificados; corrigir já se emissão estiver exposta |
| Materiais privados em Storage público | Confirmado caminho concreto: `CourseMaterialsTab` oferece `enrolled`, `after_completion` e `team_only`; `FileUpload` usa `uploadAdminAsset`, cujo padrão é `course-assets` com URL pública. Migrações declaram esse bucket público. A etiqueta de visibilidade no banco não protege o arquivo. `BlockEditor` usa esse upload para imagens; não demonstrou upload direto de PDF ali, mas a aba de materiais aceita arquivos. | SEC-03, P1 imediato para materiais existentes |
| `uploads` privado com `getPublicUrl` | Contradição confirmada entre migração e serviço. `getPublicUrl` monta uma string; não converte um objeto privado em público. Estado remoto do bucket e consumidores precisam ser verificados. | SEC-03 |
| Cadastro e proteção contra abuso | `auth.admin.createUser` com confirmação explícita não recebe as garantias do fluxo público de signup. Ativar confirmação no dashboard não corrige esse código. Rate limit em memória protege uma instância, mas não produz um limite global em serverless. Upstash e configurações reais de produção não foram inspecionados. | AUTH-01 e SEC-05 |
| Administração por domínio de e-mail | Procede: verificar posse do endereço não substitui provisionamento de papéis. Remover promoção automática por lista de e-mails e usar perfil/papel administrado com auditoria. Titularidade do domínio adicional não foi consultada. | AUTH-01, P0 |
| Pix estático e conciliação | Procede a necessidade de valor e de não depender exclusivamente de TXID no extrato. Não se deve presumir que todos os bancos o exibam. Entretanto, substituir agora por PSP automático é uma decisão comercial adicional; preserva-se a escolha do responsável por conferência manual. Não adotar centavos arbitrários por aluno sem decisão comercial expressa. | ENR-01/02/03 e PIX-01 |
| Oferta de pós-graduação e contrato | Exige validação institucional/acadêmica antes da oferta. A afirmação de que apenas IES podem ofertar é ampla demais: há categorias específicas previstas nas normas. Não foi demonstrada irregularidade do instituto. CPF e requisitos profissionais devem ser justificados por oferta, finalidade fiscal/contratual e regras acadêmicas. | COM-01, antes da publicação/contratação pertinente |
| LGPD e analytics | Há base contratual prevista na LGPD; um checkbox genérico de consentimento não resolve contrato, transparência e marketing. No teste público, não apareceram requests GA antes da escolha nem após recusa; também não apareceram após aceite, portanto a configuração ativa de GA não foi demonstrada. Código condiciona carregamento a ID e consentimento concedido. | COM-01 e PRIV-01 |
| SafeHtml e SEO | Sanitização no cliente existe e deve ser preservada. O conteúdo inicia vazio no SSR e é preenchido após montagem. Melhorar renderização sanitizada no servidor sem reintroduzir HTML inseguro. | SEO-01, P2 |
| JSON-LD / XSS armazenado | Confirmado componente sem escape de `<`. Porém seu único consumidor encontrado é o layout raiz com dados literais: não foi encontrado o fluxo painel → campo SEO → JSON-LD descrito pela segunda opinião. Há fragilidade no componente, **não comprovação desse XSS armazenado atual**. Escapar `<` é correção pequena. | SEC-06, P2; antecipar se receber conteúdo editável |
| CSP `unsafe-inline` | Reduz proteção para determinadas injeções; não torna toda a CSP inútil. Planejar nonce/compatibilidade com Next, scripts e integrações, com teste de navegação e mídia. | SEC-06 / OPS-03 |
| WhatsApp, canonical, tenant e excesso de escopo | Há fontes de telefone divergentes e domínios incompatíveis. Middleware produz `x-tenant-id` na **resposta**, sem consumidor encontrado; não demonstra isolamento real de tenants. Tratar como resíduo arquitetural. Congelar marketplace/gamificação/3D novos, sem remover recursos utilizados por suposição. | OPS-06, SITE-05 e ORG-03 |
| HSTS / preload | Configuração envia `includeSubDomains; preload`. O token no header não demonstra inclusão efetiva na lista de preload dos navegadores. Definir domínio oficial e compatibilidade HTTPS dos subdomínios antes de uma submissão à lista; não desativar HTTPS por conta dessa observação. | SITE-05 / infraestrutura |
| Titularidade e continuidade | Registrar responsáveis, recuperação de contas e backups. Conta pessoal e texto de licença não provam por si só vulnerabilidade ou irregularidade. Alterações locais precisam de preservação privada e versionamento revisado; não publicar evidências exploráveis ou segredos. | OPS-05 |

A documentação do Supabase distingue privilégios de execução e funções com privilégios do proprietário; é a referência para revisar os grants. A mitigação deve preservar chamadas legítimas feitas com service role: uma checagem baseada somente em `auth.uid()` pode rejeitar chamadas administrativas de servidor sem identidade de usuário no JWT. [Supabase: Database Functions](https://supabase.com/docs/guides/database/functions).

Além da segunda opinião, foi reproduzido um problema no login: um POST com `Origin` externo e `Content-Type: text/plain` chegou à criação de cookie quando o verificador de token foi simulado como válido. Isso demonstra ausência de rejeição desses atributos no handler, **não exploração no site publicado**. Revisar proteção contra login CSRF, origem confiável e formato JSON, preservando a verificação real de token já existente. `SameSite=Lax` não substitui essa validação na criação de uma nova sessão. Item SEC-04, P1.

## 4. Reconciliação com a auditoria de setembro

| Achado de setembro | Estado no código atual |
|---|---|
| Health expondo detalhes técnicos | Endpoint legado com nome Firebase retorna verificação Supabase resumida. Não se repete a alegação anterior de resposta com detalhes de conta. |
| HTML editorial sem sanitização | `SafeHtml` sanitiza via DOMPurify. Pendência atual: SSR/SEO e conservação dessa proteção. |
| Perfil alterável para administrador pelo próprio usuário | Trigger anti-escalonamento existe. Ainda há caminho privilegiado de cadastro/promoção por e-mail que exige correção própria. |
| Pix simulado/random | Gerador BR Code/CRC real existe. O problema atual é a ordem e aprovação, valor, referência, recuperação e confirmação incorreta. |
| Proteção de notas | UPDATE tem proteção adicional; a preocupação atual inclui INSERT e DTO que entrega gabarito. |
| Progresso e publicação | Políticas já exigem vínculo/acesso/publicação; não resolvem cumprimento acadêmico nem concorrência/certificado. |
| Migração de identidade | Avançou para Supabase, mas persistem caminhos Firebase em avaliações/Stripe/gamificação e exigências de configuração Firebase. |
| WhatsApp e domínio | Divergências permanecem. |

Os relatórios analisam estados diferentes e têm escopos distintos. Contagens e testes de setembro não devem ser comparados como se fossem a mesma amostra. É possível reconhecer as correções sem concluir que a migração esteja terminada.

## 5. Experimento real sem os arquivos candidatos

Foram criadas duas cópias do estado local, sem `.env`, usando a mesma instalação de dependências. A cópia reduzida omitiu exatamente os 205 candidatos; todos permaneceram na origem e na cópia completa. Compilação usou o pacote oficial `@next/swc-wasm-nodejs@15.5.25` para contornar o bloqueio local do binário nativo, sem alterar a política de segurança do Windows. Essa adaptação pertence ao laboratório, não à configuração do produto.

As variáveis de serviços foram substituídas por valores fictícios. Supabase foi representado por um servidor local somente GET/HEAD que retorna dados vazios; Firebase não teve emulador em execução e Stripe não recebeu chamadas de pagamento. A primeira tentativa compilou e falhou na coleta por faltarem variáveis públicas Firebase na fixture. Adicionadas apenas à fixture, as duas builds completas terminaram. Isso também evidencia o acoplamento residual de configuração Firebase.

| Verificação | Cópia completa | Sem os 205 arquivos |
|---|---:|---:|
| Typecheck separado | Exit 0, 34 s | Exit 0, 29 s |
| Next build completa | Exit 0, 160 s | Exit 0, 149 s |
| Entradas do manifesto App Router | 109 | 109, conjunto idêntico |
| Rotas pré-renderizadas da fixture | 24 | 24, conjunto idêntico |
| First Load JS compartilhado informado pelo Next | 166 kB | 166 kB |
| Suítes Jest de aplicação aprovadas | 77 | 63 |
| Suítes Jest de aplicação com falha | 0 | 14 |
| Suíte ignorada, sem emulador Firestore | 1 | 1 |
| Asserções aprovadas / falhas / ignoradas | 270 / 0 / 7 | 234 / 0 / 7 |

**A queda no número de asserções não é melhora:** arquivos ausentes impediram suítes de carregarem. Houve 14 suítes que passavam e passaram a falhar, sobretudo por módulos ausentes. Na comparação final, todas as suítes de aplicação efetivamente executadas passaram na cópia completa. O grafo iniciado nos testes alcança **21 dos candidatos**, direta ou indiretamente. Os outros 184 continuam candidatos, não uma lista autorizada para exclusão automática.

Jest exigiu uma adaptação de resolução dos aliases relativos emitidos pelo WASM, restrita a imports de arquivos do projeto. A configuração e os mocks originais de `next/jest` foram conservados na comparação final. O comando amplo também encontrou conflito entre testes de `node:test` em scripts e Jest; esse resultado está registrado separadamente. Testes Playwright e scripts foram excluídos da comparação Jest de aplicação. Não foram executados testes reais de RLS nem jornada autenticada de matrícula.

O código omitido soma aproximadamente **1,49 MB de fonte**. O JS compartilhado exibido permaneceu igual: a build já exclui grande parte de código sem consumidores. Os tempos são observações de duas execuções, sem benchmark controlado; não demonstram ganho confiável de desempenho.

Conclusão operacional: remover por pequenos lotes, após decidir se cada módulo é legado testado, recurso ainda planejado ou código realmente descartável. Quando a decisão for aposentar uma funcionalidade, revisar seus testes e contratos explicitamente. Não apagar os testes apenas para fazer a CI ficar verde.

O [resultado detalhado da comparação](<C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-03-comparacao-build.md>) relaciona as 14 regressões e os arquivos de evidência.

## 6. Supabase: o que falta verificar

A consulta preparada em [2026-10-03-supabase-resultado-unico.sql](<C:/Users/aless/Downloads/Sitefiguraviva/docs/audits/2026-10-03-supabase-resultado-unico.sql>) retorna **uma única célula JSON**. Executar no SQL Editor do projeto atual e devolver a coluna `audit_result` inteira permite analisar, sem chaves nem dados pessoais:

- Definição e proprietário das RPCs, atributo de superusuário do proprietário e privilégios efetivos de `anon`, `authenticated` e `service_role`.
- RLS, políticas, índices únicos, triggers de perfis/notas/progresso, buckets e políticas Storage.
- A contagem já informada, reunida com os demais resultados.

O SQL é leitura de catálogo/agregado; não chama RPCs de escrita. Seus resultados descrevem o banco implantado. Não abrangem todas as configurações Auth, variáveis da hospedagem, Edge Functions, logs ou funções não incluídas na seleção. Essas verificações ficam como tarefas específicas do plano. Não testar uma função que sobrescreve aula em produção para comprovar risco: consultar grants e testar os papéis em homologação.

## 7. Plano de implementação, da urgência maior para a menor

### Etapa −1 — conter exposição e preservar o trabalho

**Responsáveis:** proprietário dos serviços + backend/segurança. **IDs:** SEC-01, SEC-02, OPS-05.

1. Preservar o workspace e seu diff em cópia privada, identificando alterações úteis, commit de deploy e responsáveis por GitHub, Supabase, hospedagem, domínio e conta Pix. Não fazer commit/push indiscriminado do diretório atual.
2. Verificar se o projeto antigo existe e se as credenciais expostas continuam válidas. Se existir, revogar/rotacionar as credenciais afetadas e dependentes, testar serviços legítimos e verificar histórico de acesso/dados. Se houver incidente com dados pessoais, encaminhar avaliação ao responsável de segurança/privacidade. Se excluído ou já rotacionado, registrar a evidência que encerra esse risco.
3. Executar varredura completa e redigida de segredos no histórico e no estado atual. Separar artefatos internos de documentação publicável. Restringir visibilidade do repositório pode reduzir exposição futura, mas não revoga credenciais nem apaga clones. Reescrita do histórico somente após rotação e com coordenação de colaboradores.
4. Consultar privilégios efetivos das RPCs. Se expostas, corrigir grants a `PUBLIC`, `anon` e `authenticated`, revisar defaults para funções futuras e autorização interna compatível com o backend. Versionar a migração. Aplicação real fica sujeita à revisão da mudança concreta.

**Conclusão:** estado das credenciais esclarecido; acessos privilegiados bloqueados para visitante/aluno; servidor autorizado segue funcionando; trabalho útil preservado e release rastreável. Essa etapa não depende de o plugin instalar: o proprietário pode consultar o catálogo pelo SQL Editor.

### Etapa 0 — estabelecer base segura e ambiente reproduzível

**Responsáveis:** backend/banco + infraestrutura/QA. **IDs:** AUTH-01/02/03, DATA-01/02, OPS-01/02/03, ORG-02, SEC-03/04/05, QA-01; EAD-01/03 quando já expostos.

1. Fixar Supabase como identidade canônica para o escopo de lançamento. Remover elevação automática por e-mail; criar/proteger RBAC administrativo, último administrador e mudanças de papel. Exigir perfil ativo nos gates e nas políticas relevantes. Separar helpers internos `server-only` de ações públicas com autorização explícita.
2. Ajustar cadastro, confirmação/posse de e-mail e sessão; implementar validação de origem/formato no login e proteção contra abuso com armazenamento compartilhado. Testar erro de SDK, reenvio, token expirado, conta existente e bloqueada. Não ativar ferramentas adicionais sem contrato de ambiente e mensagens de erro.
3. Comparar banco real e migrações; corrigir unicidade/upsert e políticas de `applications`. Testar banco novo e upgrade de um banco já populado, incluindo tratamento de duplicatas sem apagar registros arbitrariamente.
4. Separar assets institucionais públicos de materiais restritos. Arquivos privados devem usar bucket privado e autorização/URL assinada conforme acesso. Inventariar e migrar objetos existentes com atualização de referências; mudar apenas o bucket padrão não protege URLs antigas.
5. Estabelecer homologação separada, variáveis documentadas e backup/restauração testados de banco **e Storage**. Corrigir scripts necessários ignorados pelo Git e pinagem/compatibilidade de dependências. Consolidar um release mínimo recuperável.
6. Separar Jest, Playwright, `node:test` e testes de políticas. Preservar os testes aprovados e seus consumidores na organização do diretório. Executar CI nativa em ambiente compatível; a solução WASM de auditoria não substitui o pipeline de release. Testes de RLS devem rodar com papéis reais em homologação.

**Conclusão:** signup não gera admin; bloqueio persiste com token anterior; visitante e aluno não alteram conteúdo/notas/perfis de terceiros; materiais privados negam acesso anônimo; clone limpo gera build; migrações e restauração comprovadas.

### Etapa 1 — concluir site, oferta e cadastro comercial

**Responsáveis:** frontend/backend + responsável acadêmico/administrativo. **IDs:** SITE-01/02/03/04/05/06, AUTH-04, COM-01, OPS-06, PRIV-01.

1. Separar publicação comercial, janela de inscrição e disponibilização EAD. Uma oferta aprovada pode abrir inscrições sem aulas prontas; o aluno recebe informações verdadeiras sobre início e acesso.
2. Definir e persistir catálogo comercial canônico: curso/turma, modalidade, carga horária, preço em centavos, condições, datas, vagas/elegibilidade, contrato e versão da oferta. Corrigir a diferença 400 h/40 h e datas antigas. Consulta de detalhe não deve desaparecer por inscrição fechada.
3. Revisar comunicação de pós-graduação e emissor do certificado com o responsável acadêmico, conforme categoria institucional aplicável. Registrar contrato, política de cancelamento/reembolso e transparência dos dados; separar marketing/analytics opcionais. Coletar documentos/dados somente quando necessários à finalidade definida.
4. Concluir login, recuperação com tela de nova senha e primeiro acesso. Tratar erros e conta existente, sem duplicar aluno. Fazer DTOs e cache de catálogo coerentes.
5. Corrigir domínio oficial/canonical/sitemap, contato 404, landmarks/IDs, números de WhatsApp e origem única das configurações. Validar teclado/mobile. Testar consentimento com GA configurado em homologação e a revogação após carregamento.

**Conclusão:** administrador cria/edita/publica uma oferta comercial sem depender do EAD; site exibe preço, carga, datas, contato e documentos coerentes; cadastro e recuperação funcionam; curso fechado recusa nova inscrição sem ocultar informação pública legítima.

### Etapa 2 — concluir inscrição e Pix manual

**Responsáveis:** backend/frontend + administrador financeiro. **IDs:** ENR-01/02/03/04/05 e PIX-01. **Depende:** etapas −1/0 e contrato comercial da etapa 1.

1. Definir uma ordem de pagamento persistida no servidor: ID, aluno, curso/turma, preço/versão da oferta, valor em centavos, referência única da ordem, método, prazo de negócio e estado. Não derivar referência apenas do usuário. O QR estático não ganha expiração bancária apenas porque a interface mostra prazo; expiração da ordem precisa de regra para recebimentos tardios.
2. Validar inscrição e disponibilidade no servidor; relacionar ficha ao `user_id`, registrar aceite contratual e tratar reenvio idempotente sem rebaixar matrícula ativa. Dados enviados pelo navegador não definem preço nem papel.
3. Gerar BR Code com valor do servidor, chave/favorecido/cidade verificados, QR legível e Pix Copia e Cola. Validar chave e formato em vez de silenciosamente truncar valores inválidos. Permitir recuperar a mesma ordem ao recarregar ou trocar dispositivo.
4. Separar estados: aguardando pagamento → pagamento declarado pelo aluno → aguardando conferência → pago confirmado; rejeitado/cancelado/expirado/reembolsado conforme operação. Declaração e comprovante nunca equivalem a recebimento confirmado. Mensagens e acesso devem respeitar o estado.
5. Unificar todos os caminhos administrativos em uma operação autoritativa com conferência, histórico, ator/data/motivo e transição condicionada. Registrar identificador bancário quando disponível e impedir sua reutilização indevida. Atualizar pagamento e matrícula atomicamente; aprovação repetida não duplica nem reconfirma outro valor.
6. Conferir o crédito no extrato/conta do instituto. TXID estático é auxiliar, não único meio de associação: combinar ordem, valor, data, comprovante/EndToEndId quando disponível e identificação do pagador. Definir exceções: terceiro pagador, valor errado, pagamento duplicado, tardio e ausência de referência.
7. Entregar acesso/primeiro contato conforme o que foi contratado. “Inscrição confirmada” pode significar vaga reservada; não deve prometer EAD liberado antes da data prevista. Fazer atendimento e reembolso operáveis.

**Conclusão:** executar em homologação os percursos de duas ofertas para o mesmo aluno, interrupção/reabertura, duplicidade de envio, pagamento declarado sem crédito, conferência/rejeição, duas aprovações simultâneas, curso fechado, terceiro pagador e reembolso. Nenhum aluno se aprova ou define preço. Responsável financeiro consegue reconciliar as pendências.

**Marco de lançamento comercial:** somente depois desses critérios, backup recuperável e procedimento financeiro aceito. Validação bancária final requer a participação do titular da conta, em fluxo controlado e autorizado.

### Etapa 3 — organização do diretório e desempenho medido

**Responsáveis:** manutenção + frontend/QA. **IDs:** ORG-01/03/04, OPS-04, SEO-01 e SEC-06.

1. Reclassificar os 205 candidatos com os consumidores de testes, scripts, importações dinâmicas e intenção de produto. Remover pequenos lotes revisáveis; executar types/build/testes/rotas após cada lote. Para funcionalidades aposentadas, remover a implementação e seus contratos/testes de maneira explícita.
2. Preservar o trabalho útil do gitlink `.worktrees/codex-care-tools`, então corrigir sua inclusão/metadados. Cache, build e `node_modules` não são código a publicar. Remover caches somente com processos parados e caminhos verificados.
3. Consolidar as nove famílias de duplicatas e escolher caminhos canônicos de actions/repositórios. Separar configurações por domínio para evitar sobrescrita de telas diferentes. Manter scripts reproduzíveis versionados.
4. Melhorar HTML sanitizado no SSR, escape JSON-LD e CSP com compatibilidade verificada. Medir LCP/INP/CLS, tamanho de assets e bundles das rotas prioritárias; só então otimizar imagens, cache e carregamento de 3D/recursos complementares. A retirada de fonte não utilizada não produziu redução observável nos 166 kB compartilhados.

**Conclusão:** exclusões têm justificativa e nenhuma nova regressão; clone limpo contém o necessário; navegabilidade permanece; melhorias de desempenho têm medição antes/depois. Não atrasar a correção de segurança de um recurso exposto para essa etapa.

### Etapa 4 — finalizar EAD e certificação

**Responsáveis:** backend/banco/frontend + responsável pedagógico. **IDs:** EAD-01/02/03/04/05 e PED-01.

Unificar autenticação, DTOs e persistência das avaliações; executar entrega/correção/tentativas em Supabase. Proteger INSERT e UPDATE de notas, retirar gabarito do DTO do aluno e definir autosave/limites. Alinhar aulas elegíveis, progresso, notas, presença e critérios configurados de conclusão. Escrita no servidor deve validar transições; retirar escrita direta ajuda a proteger regras, mas não comprova por si só que alguém assistiu ou aprendeu. Certificados devem ter emissão idempotente, identificação correta, unicidade e verificação/revogação, com emissor e regras acadêmicas válidos.

Revisar concorrência entre progresso/conclusão/revogação, materiais privados, datas/lives, mídias e stubs. Habilitar recursos complementares por prioridade real. **Conclusão:** um aluno legítimo percorre aula → avaliação → correção → conclusão → certificado, enquanto outro curso, perfil bloqueado e alterações fraudulentas são negados. Administração opera o mesmo registro que o portal consulta.

### Etapa 5 — automatizar pagamentos quando fizer sentido

**Responsáveis:** responsável financeiro + backend. **ID:** STR-01 e evolução de PIX-01.

Decidir PSP e meios de pagamento antes de investir na recuperação de Stripe. Comparar disponibilidade para o CNPJ, tarifas, parcelamento, reembolso e conciliação. Se escolhido Stripe, consolidar checkout/webhook no mesmo banco e identidade, validar versão da API e eventos repetidos/fora de ordem, recuperação de falhas e portal financeiro. Se escolhido PSP brasileiro, desenvolver adaptador sem alterar a ordem e regras comerciais já estabilizadas. Não há motivo para implementar Stripe e outro PSP integralmente ao mesmo tempo sem necessidade definida.

**Conclusão:** confirmação é baseada em evento verificado e idempotente, há conciliação/reprocessamento e o administrador trata exceções; taxas e liquidação foram aceitas pelo responsável financeiro.

## 8. Alternativas de Pix gratuitas e APIs

Pesquisa feita em 03/10/2026. “API grátis para integrar” e “receber gratuitamente” são condições diferentes; geração local não elimina eventuais tarifas da instituição financeira.

| Opção | O que entrega | Custo e adequação |
|---|---|---|
| [node-qrcode / pacote `qrcode`](https://github.com/soldair/node-qrcode) | Converte o payload em imagem/canvas/data URL. Não cria cobrança bancária nem verifica recebimento. | MIT, geração local sem tarifa por QR. **Recomendado para a primeira etapa**, pois já está instalado e usado no projeto; conservar o builder BR Code, corrigir e validar o fluxo. |
| [rprata/pixcode](https://github.com/rprata/pixcode) | Biblioteca TypeScript para gerar/interpretar payload Pix e representação do QR. | MIT, alternativa local ou validador independente em desenvolvimento. Avaliar manutenção, testes, tipos e dependências antes de substituir código existente. Não executada nesta auditoria. |
| [NascentSecureTech/pix-qrcode-utils](https://github.com/NascentSecureTech/pix-qrcode-utils) | Ferramentas TypeScript de geração/leitura de payload. | MIT. Repositório adicional para avaliação; não foi validado como dependência pronta para produção nem auditado integralmente. |
| [Especificação oficial API Pix](https://github.com/bacen/pix-api) | Contrato técnico da API de cobrança Pix. | Referência pública, não um serviço gratuito de cobrança oferecido pelo Banco Central. É necessário um banco/PSP que forneça acesso. |
| [Asaas Pix](https://www.asaas.com/pix-asaas) | Conta, cobrança e integração com confirmação. API também oferece [QR estático com referência/webhook](https://docs.asaas.com/reference/criar-qrcode-estatico). | Na página consultada: recebimento por QR dinâmico R$ 0,99 na promoção inicial de três meses, depois tarifa padrão R$ 1,99; contratação pode variar. Gratuidade anunciada para determinados usos não garante cobrança por API gratuita para PJ. |
| [Efí — tarifas](https://sejaefi.com.br/tarifas) | API Pix para cobrança, QR e automação. | Integração API anunciada gratuita, mas recebimentos por QR dinâmico/API com tarifa de 1,19% na tabela consultada. Franquias de QR do aplicativo têm condições diferentes de API/webhook. Confirmar contrato. |

**Escolha proposta:** gerar localmente com o que já existe e concluir a conferência manual. Uma API pública de desenho de QR não reduz os bugs de inscrição e ainda adiciona um terceiro recebendo os dados do payload. Não enviar dados de aluno ou credenciais a geradores aleatórios.

Para automação, QR dinâmico com PSP costuma facilitar rastreamento de cobrança. Porém, “estático nunca tem webhook” também seria incorreto: a API Asaas documenta notificações vinculadas ao QR estático administrado pelo próprio PSP. O QR local com chave Pix, sozinho, não fornece webhook.

O manual oficial prevê particularidades na transmissão do identificador de QR estático. Por isso, não se assume TXID visível e suficiente em todo extrato. Conferir o comportamento do banco recebedor escolhido e registrar o identificador bancário disponível. [Banco Central: Informe SPI 013/2021](https://aprendervalor.bcb.gov.br/content/estabilidadefinanceira/informesspi/InformeSPI-013-2021.pdf).

## 9. Referências para as decisões de implementação

- Escape de JSON-LD: a orientação oficial mostra escape de `<` na serialização. [Next.js: JSON-LD](https://nextjs.org/docs/app/guides/json-ld).
- Categoria institucional e oferta de especialização devem ser verificadas pelo responsável acadêmico nas normas e nos registros aplicáveis. Não se emite parecer de regularidade do instituto nesta auditoria. [MEC: normativos de pós-graduação](https://portal.mec.gov.br/component/content/323-secretarias-112877938/orgaos-vinculados-82187207/12899-pos-graduacao-normativos).
- Cancelamento/arrependimento e documentação contratual devem considerar a contratação online e as circunstâncias da oferta. [Código de Defesa do Consumidor, art. 49](https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm).
- Procedimentos preliminares/execução de contrato são hipóteses legais previstas; marketing e outras finalidades requerem análise própria, transparência e minimização. [LGPD, art. 7º](https://planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm).

## 10. Informações que ainda mudam o plano

1. JSON completo da consulta do projeto atual, para confirmar ACLs, políticas, índices e buckets.
2. Situação do projeto antigo e comprovação de revogação/exclusão das credenciais, sem divulgar valores.
3. Commit/ambiente realmente publicado e existência de homologação separada.
4. Responsável pela oferta de pós-graduação, emissor/parceiro habilitado e critérios acadêmicos.
5. Banco recebedor e titularidade PF/PJ da conta Pix, sem senha/chave privada, para validar conciliação e tarifas.
6. Nome e mensagem exata de erro do plugin. A falha de instalação ainda não foi diagnosticada; não atribuí-la a Supabase, firewall ou permissão sem essa evidência.

**Sequência de dependências:** contenção e permissões → base segura → oferta/site/cadastro → inscrição/Pix manual → lançamento comercial → organização/desempenho → EAD → automação financeira opcional. Tarefas de conteúdo podem ocorrer em paralelo à base técnica, mas a liberação depende dos critérios anteriores.


