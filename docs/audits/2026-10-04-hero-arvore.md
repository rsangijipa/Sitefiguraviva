# Ajustes da árvore na abertura da homepage

- Desktop: árvore completa à direita, com área reservada e sem sobreposição ao texto.
- Tablet: duas colunas com dimensões proporcionais; celular: árvore centralizada abaixo dos botões.
- Fundo institucional com intensidade reduzida, degradê suave e halo discreto. Cores da árvore menos saturadas e vento mais calmo, sem folhas soltas atravessando a página.
- A animação pausa fora da área visível, quando a aba fica oculta e com a preferência por movimento reduzido. Atualizações limitadas a 24 quadros por segundo no celular e 30 no desktop.

## Conferência

Oito cenários de navegador passaram: desktop, notebook, tablet, celular, celular pequeno, orientação horizontal, tema escuro e movimento reduzido. Sem sobreposição de árvore e texto, transbordamento horizontal ou erros JavaScript. A animação em funcionamento e as pausas foram verificadas no navegador. [Dados de verificação](./2026-10-04-hero-evidence/verification.json).

ESLint aprovado nos arquivos alterados. A verificação global TypeScript encontrou um erro fora destes ajustes, em src/lib/metrics/kpi.ts:498: o filtro de cursos usa o status published, que não pertence ao tipo CourseStatus.
