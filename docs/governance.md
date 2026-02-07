# Governance & Definition of Done (DoD)

## 1. Definition of Done (DoD)

A task or feature is considered "Done" only when:

- [ ] **Code**: Compiles without errors (`npm run build` passes).
- [ ] **Linting**: No lint warnings or errors (`npm run lint` passes).
- [ ] **Tests**:
  - Unit tests pass (if applicable).
  - E2E smoke tests pass (`npm run test:e2e`).
- [ ] **UX/UI**:
  - Uses Design System tokens and components.
  - Responsive on Mobile and Desktop.
  - Has Loading, Error, and Empty states handled.
- [ ] **Security**:
  - API inputs validated with Zod.
  - RBAC checks applied (if Admin/Protected).

## 2. Deprecation Policy

- **Code**: Deprecated functions must be marked with `@deprecated` JSDoc tag and a migration path.
- **API**: Breaking API changes require versioning (e.g., `/api/v2`). Old versions are supported for 1 release cycle.
- **Features**: Deprecated features are hidden behind a Feature Flag (`enable=false`) before code removal.

## 3. Version Control

- **Commits**: Follow Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).
- **Branches**:
  - `main`: Production-ready code.
  - `develop` (optional): Integration branch.
  - `feat/*`: New features.
  - `fix/*`: Bug fixes.

## 4. Performance Budget

- **LCP (Largest Contentful Paint)**: < 2.5s
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FID (First Input Delay)**: < 100ms
*Violations should block merging if detected in CI.*
