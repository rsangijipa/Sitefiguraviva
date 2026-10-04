# Arquitetura atual

Supabase Auth/Postgres/Storage é fonte canônica alvo. Todo domínio novo usa
repositórios server-only em `src/features`. Firebase é legado em migração e
nunca pode receber novos fluxos ou ser importado por Client Components.

## Contratos

- UI envia intenção. Server Action/API valida sessão, autorização e entidade canônica.
- Avaliações práticas usam bucket privado `assessment-submissions`. Banco guarda
  somente `storagePath` e metadados; rota autorizada gera URL de 10 minutos.
- `course-assets` contém apenas assets públicos não sensíveis.
- Progresso, XP e certificados devem ser derivados de transições persistidas,
  nunca de IDs, status ou eventos declarados pelo browser.
- Logs não incluem cookies, tokens, respostas livres ou conteúdo terapêutico.

## Migração Firebase

Migrar um domínio por vez com script idempotente, relatório de totais e
reconciliação sem divergências. Trocar todas as leituras/escritas do domínio
para Supabase antes de apagar Firebase, regras, variáveis e dependências.

`npm run migrate:assessment-attachments` migra anexos legados. Use `DRY_RUN=1`
primeiro. O script nunca remove objetos públicos; remover somente após relatório
sem falhas e janela de recuperação aprovada.
