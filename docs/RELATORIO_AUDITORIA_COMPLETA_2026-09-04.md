# Relatório de análise completa — Instituto Figura Viva

**Data:** 04/09/2026  
**Escopo:** código-fonte, configuração, banco/regras, APIs, testes, build de produção, rotas públicas e inspeção visual local.  
**Ambiente:** checkout local; não foi feita alteração em dados de produção nem envio de credenciais/formulários.

## 1. Conclusão executiva

A aplicação é uma plataforma EAD/institucional ampla e visualmente madura, com App Router, portal do aluno, painel administrativo, cursos, avaliações, certificados, comunidade, gamificação, pagamentos, PWA, observabilidade e integrações Firebase/Supabase/Stripe.

O estado atual é **funcional para demonstração e evolução controlada, mas não deve ser considerado pronto para produção de forma irrestrita**. O build passa e os fluxos públicos principais renderizam, porém há riscos críticos de autorização e consistência durante a migração Firebase → Supabase, além de funcionalidades explicitamente simuladas (PIX), PWA autodesativado e exposição de informações técnicas.

### Classificação resumida

| Área | Avaliação | Observação |
|---|---:|---|
| Arquitetura e organização | 7/10 | Boa separação por domínio, mas coexistem duas arquiteturas de dados e autenticação. |
| Funcionalidade | 6/10 | Superfície ampla; pagamentos/PIX, notificações e alguns KPIs ainda são parciais. |
| Segurança | 4/10 | Headers e rate limit existem, mas RLS contém vetores de elevação de privilégio. |
| Qualidade de código | 5/10 | Lint/typecheck passam, porém há 513 ocorrências de `any`, 62 TODOs e regras importantes desativadas. |
| Desempenho | 5/10 | HTML/DOM muito grande e bundles altos; raiz força renderização dinâmica. |
| UX/acessibilidade | 7/10 | Boa base semântica e responsiva; há inconsistências de conteúdo e links. |
| Operação/CI | 7/10 | CI, dependabot, CodeQL, backup e testes existem; cobertura efetiva ainda é incompleta. |

**Prioridade de liberação recomendada:** corrigir P0 de autorização e alinhar o sistema de identidade antes de processar matrículas/certificados em produção.

## 2. Inventário técnico

- Next.js 15.5.25, React 19, TypeScript, Tailwind CSS e App Router.
- 64 páginas/rotas de aplicação, 13 handlers de API e 166 componentes listados.
- Aproximadamente 451 arquivos de código e 66,5 mil linhas em `src`.
- 194 arquivos marcados como client component e 36 arquivos com server actions.
- Firebase aparece em 129 arquivos de produção; Supabase em 28. Isso confirma que a migração ainda está em fase híbrida.
- Serviços principais: cursos, matrículas, progresso, avaliações, certificados, eventos, comunidade, gamificação, analytics, upload, notificações e Stripe.
- Testes: 15 suítes Jest detectadas (14 executadas, 1 ignorada); 70 testes passaram e 7 foram ignorados. Existem 10 arquivos E2E, mas não foi possível concluir uma jornada autenticada sem usar credenciais de usuário.

## 3. Arquitetura e fluxo de dados

### Pontos positivos

- App Router e layouts separados para áreas pública, portal e administração.
- Camadas explícitas em `src/actions`, `src/services`, `src/lib`, `src/features` e `src/infrastructure`.
- Contratos Zod e tipos de domínio já existem em alguns limites.
- Sentry, logs, auditoria, rate limiting e headers de segurança foram considerados.
- O webhook Stripe possui verificação de assinatura e registro de idempotência.

### Riscos arquiteturais

1. **Migração incompleta de identidade e persistência.** O navegador autentica via Supabase e grava o access token na cookie `session` (`src/app/api/auth/login/route.ts`). Entretanto, 26 arquivos de produção ainda chamam `verifySessionCookie` do Firebase. Esse token não é uma cookie de sessão Firebase; portanto, ações de eventos, avaliações, certificados, analytics, perfil e várias rotinas administrativas podem rejeitar usuários legítimos ou falhar em produção.

2. **Serviços client-side ainda usam Firebase Auth/Firestore.** O `AuthContext` não autentica o Firebase Client SDK, mas diversos serviços client-side continuam sujeitos a regras que esperam `request.auth` Firebase. A aplicação pode parecer autenticada no Supabase e, simultaneamente, não estar autenticada no Firestore.

3. **Renderização dinâmica global.** `src/app/layout.tsx` chama `cookies()` apenas para detectar impersonação. O build classificou quase todas as páginas como dinâmicas (`ƒ`), e a resposta local veio com `Cache-Control: no-store`. Isso neutraliza parte do benefício de `revalidate = 3600` de biblioteca/galeria e aumenta TTFB, custo e carga no Firebase.

4. **Multi-tenancy incompleta.** O middleware calcula o tenant por hostname, mas escreve `x-tenant-id` na resposta (`response.headers.set`) em vez de injetá-lo nos headers da requisição para os serviços downstream. Além disso, a heurística transforma `figuraviva.com.br` em tenant `figuraviva`, enquanto o fallback é `viva`.

5. **Duplicação de actions e guards.** Há implementações canônicas em `src/actions` e wrappers/legados em `src/app/actions`, mas muitos módulos antigos continuam com autenticação própria. Isso aumenta divergência de comportamento e dificulta auditoria.

## 4. Achados críticos de segurança e integridade

### P0-01 — Elevação de privilégio potencial nas políticas Supabase

Na migration `202606110001_p2_lms_foundation.sql`, a policy `profiles_update_own_basic` permite que o próprio usuário atualize sua linha inteira. Não há restrição de colunas para `role` ou `is_active`. Se a migration refletir o banco ativo, um usuário autenticado pode tentar alterar seu papel para `admin`; `current_profile_role()` passa então a reconhecer esse papel.

**Correção:** revogar `UPDATE` de colunas de governança para `authenticated`, conceder apenas colunas de perfil, ou mover a atualização para uma RPC/server action que rejeite mudanças de `role`, `is_active` e campos de governança. Adicionar teste negativo real contra o banco/RLS.

### P0-02 — Alteração de nota/status pelo próprio aluno

Na migration estendida, `assessment_submissions_update_own_or_staff` permite update quando `user_id = auth.uid()`, sem limitar colunas. O aluno pode potencialmente alterar `score`, `percentage`, `passed`, `status`, `feedback` ou `graded_at` da própria submissão.

**Correção:** aluno deve somente inserir respostas e, no máximo, atualizar rascunho; nota, aprovação e status final devem ser escritos exclusivamente por servidor/staff.

### P0-03 — Progresso não vinculado à matrícula

`lesson_progress_write_own` autoriza `for all` apenas por `user_id`. Não exige matrícula ativa nem que a aula pertença a um curso acessível. Um usuário autenticado pode criar progresso concluído para IDs de curso/aula que não cursou, com impacto potencial em conclusão e certificados.

**Correção:** separar insert/update, conferir matrícula ativa e publicação no servidor, validar existência da aula e derivar conclusão transacionalmente.

### P0-04 — Conteúdo HTML renderizado sem sanitização

Há `dangerouslySetInnerHTML` para conteúdo editorial/aulas em:

- `src/components/BlogPostModal.tsx`
- `src/app/blog/[id]/BlogDetailClient.tsx`
- `src/components/PDFReader.tsx`
- `src/components/portal/CoursePlayer.tsx`

Não foi encontrada biblioteca de sanitização HTML; `react-markdown` é usado em outro renderer, mas não cobre esses caminhos. Um administrador comprometido, import malformado ou conteúdo legado pode gerar XSS armazenado. A CSP também usa `'unsafe-inline'`.

**Correção:** preferir Markdown com allowlist; quando HTML for obrigatório, sanitizar no servidor com política restritiva, remover scripts/URLs perigosas e aplicar testes de payload.

### P1-01 — Dependências vulneráveis

`npm audit --omit=dev` encontrou **16 vulnerabilidades de produção: 3 altas e 13 moderadas**, incluindo advisories transitivos em Next/PostCSS, `sharp` (<0.35.0) e cadeia Google Cloud/Firebase. O resultado foi obtido no registry npm em 04/09/2026.

**Correção:** atualizar `sharp`, PostCSS/Next e Firebase Admin conforme compatibilidade; reavaliar com `npm audit`, lockfile limpo e CodeQL/SCA no CI. Se não houver correção imediata, reduzir superfície de processamento de imagens e acompanhar os advisories.

### P1-02 — Endpoint de health disclosure

`/api/health/firebase-admin` retorna publicamente `projectId`, `exists`, `error.message` e `error.code`. Em caso de falha, detalhes do SDK podem ser expostos a qualquer visitante.

**Correção:** manter endpoint interno/autenticado ou devolver apenas `{ ok: boolean }`; não enviar mensagens do SDK ao cliente.

### P1-03 — Input e abuso nas APIs

`/api/applications/submit` aceita `answers`/`consent` como objetos sem schema Zod, limite explícito de tamanho ou rate limit. Checkout também não tem limite específico por usuário e pode criar sessões repetidas. O upload valida MIME/extensão e tamanho, mas não verifica magic bytes/antimalware.

**Correção:** schemas fechados, limites de payload, idempotency key, rate limit por UID/IP e verificação de conteúdo de arquivo.

### P1-04 — Excesso de dados em logs

Há cerca de 312 chamadas `console.*` e logs `SERVER DEBUG` em upload de avatar, incluindo URL pública. O webhook registra trecho do body em falha de assinatura. Isso pode levar PII, URLs assinadas ou payloads de ataque para logs.

**Correção:** usar logger estruturado com redaction, níveis por ambiente e correlação sem dados sensíveis.

## 5. Funcionalidade e regras de negócio

### Pagamentos e matrícula

- O fluxo Stripe tem autenticação Bearer Supabase, valida curso e assina webhook; é a parte mais sólida do pagamento.
- O fluxo PIX é explicitamente simulado: `EnrollmentStepper.tsx` constrói payload com `Math.random()` e comentário “Random mock PIX Payload for visual purposes”. Não deve ser exibido como pagamento real.
- A disponibilidade do checkout usa `status === open || isPublished === true`, enquanto outras consultas exigem ambos. Isso pode permitir checkout para curso publicado porém fechado.
- Matrícula é escrita em duas coleções Firebase; é necessário garantir reconciliação e transação idempotente em falha parcial.

### Cursos, aulas e avaliações

- O modelo suporta módulos, aulas, blocos, materiais, preview, progresso, avaliações e certificados.
- Há lógica legada de blocos em subcoleção e lógica Supabase de `lessons.blocks`; manter um único contrato canônico para impedir aulas vazias.
- Avaliações ainda têm TODOs para tentativas múltiplas, mapeamento de respostas e timestamps.
- Analytics contém KPIs retornando zero/TODO (`activeUsers`, `newEnrollments`, certificados, conclusão e média de avaliação). O painel pode transmitir dados fictícios.

### PWA e notificações

- `public/sw.js` se registra e imediatamente chama `self.registration.unregister()` no activate.
- `src/app/layout.tsx` também desregistra todos os service workers após interação.
- O manifesto referencia ícones `android-chrome-*.png`; é necessário confirmar sua existência no deploy.
- `firebase-messaging-sw.js` contém configuração placeholder (`env-id`, projeto genérico) e o app pede permissão de notificação automaticamente após login.

**Resultado:** PWA/offline e push não estão prontos para serem tratados como recursos de produção.

## 6. Desempenho

Medição na versão de produção local (`next start`, sem cache prévio):

| Métrica | Valor observado |
|---|---:|
| TTFB | 840 ms |
| DOMContentLoaded | 1.084 s |
| Recursos | 74 |
| Transferência total de recursos | ~1,016 MB |
| JavaScript transferido | ~626 KB em 43 chunks |
| HTML decodificado | ~750 KB |
| HTML da página | ~685 KB |
| Nós DOM | 4.774 |
| Nós internos SVG | 3.338 |

`RainbowTree.tsx` possui 9.338 linhas/310 KB de SVG procedural e aparece na home. Isso explica o HTML e DOM grandes; é uma boa oportunidade para trocar por asset SVG otimizado, canvas ou versão reduzida/responsiva.

O build informa First Load JS compartilhado de 191 KB; rotas relevantes ficam entre 430–500 KB, e `/portal/course/[courseId]` chega a 500 KB. Priorizar carregamento sob demanda de Recharts, Three.js, PDF, gamificação e componentes administrativos.

## 7. UX, acessibilidade e conteúdo

### Pontos positivos observados

- `lang="pt-BR"`, skip link, navegações nomeadas, headings e labels presentes.
- Imagens observadas na home/autenticação tinham `alt`; a home não apresentou overflow horizontal em 1280×720 nem 390×844.
- Menu móvel, banner de cookies, FAQ e estados de navegação funcionam visualmente.
- Formulário de login usa `type=email`, `type=password`, `required` e autocomplete adequado.

### Problemas encontrados

- Títulos de páginas como biblioteca/galeria repetem o sufixo da metadata template: “Biblioteca Pública | Instituto Figura Viva | Instituto Figura Viva”.
- Conteúdo público contém texto sem espaços, por exemplo “depressãopós-parto”, indicando problema de ingestão/normalização editorial.
- A home mostra “Início Abr/24”, aparentemente desatualizado para o contexto de 2026.
- O link flutuante padrão usa `556992481585`, enquanto outras áreas usam `5569992481585`; o nono dígito altera o destino do WhatsApp.
- Existem links `target="_blank"` sem `rel` em alguns arquivos administrativos e institucionais; adicionar `noopener noreferrer` de forma consistente.
- Cerca de 415 handlers `onClick` foram encontrados; revisar elementos clicáveis não semânticos e suporte a teclado, especialmente cards interativos.
- A tela de autenticação expõe o link “Admin” como caminho visível; isso é aceitável como UX, mas não deve ser considerado controle de segurança.

## 8. Qualidade, testes e entrega

### Verificações executadas

- `npm run lint`: passou.
- `npm run typecheck`: passou.
- `npm test -- --runInBand --coverage=false`: 14 suítes passaram, 1 ignorada; 70 testes passaram, 7 ignorados.
- `npm run build`: passou em build de produção separado (`.next-audit`).
- Rotas públicas `/`, `/curso`, `/public-library`, `/public-gallery`, `/instituto/laura-perls`, `/privacidade` e `/termos`: HTTP 200 local.
- `/portal` e `/admin` sem sessão redirecionaram para `/auth?next=...`.
- `/api/health/firebase-admin`: HTTP 200 e confirmou a exposição de `projectId`.

### Lacunas

- Os testes de regras Firestore são condicionais a `FIRESTORE_EMULATOR_HOST`; sem emulador, a suíte é ignorada. Segurança de regras precisa falhar o CI quando o emulador não estiver disponível.
- Não há relatório de cobertura no comando padrão.
- CI define Node 18 e 20, enquanto README exige Node 20+; remover Node 18 ou declarar compatibilidade real.
- `eslint-config-next` 16.1.1 está desalinhado do Next 15.5.25.
- O build emitiu aviso de múltiplos lockfiles e inferência incorreta de root (`C:\Users\aless\package-lock.json`). Configurar `outputFileTracingRoot` ou remover o lockfile indevido.
- O build emitiu depreciação do import `withSentryConfig` de `@sentry/nextjs`; migrar para `@sentry/nextjs/config` antes da próxima major.
- Regras importantes estão desligadas: `react-hooks/exhaustive-deps`, `react-hooks/rules-of-hooks`, imutabilidade, pureza e error boundaries.
- Há 513 ocorrências de `any`, 62 TODO/FIXME e 7 `@ts-ignore`/`@ts-expect-error` em `src`.

## 9. Plano de ação priorizado

### Imediato — antes de produção (P0)

1. Escolher Supabase ou Firebase como autoridade de identidade e substituir todos os `verifySessionCookie` incompatíveis por um guard único.
2. Corrigir RLS de `profiles`, `assessment_submissions` e `lesson_progress`; criar testes de elevação, adulteração de nota e progresso fora de matrícula.
3. Bloquear HTML não sanitizado e revisar dados já existentes.
4. Desativar o fluxo PIX simulado ou rotulá-lo de forma inequívoca como demonstração.
5. Remover/desproteger o health endpoint e eliminar logs de debug/PII.

### 0–30 dias — estabilização

1. Corrigir PWA/service workers e configurar FCM com valores reais somente via ambiente.
2. Adicionar schemas Zod e rate limits a todas as APIs públicas/mutadoras.
3. Tornar checkout e matrícula idempotentes e alinhar `status`/`isPublished`.
4. Retirar `cookies()` do RootLayout; isolar impersonação no layout administrativo.
5. Atualizar dependências vulneráveis e alinhar versões Next/ESLint/Sentry.

### 30–60 dias — desempenho e produto

1. Reduzir RainbowTree e lazy-load de gráficos, PDF, Three.js e módulos administrativos.
2. Reativar regras de hooks gradualmente e reduzir `any` nas fronteiras de domínio.
3. Implementar KPIs reais ou exibir claramente “indisponível”, nunca zero silencioso.
4. Normalizar conteúdo editorial, datas e número do WhatsApp em uma fonte única.
5. Medir Core Web Vitals em produção com consentimento e dashboards de erro.

### 60–90 dias — governança

1. Completar migração de dados/serviços e retirar Firebase legado dos fluxos críticos.
2. Fazer E2E autenticado em ambiente seed isolado para aluno, tutor e admin.
3. Tornar suíte de regras obrigatória no CI e publicar cobertura mínima por domínio.
4. Revisar LGPD: retenção, exportação/eliminação, consentimento, logs e acesso a dados de matrícula.
5. Criar checklist de release com rollback, migrações reversíveis e verificação de webhooks.

## 10. Critério de aceite recomendado

A plataforma pode ser considerada pronta para uma liberação controlada quando: (a) nenhum aluno consegue elevar papel, alterar nota ou forjar progresso; (b) todos os guards usam a mesma autoridade de identidade; (c) PIX/PWA/push estão reais ou explicitamente removidos; (d) `npm audit` não possui alta sem mitigação documentada; (e) regras e E2E autenticados executam obrigatoriamente no CI; e (f) TTFB/HTML/bundles têm metas definidas e medidas em produção.

