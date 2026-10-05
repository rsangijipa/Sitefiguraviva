# Segundo lote de dependências órfãs

Foram removidas as dependências diretas `@react-three/postprocessing` (3.1.1) e `postprocessing` (6.39.4), além da dependência transitiva `n8ao` (2.0.1), que perdeu seu único consumidor. A busca nos fontes, testes, scripts, E2E e configuração do Next não encontrou referências a esses pacotes.

O grafo do lockfile confirma que `n8ao` era usado somente por `@react-three/postprocessing`. `maath` foi mantido porque também é dependência de `@react-three/drei`. Foram excluídas exatamente três entradas de instalação; nenhuma outra entrada ou versão de pacote foi alterada.

Como esses pacotes já estavam fora do grafo de imports, a limpeza reduz dependências de instalação e manutenção. Não há expectativa de redução adicional relevante no JavaScript inicial do EAD.

## Validação

A validação foi executada em uma cópia sem arquivos `.env`, com instalação nova pelo lockfile e scripts de instalação desativados.

- `npm ci --ignore-scripts`: passou, com 1.421 pacotes instalados e os três pacotes removidos ausentes.
- Lint, TypeScript e build: passaram.
- Scripts: 43 testes aprovados.
- Jest: 137 suítes e 639 testes aprovados; 7 testes pulados pela configuração existente.
- Smoke público: 7 testes aprovados em 12,4 segundos, exit code 0.
- First Load JS do curso: 397 kB; aula direta: 324 kB.
- Knip: 6 dependências candidatas restantes, contra 8 antes deste lote; nenhum import não resolvido.

O smoke usou o Chromium headless shell 1243 instalado, com configuração temporária apenas na cópia de teste. O servidor Next foi iniciado diretamente e o fixture reutilizou a porta embutida no build. O build repetiu o aviso de cache do Webpack `Unable to snapshot resolve dependencies`, sem impedir sua conclusão. Isso não valida o desempenho do cache do GitHub.

As três pastas antigas também foram retiradas do `node_modules` da workspace. A cópia temporária de validação foi descartada. O resumo está em `dependency-cleanup-02.json`; o relatório atual do Knip está em `reports/knip.json`, ignorado pelo Git.

## Limites

A jornada autenticada aguarda um ambiente de homologação. O efeito do cache de CI aguarda a publicação das mudanças locais e execuções compatíveis no GitHub.
