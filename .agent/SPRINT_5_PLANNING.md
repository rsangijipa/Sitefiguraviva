# 📊 Sprint 5 - Analytics & Advanced Features

**Data:** 09/02/2026  
**Duração Estimada:** 1 semana  
**Status:** 🟡 Em Planejamento

---

## 🎯 Objetivos Sprint 5

### Prioridade 1: Analytics Dashboard (Alta) 🔥

**Por que:** Conformidade CREF/MEC + Gestão Pedagógica

- [ ] Student Performance Analytics
- [ ] Assessment Statistics Dashboard
- [ ] Course Progress Reports
- [ ] Certificate Issuance Reports
- [ ] Export to Excel/PDF

**Impacto:** 95% → 100% conformidade CREF/MEC

---

### Prioridade 2: Question Bank (Média)

**Por que:** Eficiência do Admin + Reutilização

- [ ] Question Library (reusable questions)
- [ ] Tags & Categories
- [ ] Import/Export questions
- [ ] Question difficulty rating
- [ ] Usage tracking

**Impacto:** 50% redução de tempo criando quizzes

---

### Prioridade 3: Certificate PDF Export (Alta) 🔥

**Por que:** Conformidade Legal + UX

- [ ] Generate PDF certificates
- [ ] Digital signature (QR code validation)
- [ ] Batch generation (admin)
- [ ] Email delivery
- [ ] Print-ready format

**Impacto:** Certificação válida legalmente

---

### Prioridade 4: Advanced Features (Baixa)

- [ ] Blockchain certification (NFT)
- [ ] Live classes integration (Zoom/Meet)
- [ ] Gamification (badges, points)
- [ ] Discussion forums v2
- [ ] Mobile app (React Native)

---

## 📋 Plano de Execução

### Fase 1: Analytics Dashboard (2-3 dias)

**Objetivo:** Visão completa do desempenho dos alunos

#### 1.1 Data Models

```typescript
// src/types/analytics.ts
interface StudentAnalytics {
  userId: string;
  courseId: string;
  totalAssessments: number;
  completedAssessments: number;
  averageScore: number;
  passRate: number;
  timeSpent: number; // minutes
  lastActive: Timestamp;
}

interface CourseAnalytics {
  courseId: string;
  enrolledStudents: number;
  activeStudents: number;
  completionRate: number;
  averageProgress: number;
  certificatesIssued: number;
}
```

#### 1.2 Components

- `AdminAnalyticsDashboard.tsx` - Overview
- `StudentPerformanceChart.tsx` - Charts (recharts)
- `AssessmentStatsTable.tsx` - Detailed stats
- `ExportButton.tsx` - Excel/PDF export

#### 1.3 Services

- `analyticsService.ts` - Aggregate data from Firestore
- Server Actions para reports pesados

---

### Fase 2: Certificate PDF (1-2 dias)

**Objetivo:** Gerar certificados oficiais

#### 2.1 Stack Técnico

- **@react-pdf/renderer** - Generate PDFs
- **QR Code** - qrcode.react
- **Template:** Design profissional

#### 2.2 Implementação

```typescript
// src/lib/certificateGenerator.ts
import { Document, Page, Text, Image, StyleSheet } from '@react-pdf/renderer';

const CertificateTemplate = ({ student, course, completedAt }) => (
  <Document>
    <Page size="A4" orientation="landscape">
      {/* Header com logo */}
      {/* Nome do aluno (fonte grande) */}
      {/* Texto certificação */}
      {/* QR Code para validação */}
      {/* Assinatura digital */}
    </Page>
  </Document>
);
```

#### 2.3 Features

- Preview antes de gerar
- Download individual
- Batch download (admin)
- Email automático ao completar
- QR code → /verify/[certId]

---

### Fase 3: Question Bank (1-2 dias)

**Objetivo:** Biblioteca reutilizável de questões

#### 3.1 Data Model

```typescript
interface QuestionBankItem {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'essay' | 'practical';
  title: string;
  content: string;
  tags: string[]; // ['anatomia', 'iniciante', 'teoria']
  difficulty: 1 | 2 | 3 | 4 | 5;
  createdBy: string;
  usageCount: number;
  lastUsed?: Timestamp;
}
```

#### 3.2 Components

- `QuestionBankLibrary.tsx` - Browse & search
- `QuestionBankEditor.tsx` - Add/edit questions
- `QuestionImporter.tsx` - Bulk import (CSV/JSON)

---

## 💰 Custo Estimado

### Analytics

- **Firestore queries:** Agregações pesadas
- **Monthly cost:** ~$5-10 para 100 alunos
- **Alternativa:** Firebase Extensions (Analytics)

### Certificate PDF

- **@react-pdf/renderer:** Grátis
- **Storage:** ~$0.026/GB (Firebase)
- **Monthly cost:** ~$2 para 1000 certificados

### Question Bank

- **Firestore:** +1000 docs
- **Monthly cost:** ~$1

**Total Sprint 5:** ~$8-13/mês adicional

---

## 🧪 Critérios de Aceite

### Analytics Dashboard

- [ ] Ver lista de alunos por curso com scores
- [ ] Gráfico de completion rate (últimos 30 dias)
- [ ] Exportar relatório Excel com todos os dados
- [ ] Ver detalhes individuais de cada aluno
- [ ] Performance por assessment (% de acertos)

### Certificate PDF

- [ ] Gerar PDF profissional (A4 landscape)
- [ ] QR code funcional (validação online)
- [ ] Download automático ao completar curso
- [ ] Admin pode gerar em batch
- [ ] Email com certificado anexo

### Question Bank

- [ ] Criar questão e salvar no banco
- [ ] Buscar por tag/difficulty
- [ ] Reutilizar questão em múltiplas avaliações
- [ ] Ver quantas vezes foi usada
- [ ] Importar 50 questões via CSV

---

## 📊 Priorização Recomendada

Considerando:

- Conformidade CREF/MEC
- Impacto no usuário
- Complexidade técnica

### Ordem Sugerida

1. **Certificate PDF** (2 dias) - Maior impacto legal ⚖️
2. **Analytics Dashboard** (3 dias) - Conformidade + gestão 📊
3. **Question Bank** (2 dias) - Eficiência admin 🏦

**Total:** ~7 dias (1 semana útil)

---

## 🚀 Starter Task

**Vamos começar com Certificate PDF?**

Razões:

- ✅ Maior impacto imediato
- ✅ Requisito legal CREF/MEC
- ✅ UX completa (aluno recebe certificado)
- ✅ Relativamente simples (2 dias)
- ✅ Bloqueia marketing ("certificado válido!")

**Ou prefere Analytics Dashboard primeiro?**

Razões:

- ✅ Visão do negócio
- ✅ Gestão pedagógica
- ✅ Compliance CREF/MEC
- ✅ Mais complexo (3 dias)

---

**Qual você quer implementar primeiro?**

A) **Certificate PDF** (impacto imediato, mais simples)  
B) **Analytics Dashboard** (gestão, mais complexo)  
C) **Ambos em paralelo** (eu faço estrutura, você personaliza)  
D) **Outro foco** (me diga o que)
