# Plano: alinhamento editorial dos painéis Admin e EAD

## Objetivo

Unificar a experiência visual dos painéis administrativo e EAD com a página principal, melhorando hierarquia, legibilidade, responsividade, estados de interface e sinais de progresso/gamificação sem alterar regras de negócio.

## Tarefas

1. **Fundação visual compartilhada**
   - Arquivos: `src/app/globals.css`, `src/components/ui/PanelHeader.tsx`, `src/components/ui/StatCard.tsx`.
   - Criar tokens/utilitários para superfícies editoriais, aurora sutil, títulos serifados, foco visível e cartões de métrica reutilizáveis.
   - Testes: `src/components/ui/__tests__/StatCard.test.tsx` cobrindo rótulo, valor, tendência e link acessível.

2. **Shell administrativo**
   - Arquivos: `src/app/admin/(protected)/AdminShell.tsx`, `src/components/admin/AdminPageShell.tsx`.
   - Refinar navegação, cabeçalho, breadcrumbs, busca e estados mobile usando os tokens compartilhados; garantir alvos de toque e contraste.
   - Testes: `src/components/admin/__tests__/AdminPageShell.test.tsx` para título, descrição, breadcrumbs e ações.

3. **Painel EAD e jornada**
   - Arquivos: `src/app/portal/page.tsx`, `src/components/portal/shell/DashboardShell.tsx`, `src/components/portal/shell/SidebarNav.tsx`.
   - Reorganizar hero de continuidade, métricas, jornada e conquistas em cartões consistentes; preservar gamificação e adicionar estados vazios/erro legíveis.
   - Testes: `src/app/portal/__tests__/portal-dashboard.test.tsx` para continuidade, progresso e fallback de dados.

4. **Catálogo e mídia resilientes**
   - Arquivos: `src/app/curso/page.tsx`, componentes de cards de curso e `src/components/lms/BlockRenderer.tsx`.
   - Corrigir imagens quebradas com fallback visual da marca, dimensões estáveis e texto alternativo; melhorar leitura em telas estreitas.
   - Testes: componente de imagem/card cobrindo fallback e alt text.

5. **Verificação e documentação**
   - Executar `npm test -- --runInBand`, `npm run lint` e `npm run typecheck`.
   - Fazer smoke visual local nas rotas públicas, admin e portal quando autenticadas; registrar limitações de acesso.

## Critérios de aceite

- Admin e EAD usam a mesma paleta, tipografia, raios, sombras e estados de foco da homepage.
- Layout funciona em mobile, tablet e desktop sem overflow horizontal.
- Progresso, XP, streak e estados vazios continuam legíveis e semanticamente acessíveis.
- Imagens ausentes não exibem ícone quebrado nem causam mudança brusca de layout.
- Testes, lint e typecheck passam.
