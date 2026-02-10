# Configuração PWA (Progressive Web App)

O portal agora é um PWA completo, permitindo instalação em dispositivos móveis e desktop.

## Arquivos Gerados

- **/public/manifest.json**: Configuração de nome, cores e ícones.
- **/public/sw.js**: Service Worker gerado automaticamente (não edite manualmente).
- **/workbox-*.js**: Estratégias de cache offline.
- **/src/app/offline**: Página de fallback quando não há conexão.

## Recursos Adicionados

1. **Fallback Offline**: Se o usuário tentar navegar sem internet, ele será redirecionado para uma página amigável (`/offline`).
2. **Banner de Instalação**: Um banner premium aparece no Portal após 3 segundos sugerindo a instalação, caso o app ainda não esteja instalado.
3. **Cache de Dados**: Cache inteligente para requisições do Firestore (NetworkFirst) e Imagens (CacheFirst).

## Ícones Necessários

Para garantir a melhor experiência, adicione os seguintes arquivos na pasta `/public/` (se ainda não existirem, o navegador usará ícones genéricos ou falhará na validação do PWA install prompt):

1. **icon-192x192.png** (Logo quadrado simples)
2. **icon-512x512.png** (Logo de alta resolução)
3. **apple-touch-icon.png** (Para iOS)

## Validação

- Rode `npm run build` para gerar e registrar o Service Worker.
- Em desenvolvimento, o PWA está desativado por padrão para não interferir no HMR (pode ser ativado em `next.config.mjs`).
