# Component Core

`src/components/core` is the design-system foundation for reusable, product-safe UI primitives.

## Feedback

Use `core/feedback` for shared loading, empty and error states. Legacy imports in `components/ui` and `components/system` are compatibility adapters, so existing screens can migrate gradually without behavior changes.

```tsx
import { EmptyState, ErrorState, LoadingState } from "@/components/core/feedback";

<EmptyState title="Nada por aqui" description="Nenhum item encontrado." />;
<ErrorState retry={reload} />;
<LoadingState message="Carregando..." />;
```

Guidelines:

- Keep domain-specific text at the screen level.
- Prefer `retry`/`reset` callbacks over embedding side effects in feedback components.
- Use `variant="surface"` for framed content and `variant="page"` for full page error states.
- Preserve accessibility defaults: loading uses `role="status"`, errors use `role="alert"`.
