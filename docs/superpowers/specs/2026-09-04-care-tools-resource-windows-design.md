# Padronização das Ferramentas de Cuidado

## Objetivo

Organizar as quatro Ferramentas de Cuidado em uma estrutura única e fazer Respiração, Árvore das Emoções, SomaScan e Quiz abrirem na mesma janela responsiva, quase em tela cheia, com navegação e fechamento consistentes.

## Organização

Os aplicativos ficarão sob `src/components/resources/apps/`, separados por responsabilidade:

- `breathing/`: prática guiada de respiração;
- `emotion-tree/`: nova experiência 3D da Árvore das Emoções;
- `soma-scan/`: mapeamento corporal;
- `mental-health-quiz/`: check-in de saúde mental.

Os cartões e o orquestrador da seção continuam em `src/components/ResourcesSection.jsx`. A moldura compartilhada ficará em `src/components/resources/ResourceWindow.tsx`.

## Janela compartilhada

Todos os recursos abrirão em uma única instância do modal existente, por meio de `ResourceWindow`. A janela terá:

- altura máxima de 90vh e largura adequada a experiências imersivas;
- comportamento responsivo e respeito às áreas seguras de dispositivos móveis;
- um único cabeçalho sobreposto com título acessível e controles padronizados de voltar e fechar;
- bloqueio do scroll da página, fechamento por Escape e backdrop;
- área interna isolada, sem padding obrigatório, para cada aplicativo controlar seu próprio layout;
- rolagem somente quando o aplicativo precisar, evitando combinações conflitantes de `h-screen` e `h-dvh`.

Os botões externos de voltar/fechar substituem controles duplicados dos aplicativos. Ações internas que mudam etapas continuam dentro de cada ferramenta.

## Integração da nova Árvore das Emoções

O conteúdo fornecido em `src/components/arvoredasemocoes` é a fonte da nova Árvore. Ele será convertido de aplicativo Next.js independente em um módulo do projeto principal:

- `ExperienceRoot` será o ponto de entrada da ferramenta;
- imports absolutos internos serão convertidos para funcionar sob o alias do projeto principal;
- estilos exclusivos serão encapsulados e carregados pelo projeto principal;
- `app/`, configurações Next/Tailwind/TypeScript, manifesto, service worker, favicon e `package.json` aninhados não serão mantidos como uma segunda aplicação;
- rotas de API necessárias serão migradas para `src/app/api/emotion-tree/` e seus clientes usarão os novos caminhos;
- dependências realmente usadas pela experiência 3D serão adicionadas ao projeto principal em versões compatíveis;
- a implementação anterior, `FeelingsTree.tsx` e `TreeVisualization.jsx`, será removida depois que nenhuma importação depender dela.

A árvore ocupará toda a área útil da janela compartilhada. Seus painéis de mensagem e favoritos continuam internos à experiência, mas não criarão outro modal externo.

## Integração dos outros recursos

Respiração, SomaScan e Quiz serão movidos para suas pastas em `resources/apps`. Cada raiz receberá um contrato de apresentação consistente: ocupar a largura e altura disponíveis da janela, sem criar outro contêiner de viewport nem repetir o controle global de saída.

O estado de cada ferramenta será desmontado quando a janela fechar, preservando o comportamento atual de reiniciar uma sessão ao reabrir. O estado local da seção que não for consumido pela nova árvore será removido.

## Acessibilidade e comportamento

- A janela terá nome acessível correspondente ao recurso ativo.
- Escape fechará primeiro os painéis internos que o tratam e, quando não houver painel interno, fechará a janela compartilhada.
- Os controles globais permanecerão visíveis e operáveis por teclado.
- Animações respeitarão `prefers-reduced-motion`.
- O conteúdo será utilizável em telas pequenas sem cortes nos controles essenciais.

## Tratamento de falhas

Falhas na obtenção de frases da árvore usarão o fallback local já incluído no novo aplicativo. Erros de WebGL ou carregamento da experiência não devem impedir o usuário de fechar a janela. As demais ferramentas permanecem locais e não introduzem novas chamadas remotas.

## Validação

A implementação será validada por:

- testes do seletor e da janela compartilhada, incluindo abrir, trocar conteúdo e fechar;
- teste de integração que confirma o uso da nova Árvore e a ausência da antiga;
- verificação de TypeScript e lint;
- build de produção;
- inspeção visual dos quatro recursos em viewport desktop e móvel, verificando dimensões, controles, overflow e ausência de botões globais duplicados.

## Fora do escopo

Não serão redesenhados o conteúdo clínico, a lógica das ferramentas, a gamificação geral do site ou outros modais fora da seção Ferramentas de Cuidado.
