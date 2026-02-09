# Plano de Testes & Roadmap Estratégico (30/60/90 Dias)

**Projeto**: Instituto Figura Viva  
**Versão**: 1.2.0 (Post-Hardening)  
**Status**: Camada de Segurança e Certificação validada.

---

## 🧪 1. Plano de Testes (Quality Assurance)

Após as refatorações de SSoT (Single Source of Truth) e Hardening, a estratégia de testes foca em garantir que a lógica de acesso e progresso permaneça inviolável.

### 1.1 Testes Unitários (Logic Isolation)

* **Serviços Críticos**: Testar `progressService` e `certificateService` com mocks do Firestore.
  * *Objetivo*: Garantir que 100% de progresso ignore aulas não publicadas.
  * *Objetivo*: Validar o cálculo de versão do curso no certificado.
* **Server Actions**: Testar guards de autenticação e inputs (Zod validation).

### 1.2 Testes de Integração (Cross-Platform)

* **Fluxo de Matrícula**: Validar que a criação de um documento em `enrollments` libera instantaneamente o acesso aos `modules` e `lessons`.
* **Emissão de Certificado**: Simular a conclusão da última aula e verificar se a transação atômica cria o registro público e envia o evento.

### 1.3 Testes de Segurança (Pen-Testing Lite)

* **Acesso Direto**: Tentar acessar `/portal/course/[id]` com um UID que não possui matrícula ativa (deve ser barrado pelo `assertCanAccessCourse`).
* **Escrita Indevida**: Tentar atualizar `role` ou `status` via cliente Firestore (deve ser barrado pelas `firestore.rules`).

### 1.4 Testes de Performance (UX)

* **Web Vitals**: Monitoramento contínuo de LCP (Largest Contentful Paint) e FCP.
  * *Meta*: FCP < 1.5s (ajustar carregamento de assets e fontes).

---

## 🗺️ 2. Roadmap Estratégico (Evolução)

### 🚀 30 Dias: Estabilização & Lançamento Seguro

* **Performance (P0)**: Otimizar assets (logo, imagens de cursos) para formato `.webp` e implementar `Next/Image` priority na Home para fixar o FCP "needs-improvement".
* **Observabilidade (P1)**: Integrar Sentry.io para captura de erros em tempo real no servidor e cliente.
* **Legal & SSoT (P1)**: Mover Termos de Uso e Políticas de Privacidade para coleções no Firestore (permitindo edição via Dashboard sem deploy).
* **Landing Page**: Refinamento final das seções de "Depoimentos" e "Sobre a Alessandra".

### 📈 60 Dias: Automação & Escala de Turmas

* **Gestão de Turmas**: Criar a entidade `groups` no banco para agrupar alunos e permitir liberação de módulos por data (Drip Content).
* **Matrícula em Lote**: Ferramenta Admin para importar lista de alunos via CSV e gerar matrículas automáticas.
* **Notificações**: Implementar disparos de e-mail automáticos (via SendGrid/Resend) ao concluir um curso ou receber um novo certificado.
* **Dashboard Admin V2**: Gráficos de retenção e progresso médio por curso.

### ✨ 90 Dias: Experiência Premium & IA

* **Checkout Integrado (P0)**: Integração nativa com Stripe/MercadoPago para venda automática de cursos (Webhooks sincronizando com `enrollments`).
* **LMS Gamificado**: Implementar sistema de "Conquistas" (Badges) baseadas no progresso e participação na comunidade.
* **IA Tutor Figura Viva**: Utilizar LLMs para gerar resumos automáticos de aulas e facilitar a busca de conceitos dentro do conteúdo transcrito dos vídeos.
* **App Nativo (PWA)**: Otimizar o portal para instalação em dispositivos mobile, removendo frames do browser para uma experiência mais imersiva.
* **Checkout Integrado (P0)**: Integração nativa com Stripe/MercadoPago para venda automática de cursos (Webhooks sincronizando com `enrollments`).
* **LMS Gamificado**: Implementar sistema de "Conquistas" (Badges) baseadas no progresso e participação na comunidade.
* **IA Tutor Figura Viva**: Utilizar LLMs para gerar resumos automáticos de aulas e facilitar a busca de conceitos dentro do conteúdo transcrito dos vídeos.
* **App Nativo (PWA)**: Otimizar o portal para instalação em dispositivos mobile, removendo frames do browser para uma experiência mais imersiva.

---

## 🚩 3. Critérios de Go/No-Go (Checklist Final)

Para cada novo lançamento (ex: Lançamento de Nova Turma):

* [ ] **Data Integrity**: O script de auditoria de matrículas retornou zero inconsistências?
* [ ] **Security Rules**: `firebase deploy --only firestore:rules` executado e verificado?
* [ ] **Mobile Preview**: O certificado formatado v1.2 abre e imprime corretamente em iOS/Android?
* [ ] **Admin Audit**: As ações de teste foram registradas corretamente em `audit_logs`?

---

### 📝 Notas Adicionais

*Assinado: Antigravity AI*
