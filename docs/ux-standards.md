# UX Standards & Design System

## Core Principles

1. **Clarity**: The interface should be self-explanatory. Use clear labels, not just icons.
2. **Feedback**: Every action must have a reaction (loading states, success toasts, error messages).
3. **Consistency**: Reuse system components (`Button`, `Card`, `Input`) to maintain visual and functional consistency.
4. **Accessibility**: All interactive elements must be keyboard accessible and have visible focus states.

## Design Tokens (Tailwind)

- **Primary Color**: `text-primary` (Dark Organic Brown)
- **Secondary Color**: `text-gold` (Premium Accent)
- **Backgrounds**: `bg-paper` (Warm White), `bg-surface` (Card Background)
- **Status**:
  - `text-success` / `bg-success` (Green)
  - `text-warning` / `bg-warning` (Amber)
  - `text-error` / `bg-error` (Red)

## System Components

### Loading State

Use `LoadingState` for page-level or section-level loading.

```tsx
<LoadingState message="Carregando dados..." />
```

### Error State

Use `ErrorState` for non-recoverable errors or empty results that need attention.

```tsx
<ErrorState title="Erro" message="Tente novamente." retry={reset} />
```

### Buttons

- **Primary**: Main actions (Save, Login).
- **Secondary**: Alternative actions (Cancel, Back).
- **Destructive**: Dangerous actions (Delete).
- **Ghost**: Low priority actions (Icon buttons).

### Forms

Use the `Input` component which handles label, error state, and focus rings automatically.

## Zod Schemas

All data entry points (Forms, API Inputs) must be validated using Zod schemas located in `src/contracts`.
