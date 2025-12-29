# DOSSIÊ TÉCNICO & AUDITORIA DE PROJETO - INSTITUTO FIGURA VIVA

Data: 29/12/2025 | Versão: 1.0 | Status: CRÍTICO (Ação Imediata Necessária)

## 1. RESUMO EXECUTIVO

O projeto possui uma base arquitetural sólida e moderna (React 19, Vite 7), com um design system sofisticado e consistente. No entanto, enfrenta um **bloqueio crítico de integridade de dados**: a desconexão entre as regras de segurança do Firebase e o Frontend está impedindo o carregamento de conteúdo essencial (Cursos, Blog), resultando em seções vazias para o usuário final.

---

## 2. MAPEAMENTO DE RISCOS & QUALIDADE (0-100%)

### 🔴 ARQUITETURA DE DADOS (Nota: 40/100) - Risco Crítico

**Diagnóstico:**
O "motor" (Firebase) foi desconectado do "chassi" (Frontend) devido a um hardening de segurança prematuro ou mal configurado nas `firestore.rules`.

* **Problema:** Erro `PERMISSION_DENIED` generalizado. O site não consegue ler a lista de cursos nem posts do blog.
* **Impacto:** Usuário vê seções "em branco" ou loaders infinitos. Perda total de funcionalidade dinâmica.
* **Correção:** É imperativo reverter ou ajustar as regras de segurança para `allow read: if true` nas coleções públicas (`courses`, `gallery`, `mediators`, `blog_posts`).

### 🟡 SEGURANÇA (Nota: 60/100) - Risco Médio

**Diagnóstico:**

* **Vulnerabilidade:** Se as regras forem abertas para escrita (`allow write: if true`), qualquer bot pode apagar ou inundar o banco de dados.
* **Exposição:** Chaves de API no `.env` estão visíveis no bundle do cliente (padrão em SPAs, mas requer restrições de domínio no console do Google Cloud).
* **Ação:** Implementar autenticação real para escrita (Admin apenas) e manter leitura pública.

### 🟢 UX/UI & DESIGN SYSTEM (Nota: 95/100) - Excelente

**Diagnóstico:**

* **Estética:** Design premium, paleta `Deep Maroon/Gold/Paper` consistente.
* **Interatividade:** Microinterações refinadas (hover, focus, transições do Framer Motion).
* **Responsividade:** Layout fluido, menu mobile funcional e tipografia fluida (`clamp()`).
* **Melhoria:** Falta um "Empty State" elegante. Quando não há cursos, o espaço fica vazio em vez de dizer "Novas turmas em breve".

### 🟡 ACESSIBILIDADE (WCAG) (Nota: 75/100) - Bom

**Diagnóstico:**

* **Faltas:** Botões de ícone (como o "Play" do som ambiente) sem `aria-label`. Usuários de leitor de tela ouvirão apenas "botão".
* **Contraste:** Texto cinza claro sobre fundo bege em algumas descrições pode falhar em testes de contraste AA.
* **Semântica:** Ótimo uso de tags semânticas HTML5 (`main`, `nav`, `article`).

### 🟢 PERFORMANCE (Nota: 90/100) - Ótimo

**Diagnóstico:**

* **Velocidade:** LCP (Largest Contentful Paint) muito rápido devido ao Vite e otimização de imagens estáticas.
* **Otimização:** Código bem dividido (`code-splitting` automático do Vite).
* **Ponto de Atenção:** O carregamento inicial depende de leituras do Firebase. Se a conexão for lenta, o site pode "piscar". Recomenda-se Skeleton Screens.

---

## 3. PROPOSTA DE EVOLUÇÃO (BACKLOG PRIORIZADO)

### FASE 1: CORREÇÃO & ESTABILIDADE (Imediato - Hoje)

1. **[CRÍTICO] Ajustar Permissões Firebase:**
    * Editar `firestore.rules` para permitir **leitura pública** (`allow read: if true;`) em coleções de conteúdo.
    * Manter escrita restrita (`allow write: if request.auth != null;`).
2. **[HIGH] Validar Admin de Uploads:**
    * Garantir que o novo modal de cursos (com drag-and-drop) esteja enviando imagens para o bucket correto (`appspot.com` vs `firebasestorage.app`).
3. **[MEDIUM] Fallback de Erro:**
    * Adicionar tratamento de erro no `AppContext`: se o Firebase falhar, mostrar mensagem amigável "Manutenção Programada" ou dados cacheados, em vez de tela branca.

### FASE 2: EXPERIÊNCIA & REFINAMENTO (Curto Prazo)

4. **[UX] Skeleton Loading:**
    * Criar componentes de esqueleto (formas cinzas pulsantes) para os cards de curso enquanto carregam.
2. **[ACC] Correção de ARIA:**
    * Adicionar `aria-label="Tocar som ambiente"` no botão de áudio.
    * Revisar contraste de textos secundários.
3. **[SEO] Meta Tags Dinâmicas:**
    * Implementar `react-helmet-async` para mudar o Título e Descrição da página ao abrir um Curso ou Post de Blog (essencial para compartilhamento no WhatsApp/LinkedIn).

### FASE 3: ESCALABILIDADE (Médio Prazo)

7. **Dashboard Completo:**
    * Finalizar as abas "Galeria" e "Configurações" no painel administrativo.
    * Paginacão nas tabelas de dados para suportar centenas de alunos/cursos.
2. **PWA (Progressive Web App):**
    * Transformar o site em instalável para acesso offline básico (ler artigos salvos).

---

## 4. DETALHES TÉCNICOS DA AUDITORIA

| Área | Status | Notas Técnicas |
| :--- | :---: | :--- |
| **Frontend** | ✅ | React 19 estável, Componentização limpa. |
| **Backend** | ⚠️ | Firebase configurado, mas regras bloqueantes. |
| **Storage** | ⚠️ | Bucket duplo (`firebasestorage` vs `appspot`). Precisa padronizar. |
| **Linting** | ✅ | Sem erros de sintaxe ou imports quebrados visíveis. |
| **Mobile** | ✅ | Menu hambúrguer funcional, áreas de toque adequadas. |

---

**Recomendação Final:** O produto está "pronto para voar", mas está com o freio de mão (permissões de banco) puxado. Liberando o acesso de leitura, a aplicação se torna 100% funcional.
