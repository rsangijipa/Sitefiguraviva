# 📱 Sprint 4 - Mobile & Observability

**Data:** 09/02/2026  
**Duração Estimada:** 3-5 horas  
**Status:** 🟡 Em Progresso

---

## 🎯 Objetivos Sprint 4

### 1. Mobile Responsiveness (Prioridade Alta)

- [ ] Sidebar responsivo (mobile drawer)
- [ ] Navigation touch-friendly
- [ ] Cards e grids adaptáveis
- [ ] Forms mobile-optimized
- [ ] Typography scaling
- [ ] Viewport meta tags

### 2. Sentry Error Tracking (Prioridade Alta)

- [ ] Configurar Sentry.io
- [ ] Integração Next.js
- [ ] Source maps (production)
- [ ] User context
- [ ] Performance monitoring
- [ ] Release tracking

### 3. PWA Essentials (Prioridade Média)

- [ ] Manifest.json
- [ ] Service Worker (next-pwa)
- [ ] Offline fallback
- [ ] Icons (múltiplos tamanhos)
- [ ] Install prompt
- [ ] Theme color

---

## 📊 Análise Mobile (Pré-Sprint)

### Componentes Críticos para Mobile

**Admin:**

- `Sidebar.tsx` - Precisa drawer mobile
- `Navbar.tsx` - Hamburger menu
- `CourseManagement` - Tables responsivas

**Portal:**

- `Portal layout` - Sidebar mobile
- `QuizTaker` - Touch-friendly
- `Dashboard cards` - Grid adaptável

**Common:**

- `Forms` - Input sizes
- `Modals` - Full-screen mobile
- `Buttons` - Touch targets (44px min)

---

## 🔧 Stack Técnico

### Mobile

- **CSS:** Tailwind responsive utilities
- **Breakpoints:** sm (640px), md (768px), lg (1024px)
- **Testing:** Chrome DevTools mobile emulation

### Observability

- **Sentry:** @sentry/nextjs
- **Plan:** Free tier (5k errors/month)
- **Source Maps:** Enabled

### PWA

- **next-pwa:** Service worker generator
- **Icons:** 192x192, 512x512
- **Offline:** Static pages cached

---

## 📋 Checklist

### Phase 1: Mobile Responsiveness

- [ ] Install Tailwind plugins (optional)
- [ ] Create mobile Sidebar drawer
- [ ] Responsive navigation
- [ ] Optimize forms
- [ ] Test on real device

### Phase 2: Sentry

- [ ] Create Sentry account
- [ ] Install @sentry/nextjs
- [ ] Configure sentry.client.config.ts
- [ ] Configure sentry.server.config.ts
- [ ] Test error reporting

### Phase 3: PWA

- [ ] Install next-pwa
- [ ] Create manifest.json
- [ ] Generate icons
- [ ] Configure service worker
- [ ] Test install prompt

---

**Iniciando implementação...**
