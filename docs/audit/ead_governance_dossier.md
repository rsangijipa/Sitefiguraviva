# 📁 DOSSIÊ EXECUTIVO DE GOVERNANÇA: Progresso & Certificação

**Data:** 07/02/2026  
**Status:** Auditado (Versão 1.0)  
**Nível de Maturidade Atual:** Médio-Alto (Transicional para Enterprise)

---

## 📁 1. Resumo Executivo

O sistema Figura Viva apresenta uma base sólida de engenharia no gerenciamento de progresso. A implementação atual utiliza **Server Actions em Transações Atômicas**, o que o coloca acima da maioria dos MVPs de mercado (que escrevem direto do cliente). No entanto, para atingir o nível **Enterprise/Universitário**, faltam mecanismos de versionamento de conteúdo e uma camada de certificação imutável com validação de regras complexas.

### Principais Riscos Encontrados

- **Red Flags de Sincronicidade**: Existe uma duplicidade de arquivos de ação (`src/app/actions/progress.ts` vs `src/actions/progress.ts`), o que pode levar a divergências lógicas se não for unificado.
- **Estruturação de Dados**: O progresso é armazenado em uma coleção separada, mas o resumo de porcentagem reside no documento de matrícula. Mudanças estruturais no curso (adicionar/remover aulas) podem invalidar porcentagens já calculadas se não houver um `snapshot` ou versionamento.

---

## 📁 2. Mapa de Sincronicidade

| Etapa | Ação Admin | Registro Sistema | Visão Aluno | Validação |
| :--- | :--- | :--- | :--- | :--- |
| **Publicação** | `isPublished = true` | Firestore (`courses/modules`) | `useEnrolledCourse` filtra por `isPublished` | Bloqueio Server-side no Router |
| **Consumo** | - | - | Player carrega via ID | Token de Sessão + Enrollment check |
| **Conclusão** | - | `updateLessonProgress` (Transação) | Marcação visual persistente | Checagem de pertença ao curso (Anti-Spoof) |
| **Resumo** | - | `enrollment.progressSummary` | Porcentagem na dashboard | Cálculo atômico (Incremento) |
| **Certificado** | Define regras | (Pendente Implementação) | Botão habilitado | Revalidação Total das Sub-aulas |

---

## 📁 3. Pontos de Falha (Red Flags)

1. **Mudança Estrutural Pos-Matrícula**: Se o Admin adiciona uma aula a um curso que o aluno já "concluiu" (100%), o sistema hoje incrementa o total, mas o estado de "conclusão total" do curso precisa de um trigger limpo para retroceder ou manter o direito adquirido.
2. **Divergência de Cache (Client-side)**: O `useProgress` usa **Dexie (IndexedDB)** para offline, sincronizando depois. Existe um risco inerente de race conditions se o aluno usar múltiplos dispositivos simultaneamente sem conexão.
3. **Unicidade do Certificado**: Sem um `integrityCheck` periódico, um aluno poderia teoricamente forçar uma emissão se as regras de escrita do Firestore no certificado estiverem frouxas (necessário Firebase Rules robustas).

---

## 📁 4. Comparação com EAD Universitário

- **Consistência Atômica**: ✅ **Aprovado**. Uso de transações para atualizar progresso e sumário.
- **Rastrabilidade (Audit Logs)**: ⚠️ **Parcial**. Existe um barramento de eventos (`publishEvent`), mas precisa ser persistido em coleção de auditoria imutável.
- **Versionamento de Conteúdo**: ❌ **Crítico**. Grandes EADs usam snapshots da estrutura do curso no momento da matrícula ou conclusão. Aqui a estrutura é "viva".
- **Idempotência**: ✅ **Aprovado**. Salvar a mesma aula concluída não gera overhead ou corrupção de dados.

---

## 📁 5. Recomendações Técnicas

### P0 (Bloqueador / Segurança)

- **Unificação de Ações**: Deletar `src/app/actions/progress.ts` e manter apenas `src/actions/progress.ts`, garantindo que toda a lógica de segurança e auditoria esteja centralizada.
- **Firebase Security Rules**: Bloquear escrita direta na coleção `progress` e `enrollments` pelo cliente; liberar apenas via Server Actions (usuário admin da SDK).

### P1 (Alta / Enterprise)

- **Snapshots de Conclusão**: Ao atingir 100%, salvar um JSON da estrutura do curso naquele momento no documento de Conclusão. Isso blinda o certificado contra futuras alterações no curso.
- **Auditoria Imutável**: Criar a coleção `audit_logs` para registrar `LESSON_COMPLETED` com metadados do navegador/IP.

---

## 📁 6. Conclusão Final

O sistema **pode** emitir certificados com segurança razoável hoje, desde que a validação final de 100% seja feita no servidor no momento da emissão.  
**Próximo Passo**: Implementar o "Contrato de Verdade" para formalizar as invariantes e evitar que futuras manutenções quebrem a integridade acadêmica da plataforma.
