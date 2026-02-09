# Configuração PWA (Progressive Web App)

O portal agora é um PWA completo, permitindo instalação em dispositivos móveis e desktop.

## Arquivos Gerados

- **/public/manifest.json**: Configuração de nome, cores e ícones.
- **/public/sw.js**: Service Worker gerado automaticamente (não edite manualmente).
- **/workbox-*.js**: Estratégias de cache offline.

## Ícones Necessários

Para garantir a melhor experiência, adicione os seguintes arquivos na pasta `/public/` (se ainda não existirem, o navegador usará ícones genéricos ou falhará na validação do PWA install prompt):

1. **icon-192x192.png** (Logo quadrado simples)
2. **icon-512x512.png** (Logo de alta resolução)
3. **apple-touch-icon.png** (Para iOS)

## Validação

- Rode `npm run build` para gerar e registrar o Service Worker.
- Em desenvolvimento, o PWA está ativado (configurado em `next.config.mjs`).
