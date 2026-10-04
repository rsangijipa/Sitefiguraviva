# Contributing to Site Figura Viva

Thank you for your interest in contributing! We follow strict enterprise governance standards.

## Development Workflow

1. **Fork and Clone**: Fork the repo and clone it locally.
2. **Branching**: Create a branch for your feature or fix.
    - Format: `type/short-description` (e.g., `feat/login-page`, `fix/header-bug`).
3. **Install**: Run `npm ci` to install dependencies.
4. **Code**: Make your changes.
5. **Test**:
    - Run `npm run lint` to check for style issues.
    - Run `npm run typecheck` to verify types.
    - Run `npm test` (if applicable) to ensure no regressions.
6. **Commit**:
    - We enforce **Conventional Commits**.
    - Format: `<type>(<scope>): <subject>`
    - Example: `feat(auth): add google login support`
    - **Invalid**: `wip`, `temp`, `fix bug`.
7. **Push**: Push your branch. The `pre-push` hook will run checks.
8. **Pull Request**: Open a PR to `main`. Fill out the template completely.

## Standards

- **Linting**: ESLint + Prettier.
- **Tests**: Jest / Playwright (future).
- **Types**: TypeScript strict mode.
