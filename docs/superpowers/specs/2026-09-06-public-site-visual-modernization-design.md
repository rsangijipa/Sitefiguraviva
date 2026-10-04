# Especificação: modernização visual do site público

## Regra operacional

Este trabalho é uma modernização da camada pública, não uma migração arquitetural. O `main` local é a fonte de verdade para dados, autenticação, EAD, administração, regras de negócio e integrações. A branch remota será tratada somente como referência visual e de código; não será feito merge integral. Cada alteração será reaplicada seletivamente em uma branch de feature baseada no `main` estável.

## Objetivo

Modernizar visualmente a homepage e criar páginas públicas institucionais, de formações e recursos, preservando integralmente os fluxos de autenticação, EAD, administração, dados e ações do `main` local.

## Escopo

### Homepage

- Compactar o hero mantendo a tipografia e a paleta da marca.
- Remover o selo superior redundante de instituto.
- Usar “Instituto de Gestalt-terapia de Rondônia Figura Viva” como título principal.
- Substituir a moldura fotográfica do hero pela árvore `FiguraVivaTree`, posicionada como ilustração de fundo com baixa opacidade.
- Aplicar movimento de baixa intensidade ao ponteiro, pausando fora da viewport e respeitando redução de movimento.
- Manter na homepage: Vozes que Florescem, Blog, Dúvidas Comuns, Presença Local e Campo Aberto.
- Exibir no máximo três formações com link para a página completa.
- Priorizar formações promovidas, se o dado já existir; caso contrário, usar até três formações abertas ou futuras na ordenação atual, sem criar campo novo.
- Remover da homepage os blocos institucionais que passam a viver em páginas próprias.

### Páginas públicas

- `/instituto`: missão, valores, essência, localização e chamada para a fundadora.
- `/instituto/fundadora`: página editorial dedicada a Lília, com biografia, trajetória e atuação.
- `/formacoes`: catálogo completo de cursos e ciclos, reutilizando a fonte de dados atual.
- `/recursos`: recursos interativos já existentes, com aviso de uso responsável.
- `/public-library`, `/public-gallery` e `/blog`: manter funcionalidades atuais e apenas harmonizar enquadramento visual quando necessário.

### Navegação e rodapé

- Atualizar links do top bar para as rotas acima.
- Manter links de login, portal, clínica e contato existentes.
- Reorganizar o footer em colunas Explorar, Institucional e Contato, com contraste AA e alvos de toque de pelo menos 44px.

## Arquitetura

- Criar componentes de apresentação sem acesso direto a Firebase/Supabase.
- Páginas server-side continuam consumindo as funções de dados existentes.
- `FiguraVivaTree` será um componente client-side isolado, sem dependências de domínio.
- A homepage continuará usando `HomeClient`; mudanças de conteúdo serão feitas por props e composição, não por alterações nas ações de negócio.
- Rotas novas terão metadados próprios e serão incluídas no sitemap sem remover rotas antigas.

## Restrições

- Não incorporar commits de migração Supabase, autenticação, billing, uploads, progresso, gamificação ou regras de acesso da branch remota.
- Não remover componentes utilizados por portal, admin ou recursos existentes.
- Não alterar contratos de Firestore, APIs, server actions ou tipos de domínio.
- Imagens ausentes devem possuir fallback visual e texto alternativo.
- Animações devem ser discretas, pausáveis e compatíveis com `prefers-reduced-motion`.
- A árvore não pode ficar atrás de títulos/CTAs a ponto de prejudicar contraste; usar máscara, gradiente ou área de respiro.
- A interação da árvore deve deslocar no máximo poucos pixels, sem loop permanente fora da viewport e sem dependência de WebGL/3D.

## Critérios de aceite

- Usuário consegue navegar para Instituto, Fundadora, Formações, Biblioteca, Galeria, Blog e Recursos pelo top bar.
- Hero fica visualmente mais compacto e apresenta a árvore interativa sem bloquear conteúdo ou interação.
- Conteúdo institucional removido da homepage aparece em `/instituto`.
- Cursos continuam carregando da mesma origem e o catálogo completo permanece acessível.
- Footer apresenta hierarquia mais clara em desktop e mobile.
- Menu mobile oferece `aria-expanded`, navegação por teclado e alvos mínimos de 44px; a página oferece link para pular ao conteúdo.
- Rotas públicas novas possuem `title`, `description`, canonical, Open Graph e entrada no sitemap.
- Smoke checks cobrem `/`, `/instituto`, `/instituto/fundadora`, `/formacoes`, `/recursos`, `/public-library`, `/public-gallery`, `/blog`, `/login`, `/portal` e `/admin` em larguras 375, 768, 1024 e 1440px.
- Build, lint, typecheck e testes passam sem alteração de contratos de backend.
- Testes, lint e typecheck passam sem introduzir regressões.
