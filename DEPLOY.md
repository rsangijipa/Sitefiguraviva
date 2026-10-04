# Publicação — Instituto Figura Viva

A hospedagem informada é Vercel, com domínio registrado no UOL. O projeto usa Next.js e Supabase para cadastro, autorização, inscrições e Pix manual; ainda há consumidores legados de Firebase. A retirada de protótipos não conclui essa migração nem a plataforma EAD.

Use Node.js 24, instalação `npm ci`, comando `npm run build` e saída `.next`. Configure as variáveis de `.env.example` nos escopos corretos da Vercel; arquivos `.env`, chaves privadas e backups ficam fora do Git. `SUPABASE_SERVICE_ROLE_KEY` é exclusivamente do servidor. O primeiro Pix cobre matrícula ou primeira parcela; os dados do banco recebedor ainda precisam ser definidos.

Antes de liberar inscrições reais, siga [validação e homologação](docs/operations/release-validation.md), [credenciais e ambientes da Vercel](docs/operations/credenciais-e-vercel.md) e [pendências da auditoria](docs/audits/2026-10-04-progresso-relatorio.md). Conferir SMTP, valores comerciais, recebimento bancário e aprovação administrativa continua necessário para concluir a jornada.

Uma atualização da branch de produção pode acionar publicação automática pela integração Git/Vercel. Uma build local com fixtures comprova compilação e contratos automatizados; não comprova configuração operacional do deploy nem recebimento de pagamentos.
