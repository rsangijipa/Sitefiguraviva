# Recursos interativos

Cada experiência é um módulo do Figura Viva, nunca uma aplicação dentro do
portal. A página de Recursos é a responsável por catálogo, autenticação,
navegação e pela moldura; a experiência é responsável apenas pela prática.

## Integração de um projeto Gemini

1. Localize a experiência principal em `src/features/interactive-resources`.
   Não importe o `App.tsx`, `main.tsx`, catálogo, login ou cabeçalho standalone.
2. Copie os componentes, reducers, animações, engines e repositórios da
   experiência para `src/components/resources/apps/<recurso>/src`.
3. Exporte uma pequena ponte em `src/components/resources/apps/<recurso>` que
   receba `userId`, `user` e `onExit`. Nunca crie um usuário de demonstração.
4. Remova o cabeçalho próprio do módulo. `ResourceExperience` já fornece a
   única barra institucional com voltar e fechar.
5. Use o cliente Supabase compartilhado em `@/infrastructure/supabase/client`;
   mantenha apenas o repositório e o schema específicos do recurso.
6. Adicione a definição em `resourceCatalog.tsx` e o carregamento lazy em
   `ResourcesSection.jsx`.
7. Faça o stage ter `h-full min-h-0`; deixe apenas o viewport universal ou um
   painel interno controlar a rolagem. Canvas devem usar `overflow-hidden`.
8. Verifique teclado, Escape, foco restaurado, reduced motion, áudio desligado
   por padrão e as larguras 1440, 1024, 768, 430, 390 e 360 px.

Os controles próprios podem existir em uma toolbar abaixo da barra
institucional. Eles não devem duplicar voltar, fechar ou autenticação.
