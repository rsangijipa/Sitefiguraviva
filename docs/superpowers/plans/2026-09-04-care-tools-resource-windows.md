# Care Tools Resource Windows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Place all four care tools under one resource-app directory, open them in one standardized responsive window, and replace the legacy feelings tree with the supplied refactored 3D emotion tree.

**Architecture:** `ResourcesSection` remains the selector and owns the active resource key. A new `ResourceWindow` wraps the existing modal primitives and supplies one shared viewport and exit controls. Each application lives below `src/components/resources/apps`; the supplied nested Next.js tree is converted into an embeddable feature whose server routes live in the host application.

**Tech Stack:** Next.js 15, React 19, TypeScript/JavaScript, Tailwind CSS 3, Framer Motion, React Three Fiber, Three.js, Jest and Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-04-care-tools-resource-windows-design.md`

## Global Constraints

- The shared resource window uses a maximum height of 90vh and preserves mobile safe areas.
- Only one global pair of Back/Close controls is rendered for every care tool.
- The supplied `src/components/arvoredasemocoes` implementation replaces `FeelingsTree.tsx` and `TreeVisualization.jsx` completely.
- Existing user changes in `tsconfig.json`, `.claude/settings.local.json`, and the supplied emotion-tree directory must not be overwritten accidentally.
- Clinical copy and application logic remain unchanged except where integration requires new paths or viewport behavior.

---

### Task 1: Shared resource-window contract

**Files:**
- Create: `src/components/resources/ResourceWindow.tsx`
- Create: `src/components/resources/__tests__/ResourceWindow.test.tsx`
- Modify: `src/components/ui/Modal.tsx`

**Interfaces:**
- Consumes: `Modal`, `ModalContent`, and `ModalBody` from `@/components/ui/Modal`.
- Produces: `ResourceWindow({ isOpen, title, onClose, children }: ResourceWindowProps)`.

- [ ] **Step 1: Write the failing window tests**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { ResourceWindow } from "../ResourceWindow";

it("renders one named resource dialog and closes from either global control", () => {
  const onClose = jest.fn();
  render(<ResourceWindow isOpen title="SomaScan" onClose={onClose}><div>app</div></ResourceWindow>);
  expect(screen.getByRole("dialog", { name: "SomaScan" })).toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: /voltar|fechar/i })).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Fechar SomaScan" }));
  expect(onClose).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run the focused test and verify the missing-module failure**

Run: `npm test -- src/components/resources/__tests__/ResourceWindow.test.tsx --runInBand`

Expected: FAIL because `ResourceWindow` does not exist.

- [ ] **Step 3: Add accessible naming support to the modal root**

Extend `ModalProps` with `ariaLabel?: string` and render `aria-label={ariaLabel}` on the element with `role="dialog"`. Preserve every existing caller by keeping the property optional.

- [ ] **Step 4: Implement the shared wrapper**

```tsx
export interface ResourceWindowProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function ResourceWindow({ isOpen, title, onClose, children }: ResourceWindowProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel={title}>
      <ModalContent size="full" className="h-[90dvh] max-h-[90dvh] w-[min(96vw,1440px)] rounded-[1.5rem] bg-paper p-0">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[70] flex items-center justify-between p-3 sm:p-4">
          <button className="pointer-events-auto" aria-label={`Voltar de ${title}`} onClick={onClose}>Voltar</button>
          <button className="pointer-events-auto" aria-label={`Fechar ${title}`} onClick={onClose}>Fechar</button>
        </div>
        <ModalBody className="min-h-0 overflow-hidden bg-paper p-0 [&>div]:h-full [&>div]:p-0">
          <div className="h-full min-h-0">{children}</div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
```

Use the site’s existing button colors, icons, focus rings, backdrop treatment, safe-area padding, and Portuguese labels in the final implementation.

- [ ] **Step 5: Run the focused test**

Run: `npm test -- src/components/resources/__tests__/ResourceWindow.test.tsx --runInBand`

Expected: PASS.

---

### Task 2: Organize the three existing applications

**Files:**
- Move: `src/components/resources/BreathingApp.jsx` → `src/components/resources/apps/breathing/BreathingApp.jsx`
- Move: `src/components/resources/BreathingAnimation.jsx` → `src/components/resources/apps/breathing/BreathingAnimation.jsx`
- Move: `src/components/resources/PaperCard.jsx` → `src/components/resources/apps/breathing/PaperCard.jsx`
- Move: `src/components/resources/constants.js` → `src/components/resources/apps/breathing/constants.js`
- Move: `src/components/resources/MentalHealthQuiz.jsx` → `src/components/resources/apps/mental-health-quiz/MentalHealthQuiz.jsx`
- Move: `src/components/somascan/**` → `src/components/resources/apps/soma-scan/**`
- Create: `src/components/resources/apps/__tests__/app-shell-contract.test.tsx`

**Interfaces:**
- Consumes: available-height container supplied by `ResourceWindow`.
- Produces: default components `BreathingApp`, `MentalHealthQuiz`, and `SomaScan` that fill their parent and expose no global close control.

- [ ] **Step 1: Add a contract test for duplicate exit controls and parent sizing**

Mock large child views where necessary and assert that each root has `h-full`/`min-h-0` behavior and does not render a button whose purpose is to close the resource window.

- [ ] **Step 2: Run the contract test and verify it fails against current viewport roots**

Run: `npm test -- src/components/resources/apps/__tests__/app-shell-contract.test.tsx --runInBand`

Expected: FAIL because SomaScan uses `h-screen` and Respiration/Quiz render their own exit controls.

- [ ] **Step 3: Move the files using their existing dependency groupings**

Update only relative imports affected by the moves. Keep SomaScan’s `components`, `services`, and type files nested below `apps/soma-scan`.

- [ ] **Step 4: Normalize application roots**

Replace `h-screen` and modal-sized minimum heights with `h-full min-h-0 w-full`. Remove `onClose`/`onCancel` branches that only duplicate the global resource close action; retain internal Back actions that navigate between an app’s own steps.

- [ ] **Step 5: Run the contract test**

Run: `npm test -- src/components/resources/apps/__tests__/app-shell-contract.test.tsx --runInBand`

Expected: PASS.

---

### Task 3: Convert the supplied emotion tree into a host feature

**Files:**
- Move/adapt: `src/components/arvoredasemocoes/components/3d/**` → `src/components/resources/apps/emotion-tree/components/3d/**`
- Move/adapt: `src/components/arvoredasemocoes/components/ui/**` → `src/components/resources/apps/emotion-tree/components/ui/**`
- Move/adapt: `src/components/arvoredasemocoes/components/experience/ExperienceRoot.tsx` → `src/components/resources/apps/emotion-tree/EmotionTreeApp.tsx`
- Move/adapt: `src/components/arvoredasemocoes/data/**` → `src/components/resources/apps/emotion-tree/data/**`
- Move/adapt: `src/components/arvoredasemocoes/hooks/**` → `src/components/resources/apps/emotion-tree/hooks/**`
- Move/adapt: `src/components/arvoredasemocoes/lib/**` → `src/components/resources/apps/emotion-tree/lib/**`
- Move/adapt: `src/components/arvoredasemocoes/store/**` → `src/components/resources/apps/emotion-tree/store/**`
- Move/adapt: `src/components/arvoredasemocoes/types/**` → `src/components/resources/apps/emotion-tree/types/**`
- Create: `src/components/resources/apps/emotion-tree/emotion-tree.css`
- Create: `src/components/resources/apps/emotion-tree/__tests__/EmotionTreeApp.test.tsx`
- Modify: `src/app/globals.css`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: the shared resource window’s bounded height and host application API paths.
- Produces: `EmotionTreeApp`, an SSR-safe client component that fills its parent.

- [ ] **Step 1: Write an integration test for the new tree entry point**

Mock `TreeScene`, render `EmotionTreeApp`, and assert the accessible name “Árvore das Emoções”, the primary message action, and absence of the old XP/level UI.

- [ ] **Step 2: Run the test and verify the missing entry-point failure**

Run: `npm test -- src/components/resources/apps/emotion-tree/__tests__/EmotionTreeApp.test.tsx --runInBand`

Expected: FAIL because the integrated entry point does not exist.

- [ ] **Step 3: Add compatible runtime dependencies to the host**

Install only the packages imported by the supplied feature and missing from the root: `@react-three/drei`, `@react-three/fiber`, `howler`, `motion`, `three-stdlib`, `zustand`, and `@types/howler`. Keep the root’s React, Next.js, Three.js, Firebase, Framer Motion, and Lucide versions; resolve type/API incompatibilities in source instead of installing a second framework runtime.

- [ ] **Step 4: Move the feature code and rewrite aliases**

All former `@/components`, `@/data`, `@/hooks`, `@/lib`, `@/store`, and `@/types` imports must point to `@/components/resources/apps/emotion-tree/...`. Keep server-only modules importable only by route handlers. Remove `ExperienceClient` because host development warnings must not monkey-patch the global console.

- [ ] **Step 5: Encapsulate styles and viewport behavior**

Import `emotion-tree.css` from the host global stylesheet or convert it into host-compatible scoped rules. Namespace generic selectors under `.emotion-tree-app`; change the root from `h-dvh` to `h-full min-h-0` and keep reduced-motion behavior scoped to the feature.

- [ ] **Step 6: Run the focused test and typecheck**

Run: `npm test -- src/components/resources/apps/emotion-tree/__tests__/EmotionTreeApp.test.tsx --runInBand`

Run: `npm run typecheck`

Expected: PASS for both commands.

---

### Task 4: Migrate emotion-tree server endpoints

**Files:**
- Create: `src/app/api/emotion-tree/quotes/by-theme/route.ts`
- Create: `src/app/api/emotion-tree/interactions/route.ts`
- Create: `src/app/api/emotion-tree/favorites/route.ts`
- Create: `src/app/api/emotion-tree/__tests__/routes.test.ts`
- Modify: `src/components/resources/apps/emotion-tree/lib/client/quote-api.ts`
- Modify: `src/components/resources/apps/emotion-tree/lib/client/interactions-api.ts`

**Interfaces:**
- Consumes: migrated emotion-tree server repository and Firebase adapter.
- Produces: `/api/emotion-tree/quotes/by-theme`, `/api/emotion-tree/interactions`, and `/api/emotion-tree/favorites`.

- [ ] **Step 1: Write route tests**

Verify invalid themes return 400, local quote fallback returns 200, malformed interactions return 400, unauthenticated secured requests return 401 when Firebase Admin is configured, and favorite payload validation rejects missing IDs.

- [ ] **Step 2: Run tests before migration**

Run: `npm test -- src/app/api/emotion-tree/__tests__/routes.test.ts --runInBand`

Expected: FAIL because the host endpoints do not exist.

- [ ] **Step 3: Move route logic and update imports**

Preserve `MAX_ITEMS = 200`, allowlist validation, server ownership checks, Firestore fallback behavior, and error statuses from the supplied application.

- [ ] **Step 4: Update client endpoint constants**

```ts
const EMOTION_TREE_API = "/api/emotion-tree";
// quotes: `${EMOTION_TREE_API}/quotes/by-theme?theme=...`
// interactions: `${EMOTION_TREE_API}/interactions`
// favorites: `${EMOTION_TREE_API}/favorites`
```

- [ ] **Step 5: Run route tests**

Run: `npm test -- src/app/api/emotion-tree/__tests__/routes.test.ts --runInBand`

Expected: PASS.

---

### Task 5: Wire the selector and remove legacy applications

**Files:**
- Modify: `src/components/ResourcesSection.jsx`
- Create: `src/components/resources/__tests__/ResourcesSection.test.jsx`
- Delete: `src/components/FeelingsTree.tsx`
- Delete: `src/components/TreeVisualization.jsx`
- Delete after migration: `src/components/arvoredasemocoes/**`

**Interfaces:**
- Consumes: `ResourceWindow`, `BreathingApp`, `EmotionTreeApp`, `SomaScan`, and `MentalHealthQuiz`.
- Produces: card-to-window mapping for `breathing`, `emotion-tree`, `soma-scan`, and `quiz`.

- [ ] **Step 1: Write selector integration tests**

```jsx
it.each([
  ["Iniciar Prática", "Guia de Respiração"],
  ["Acessar Árvore", "Árvore das Emoções"],
  ["Iniciar Scan", "SomaScan"],
  ["Fazer Check-in", "Quiz de Saúde Mental"],
])("opens %s in the shared window", (cardAction, dialogName) => {
  render(<ResourcesSection />);
  fireEvent.click(screen.getByText(cardAction));
  expect(screen.getByRole("dialog", { name: dialogName })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the selector test and verify failure**

Run: `npm test -- src/components/resources/__tests__/ResourcesSection.test.jsx --runInBand`

Expected: FAIL because the old selector does not use `ResourceWindow` or the new tree.

- [ ] **Step 3: Replace conditional modal markup with the resource registry**

```jsx
const RESOURCES = {
  breathing: { title: "Guia de Respiração", render: () => <BreathingApp /> },
  "emotion-tree": { title: "Árvore das Emoções", render: () => <EmotionTreeApp /> },
  "soma-scan": { title: "SomaScan", render: () => <SomaScan /> },
  quiz: { title: "Quiz de Saúde Mental", render: () => <MentalHealthQuiz /> },
};
```

Render the selected entry inside one `ResourceWindow`. Remove legacy XP, level, unlocked-leaf state and toast callbacks because the supplied emotion tree does not consume them.

- [ ] **Step 4: Remove the old tree and empty supplied-project shell**

Before deletion, run `rg -n "FeelingsTree|TreeVisualization|arvoredasemocoes" src` and confirm every remaining match belongs to files scheduled for deletion. Delete only after the new entry point is wired and its tests pass.

- [ ] **Step 5: Run all focused resource tests**

Run: `npm test -- src/components/resources --runInBand`

Expected: PASS.

---

### Task 6: Full verification and visual QA

**Files:**
- Modify only files implicated by verification failures within this feature’s scope.

**Interfaces:**
- Consumes: completed standardized resource applications.
- Produces: verified production build and responsive behavior.

- [ ] **Step 1: Run static verification**

Run: `npm run typecheck`

Run: `npm run lint`

Expected: both exit 0 with no new warnings in changed files.

- [ ] **Step 2: Run the complete test suite**

Run: `npm test -- --runInBand`

Expected: PASS; any unrelated pre-existing failure is recorded separately with evidence.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: Next.js build completes and all emotion-tree API routes are listed.

- [ ] **Step 4: Inspect all four tools at desktop and mobile sizes**

Start the development server and use browser automation at 1440×900 and 390×844. For every card, verify one 90vh shared window, visible Back/Close controls, no duplicate global exit control, no horizontal page overflow, and usable internal controls. Exercise one primary interaction in each tool; for the tree, confirm the 3D canvas mounts and a message leaf flow can open and close.

- [ ] **Step 5: Review the final diff**

Run: `git diff --check`

Run: `git status --short`

Run: `rg -n "FeelingsTree|TreeVisualization|src/components/arvoredasemocoes" src`

Expected: no whitespace errors, only intended files changed, and no legacy-tree references.
