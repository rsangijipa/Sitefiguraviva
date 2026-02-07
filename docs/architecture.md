# Architecture Overview

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Design Tokens
- **State Management**: React Context (minimal) + Server State (React Query / SWR patterns)
- **Auth**: Firebase Auth (Client) + Firebase Admin (Server/Edge) + Custom RBAC
- **Database**: Firestore (NoSQL)
- **Testing**: Jest (Unit) + Playwright (E2E)

## Key Directories

- `src/app`: Routes and Page components
- `src/components/system`: Standardized UX components (`Loading`, `Error`, `Empty`)
- `src/components/ui`: Base design system components
- `src/lib`: Core utilities (Auth, Telemetry, Errors)
- `src/contracts`: Data schemas (Zod)

## Design Patterns

- **Fail-Fast**: Environment and Contracts are validated at runtime boundaries.
- **System Components**: Loading and Error states are handled by standardized components to ensure UX consistency.
- **RBAC**: Role-based access control is enforced at both Edge (Middleware/Server) and Client (Components).

## Observability

- **Telemetry**: Centralized `src/lib/telemetry.ts` facade.
- **Errors**: Typed error classes in `src/lib/errors.ts`.
