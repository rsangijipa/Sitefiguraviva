# Recursos Interativos Figura Viva v2

Atualizado em 12/10/2026. Esta nota descreve o código desta entrega e separa validação técnica de decisões editoriais ou operacionais ainda pendentes. A fonte de marca é o arquivo integral [Figura-Viva-Design-System-v1.docx](brand/Figura-Viva-Design-System-v1.docx), versão e hash registrados em [brand/README.md](brand/README.md). O roteiro e os resultados desta rodada ficam em [evidências](recursos-v2-evidence/).

## Escopo e acesso

O catálogo contém 18 entradas: 15 recursos consolidados, incluindo **Instrumentos em Estudo** oculto, e três pilotos novos de Aprender. No catálogo, `access` descreve público ou vínculo de formação; `visibility` descreve publicado, oculto ou rascunho. Somente **Cartas Gestálticas** e **Figura e Fundo** podem carregar conteúdo publicado e revisado no público. Os outros 13 recursos consolidados e os três novos pertencem ao portal. Laboratório Fenomenológico, Ateliê do Experimento e Escuta Dialógica só aparecem após uma versão publicada e piloto vinculado àquela versão. Roda Viva e Encerramento são propostas futuras; os outros cinco recursos novos pertencem à v2.1.

| Recurso | Modos cadastrados | Acesso | Estado inicial |
| --- | --- | --- | --- |
| Chegada | breve, completa | formação | publicado; texto de acervo depende de revisão |
| Mapa do Corpo | mapear, percorrer | formação | publicado; conteúdo editorial vazio/quarentena |
| Paisagem de Pensamentos | jardim, rio | formação | publicado; escrita do jardim privada e efêmera; rio só salva reflexão |
| Sala de Pausa | respirar, observar, pelos-sentidos, ouvir, movimentar, desacelerar | formação | publicado |
| Igarapé | água, estático | formação | publicado; áudio requer licença registrada |
| Polaridades e Cadeiras | escala, diálogo | formação | publicado |
| Casoteca | microcaso, caso-longo | formação | publicado; Caso Clínico longo indisponível até reescrita docente |
| Cartas Gestálticas | explorar, revisar, copa, relações | público | publicado como rota; acervo fica vazio até revisão |
| Figura e Fundo | perceptivo, clínico, sessão | público | publicado como rota; acervo fica vazio até revisão |
| Ciclo do Contato | guiado, explorar, aplicar | formação | publicado |
| Fronteiras de Contato | vinhetas | formação | publicado |
| Roda das Emoções | roda, lista | formação | publicado |
| Necessidades Agora | perceber | formação | publicado |
| Sons para Awareness | escutar, texto | formação | publicado; mídia requer licença registrada |
| Instrumentos em Estudo | — | formação | oculto |
| Laboratório Fenomenológico | laboratório | formação | rascunho, piloto e conteúdo pendentes |
| Ateliê do Experimento | ateliê | formação | rascunho, piloto e conteúdo pendentes |
| Escuta Dialógica | escuta | formação | rascunho, piloto e conteúdo pendentes |

`/recursos/[slug]` é canônica para as duas vitrines públicas. O espelho no portal e todos os recursos exclusivos são `noindex` e têm canônica de portal. Aliases resolvem para o destino canônico preservando somente um modo válido. A geração do sitemap filtra por `access=public` e `visibility=published`; o servidor repete a autorização em cada página, snapshot, mutação e operação de conteúdo. A formação precisa estar publicada e aberta ou fechada, com matrícula ativa ou concluída. Revisores, autores e administradores têm prévia editorial, sem acesso aos registros pessoais.

## Código, legado e CSS

O host comum, o shell, o áudio por gesto, a biblioteca visual acessível, os formulários e as experiências estão em `src/features/interactive-resources/v2/`. O catálogo e aliases estão em `src/components/resources/resourceCatalog.tsx`; pontos de integração com LMS estão em `src/features/interactive-resources/clinicalToolsRegistry.ts`. A navegação institucional preserva `Institucional`; os recursos educativos usam o registro `Confluência`. A migração local está em `supabase/migrations/20261012161154_recursos_interativos_v2.sql` e seu inventário de preflight em `supabase/preflight/recursos-v2.sql`.

Os dados do navegador nunca são lidos automaticamente. A importação conhecida exige autenticação, confirmação literal “estes registros são meus”, vínculo escolhido e gravação confirmada antes de remover a chave de origem. Casos em formato desconhecido permanecem exportáveis. Adaptadores atuais cobrem check-in/diário/intensidade, mapa, polaridades/cadeiras, Casoteca, jardim, roda/check-in e fontes nomeadas no código. **Favoritos/revisões antigos de Cartas, Ciclo, Fronteiras, quiz e chaves dinâmicas de jardim ainda não têm conversor**; a interface preserva a origem e oferece exportação/exclusão. Préflight lista contagens e tamanhos, não texto pessoal. Slugs desconhecidos ou payload acima de 16 KiB interrompem a migração inteira. Cada formato não coberto exige conversor sem perdas, revisão e ensaio em clone antes de qualquer migration remota.

Todos os 31 CSS encontrados, ativos ou inativos, compilam no Tailwind 3.4.19. A migração removeu imports e temas Tailwind 4, concentrou diretivas globais, adicionou aliases `fv-*` com RGB para modificadores de opacidade e escopou regras legadas sob `.fv-resources`. O resultado da compilação e da prova de opacidade está em `recursos-v2-evidence/css-compilation.json`. Os tokens e extensões estão em `src/design/fv-tokens.css` e `tailwind.config.js`. Os tempos de transição novos estão em zero até aprovação. O lint de marca examinou 388 arquivos e encontrou zero ocorrências fora da paleta, fontes e regras bloqueadas.

Componentes usam Lucide com traço 2, cor única e rótulo; glifos de carta continuam próprios. Nenhuma ilustração conceitual ou referência foi gerada por IA. Copa, Árvore de Rubin, cartas e artes do kit aguardam produção humana ou acervo aprovado; a licença, hash e curadoria de cada asset entram no manifesto editorial. A tabela de aprovação de arte está vazia e valida o nome/evidência da aprovação da Lilian em cada versão do kit. O Design System prevê cantos vivos no Institucional; novos raios de web seguem aguardando essa aprovação.

## Dados pessoais, retenção e recuperação

Os formulários mantêm respostas em memória; o servidor deriva o proprietário da sessão, valida schemas estritos por recurso, rejeita chaves desconhecidas, impõe 16 KiB e associa cada escrita a uma matrícula datada. O navegador não lê nem escreve diretamente as tabelas. Registros do Mapa/Figura e Fundo/Igarapé não persistem respostas pessoais nesta primeira estrutura; a integração deve manter esta decisão até schema próprio revisado. As tabelas legadas de necessidades, sons, pausa e rio são reutilizadas, junto à genérica enumirada; Chegada, Polaridades e Laboratório usam tabelas próprias. Administração, revisão e impersonação não leem registros. Exportação do próprio histórico percorre todas as páginas disponíveis mesmo após a saída da formação.

Cada novo registro expira seis meses após o término oficial ou desligamento individual, o que vier primeiro. A data é conferida no servidor e banco; expiração não se prolonga em nova matrícula. A rotina diária apaga em lotes, primeiro exige recibo técnico durável e reporta itens restantes. A exclusão solicitada e a remoção de conta usam a mesma ordem antes da remoção física. Registros legados sem matrícula ganham seis meses desde a migração.

O manifesto tem apenas tabela, UUID do registro, data e chave idempotente; não contém proprietário nem texto. O serviço de `scripts/resource-deletion-ledger.mjs` é um protótipo implantável separado, com diretório local protegido, sync do arquivo, bloqueio externo da liberação e paginação de recibos. Ele precisa rodar em volume persistente criptografado fora do Supabase e de seus backups, sob HTTPS e token forte. Em sistema POSIX, o serviço sincroniza também o diretório após criar recibo; em Windows, a sincronização de diretório não é oferecida. O ambiente real precisa comprovar durabilidade do volume, recuperação após falha e janela de backup de no máximo 30 dias.

**O histórico está desabilitado agora.** Nenhuma prova de backup ou restauração real foi fornecida/configurada neste workspace; a migration inicializa o controle desligado e a aplicação exige um testemunho HTTPS externo cujo `release_id` coincida com o banco. O operador deve interromper o acesso ao site inteiro, bloquear o testemunho externo antes da restauração de qualquer snapshot, restaurar banco/Storage, reaplicar todas as páginas do manifesto externo, repetir a purga até zero e verificar a retenção real dos backups. Só então a pessoa responsável registra evidências de backup, ledger e restauração para uma nova liberação assinada. O endpoint local de manutenção exige token, não pode ativar histórico e não há agendador diário configurado. **Não liberar histórico até configurar e ensaiar esse procedimento em staging**, incluindo tarefas com alerta/retry para concluir a purga em até 24 horas.

As configurações de backup variam conforme plano e retenção Supabase; consulte a [documentação oficial de backups](https://supabase.com/docs/guides/platform/backups). A linha SQL de 30 dias é um limite máximo, não prova da configuração da instância. Cópias manuais também devem respeitar 30 dias e as mesmas exclusões.

## Conteúdo e governança editorial

O agente preparou formulários vazios, validações e fluxos. Docentes escrevem teoria, vinhetas, casos, comentários e bibliografia. Referências pendentes do legado não são consumidas pelos snapshots e precisam de quarentena/conferência. Publicação exige autoria, referências completas quando aplicável, assets com hash/licença/curadoria, assinatura independente de docente revisor com CRP e publicação administrativa separada. Alterar versão assinada limpa a revisão; corrigir publicação cria nova versão imutável. Papéis `docente_autor` e `docente_revisor` são locais ao subsistema, sem alterar o papel global do LMS. Dados de testes são neutros e fictícios; não recebem bibliografia ou assinatura.

Estruturas docentes e campos de referência estão vazios no workbench. Metas de acervo: 60 cartas, 12 situações, 20 vinhetas e 24 casos. Os oito lotes de cartas são: Fundamentos (8), Fenomenologia (6), Relação dialógica (6), Ajustamentos e interrupções (10), Teoria do self (6), Campo (8), Autoras e autores (10), Território e pensamento decolonial (6). Não há datas publicadas. Antes de calcular semanas, a coordenação executa o piloto com duas cartas, uma situação, uma vinheta e um microcaso; mede separadamente autoria, checagem bibliográfica, revisão e retrabalho, aloca horas por semana e define responsáveis. Lotes aprovados podem ser publicados separadamente e revisados em paralelo com a autoria seguinte.

O histórico de conteúdo e de aprovações fica no banco após aplicar a migration. O payload do acervo admite campos específicos por recurso, schema/versionamento e teto de 512 KiB por versão, enquanto os registros pessoais ficam limitados a 16 KiB. A aprovação de piloto identifica a versão concreta do conteúdo; nova versão exige novo piloto.

## Verificação e pendências de liberação

| Verificação local | Resultado atual |
| --- | --- |
| Tipos | aprovado (`npm run typecheck`) |
| Lint de marca | 0 erros em 388 arquivos |
| Compilação CSS | 31 arquivos em Tailwind 3.4.19; opacidade confirmada |
| PostgreSQL PGlite | 37 checagens, fixtures sintéticas locais |
| Teste do manifesto | loopback local; idempotência após reinício, bloqueio e replay |
| Suíte Jest | consulte o registro final da rodada antes de tratar build como liberável |
| Build isolado final | pendente de repetição após alterações finais |

As capturas antes/depois em 320, 390, 768 e 1440 px, além da conclusão por teclado na Chegada, estão em `recursos-v2-evidence/`. Capturas “depois” usam conteúdo editorial vazio publicado como estado de rota, ou fixtures locais claramente fictícias nas prévias. Ainda requerem validação manual zoom real de 200%, teclado virtual em dispositivo móvel, texto longo revisado, leitores de tela e teste físico em vários dispositivos. A linha de base original encontra-se em `recursos-v2-baseline.md`.

Antes de ativar histórico ou publicar recursos, completar: build isolado final; repetir a suíte completa e registrar seus números; configurar/ensaiar retenção de backup e recuperação em staging; configurar o job diário e alerta; executar piloto docente e colher assinaturas CRP reais; produzir e registrar arte/licença aprovada; preencher conteúdo revisado; e validar capturas/jornadas por teclado e móvel com a equipe. Nenhum desses atos externos é presumido pelo código. Não foram aplicadas migrations remotas nem publicado o site.
