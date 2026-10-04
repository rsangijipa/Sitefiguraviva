# Configurações do site e perfis de mediadoras

Data: 4 de outubro de 2026.

## Resultado da análise e edição disponível

| Área do painel | Conteúdo editável | Destino público |
| --- | --- | --- |
| Homepage | Título, nome em destaque e apresentação; títulos e apresentações das formações, blog e biblioteca; perguntas e respostas | Página inicial |
| Fundadora | Nome, título profissional, biografia, retrato por upload ou URL e link Lattes | Instituto e página da fundadora |
| Instituto e manifesto | Título e apresentação do Instituto, resumo institucional, título e apresentação do manifesto, texto completo, frase em destaque e endereço | Instituto, manifesto e rodapé |
| Contato e som | Número e mensagem do WhatsApp, controle de som ambiente | Botões de contato e controles da homepage |
| SEO e busca | Título e descrição da homepage, palavras-chave e imagem de compartilhamento | Metadados da homepage |
| Privacidade e termos | Documentos legais | Páginas de privacidade e termos |
| Cursos → novo ou Informações | Nome, título profissional, foto e currículo de cada mediadora | Botões e janela de perfil na página do curso |

A foto e a biografia da fundadora já eram lidas nas páginas atuais; o upload foi refinado para permitir alteração e remoção com controles visíveis e impedir publicação durante o envio. A homepage evita repetir o destaque quando o título salvo antigo já contém o mesmo nome. Os textos novos usam o conteúdo publicado em public_pages, com valores padrão para instalações que ainda não tenham todos os campos.

As opções de equipe geral, partículas, modo visual, Analytics e sincronização de conteúdo padrão foram retiradas das configurações porque não correspondiam à experiência pública atual. Os contatos usam o componente compartilhado implementado simultaneamente no projeto. O telefone institucional antigo deixou de ser um campo editável isolado; o contato é gerenciado pelo WhatsApp.

## Mediadoras e informações do curso

Os cursos existentes guardavam perfis em legacy_payload.mediators. O editor passa a carregá-los e salva atualizações em details.mediators. A leitura pública prioriza os perfis atualizados, inclusive quando todos são removidos. O mapa de permissões da equipe permanece independente desses perfis públicos.

A janela mostra retrato, nome, título profissional e currículo. A rolagem interna permite roda do mouse e teclado; o botão Fechar tem texto, contorno e área de toque. Há bloqueio da rolagem da página, navegação de foco e fechamento por Escape. Currículos antigos extensos recebem agrupamento visual de frases sem alterar seu conteúdo.

Os botões de mediadoras apresentam uma mão apontando ao final do nome e a instrução de tocar para consultar o currículo. Período, duração e investimento foram organizados em blocos com rótulos. A ampliação da capa passou a ser acessível por teclado.

As mudanças da janela preservam o parâmetro mediator na URL e usam a [API de histórico suportada pelo Next.js](https://nextjs.org/docs/app/getting-started/linking-and-navigating#native-history-api), evitando buscar o curso novamente ao abrir ou fechar um perfil.

## Verificação

- 47 testes relacionados a configurações, perfis, uploads, conteúdo público, edição de cursos e materiais passaram.
- 10 testes adicionais do processamento real de imagens e do componente compartilhado de contatos passaram após a integração das alterações simultâneas.
- TypeScript e ESLint: aprovados.
- Compilação de produção: aprovada.
- Conferência em navegador Chrome: desktop (1440 px), celular (390 px) e celular pequeno (320 px) aprovados, sem erros JavaScript ou transbordamento horizontal. Roda do mouse, teclado, Escape e retorno do foco verificados; o fundo permaneceu parado durante a rolagem da janela.
- Homepage, Instituto, fundadora e manifesto responderam com HTTP 200. [Resultados e capturas](./2026-10-04-admin-content-evidence/verification.json).
- Supabase: consultas de leitura confirmaram os formatos dos cursos, as configurações publicadas e as permissões do armazenamento de retratos.

Gravação autenticada no ambiente publicado não foi exercitada: os testes de salvamento usam o backend simulado. Fotos históricas que apontam para armazenamento indisponível mostram a inicial do nome até que um novo retrato seja enviado pelo administrador.
