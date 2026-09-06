# Authoring and Publishing Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make administrative course mutations versioned, auditable, and safe to publish while keeping unpublished content inaccessible to students.

**Architecture:** Administrative actions in `src/app/actions/admin/course-mutations.ts` are the mutation boundary for course structure. A revision helper updates the parent course and emits an event after successful changes; publishing validates the hierarchy before the course becomes visible.

**Tech Stack:** Next.js Server Actions, TypeScript, Firebase Admin SDK/Firestore, Firebase Storage Rules, Jest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-06-lms-completion-design.md`

## Global Constraints

- Server Actions are the canonical interface for business-critical writes.
- Students require an active enrollment and published course/item to consume academic content.
- Structural or visibility changes increment `courses/{courseId}.contentRevision` exactly once per action.
- Legacy documents without publishing fields retain existing compatibility defaults.
- Do not add dependencies.

---

### Task 1: Define revision and audit primitives

**Files:**
- Create: `src/lib/course-content/revision.ts`
- Create: `src/lib/course-content/__tests__/revision.test.ts`
- Modify: `src/app/actions/admin/course-mutations.ts`

**Interfaces:**
- Produces: `type CourseContentChange` and `touchCourseRevision(courseId: string, reason: CourseContentChange): Promise<{ previousRevision: number; revision: number }>`.

- [ ] **Step 1: Write the failing tests**

```ts
it("increments the saved revision and returns both versions", async () => {
  mockCourseGet({ contentRevision: 4 });
  await expect(touchCourseRevision("course-1", "lesson-created")).resolves.toEqual({
    previousRevision: 4,
    revision: 5,
  });
});

it("uses revision one for legacy courses", async () => {
  mockCourseGet({});
  await expect(touchCourseRevision("course-1", "module-updated")).resolves.toEqual({
    previousRevision: 1,
    revision: 2,
  });
});
```

- [ ] **Step 2: Verify the tests fail**

Run: `npm test -- --runInBand src/lib/course-content/__tests__/revision.test.ts`

Expected: FAIL because the helper is absent.

- [ ] **Step 3: Implement the helper**

```ts
export type CourseContentChange = "course-updated" | "module-created" | "module-updated" | "module-deleted" | "lesson-created" | "lesson-updated" | "lesson-deleted";

export async function touchCourseRevision(courseId: string, reason: CourseContentChange) {
  const ref = adminDb.collection("courses").doc(courseId);
  const result = await adminDb.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists) throw new Error("Course not found.");
    const previousRevision = Number(snapshot.data()?.contentRevision ?? 1);
    const revision = previousRevision + 1;
    tx.update(ref, { contentRevision: revision, updatedAt: FieldValue.serverTimestamp() });
    return { previousRevision, revision };
  });
  await publishEvent({ type: "CourseStructureChanged", payload: { courseId, reason, oldVersion: result.previousRevision, newVersion: result.revision } });
  return result;
}
```

- [ ] **Step 4: Call the helper from every create, update, and delete module/lesson action after its Firestore mutation; call it from course updates only when mutable content fields changed.**

- [ ] **Step 5: Verify focused tests pass**

Run: `npm test -- --runInBand src/lib/course-content/__tests__/revision.test.ts src/lib/auth/__tests__/access-gate.integration.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

Run: `git add src/lib/course-content/revision.ts src/lib/course-content/__tests__/revision.test.ts src/app/actions/admin/course-mutations.ts; git commit -m "feat: version administrative course content changes"`

### Task 2: Make publication transitions atomic

**Files:**
- Modify: `src/app/actions/admin-publishing.ts`
- Modify: `src/app/actions/admin/course-mutations.ts`
- Create: `src/app/actions/__tests__/admin-publishing.test.ts`

**Interfaces:**
- Consumes: `touchCourseRevision` from Task 1 and `requireAdmin()`.
- Produces: `setCoursePublicationStatus(courseId: string, status: "draft" | "open" | "archived"): Promise<{ success: boolean; newStatus?: string; isPublished?: boolean; error?: string }>`.

- [ ] **Step 1: Write failing status-transition tests**

```ts
it("refuses a course without a published lesson", async () => {
  mockPublishedStructure({ modules: [{ id: "module-1", lessons: [] }] });
  await expect(setCoursePublicationStatus("course-1", "open")).resolves.toEqual(expect.objectContaining({ success: false }));
});

it("publishes a valid course and increments the revision", async () => {
  mockPublishedStructure({ modules: [{ id: "module-1", lessons: [{ id: "lesson-1", blocks: [{ id: "block-1" }] }] }] });
  await expect(setCoursePublicationStatus("course-1", "open")).resolves.toEqual({ success: true, newStatus: "open", isPublished: true });
});
```

- [ ] **Step 2: Verify the tests fail**

Run: `npm test -- --runInBand src/app/actions/__tests__/admin-publishing.test.ts`

Expected: FAIL until the public transition function has this behavior.

- [ ] **Step 3: Validate before the transaction, then transactionally write `status`, `isPublished`, `publishedAt` when opening, `updatedAt`, and one incremented revision. Emit `CoursePublished` only after commit.**

- [ ] **Step 4: Reject direct `status`, `isPublished`, `publishedAt`, and `contentRevision` writes in `updateCourseAction`; leave normal metadata updates available.**

- [ ] **Step 5: Verify focused tests pass**

Run: `npm test -- --runInBand src/app/actions/__tests__/admin-publishing.test.ts src/lib/auth/__tests__/access-policy.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

Run: `git add src/app/actions/admin-publishing.ts src/app/actions/admin/course-mutations.ts src/app/actions/__tests__/admin-publishing.test.ts; git commit -m "feat: guard course publication transitions"`

### Task 3: Restrict academic Storage assets

**Files:**
- Modify: `storage.rules`
- Create: `src/security/__tests__/storage.rules.security.test.ts`

**Interfaces:**
- Produces: `isAcademicContentType()` rule predicate allowing PDF, video, audio, and images; academic writes stay staff-only and reads stay enrollment-gated.

- [ ] **Step 1: Write failing emulator tests**

```ts
it("rejects an active student upload", async () => {
  await expect(studentStorage("student-1").uploadBytes("lesson-files/course-1/lesson-1/handout.pdf", pdfBytes, { contentType: "application/pdf" })).rejects.toThrow();
});

it("rejects a staff executable upload", async () => {
  await expect(staffStorage().uploadBytes("courses/course-1/materials/file.exe", executableBytes, { contentType: "application/x-msdownload" })).rejects.toThrow();
});
```

- [ ] **Step 2: Verify the tests fail**

Run: `npm test -- --runInBand src/security/__tests__/storage.rules.security.test.ts`

Expected: FAIL until fixture setup and MIME restrictions exist.

- [ ] **Step 3: Add `isAcademicContentType()` and require it plus `isBelowMaxSize(50)` for `lesson-files`, `course-assets`, and `courses/{courseId}/materials`. Preserve staff-only writes and enrollment-only reads.**

- [ ] **Step 4: Seed `student-1_course-1` as active in the test fixture; add accepted staff-PDF and denied unauthenticated/inactive read cases.**

- [ ] **Step 5: Verify security tests pass**

Run: `npm test -- --runInBand src/security/__tests__/storage.rules.security.test.ts src/security/__tests__/firestore.rules.security.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

Run: `git add storage.rules src/security/__tests__/storage.rules.security.test.ts; git commit -m "fix: restrict academic storage assets"`

### Task 4: Cover publication revocation end to end

**Files:**
- Modify: `e2e/admin.spec.ts`
- Modify: `e2e/enrollment-gate.spec.ts`

**Interfaces:**
- Consumes: published status from Task 2 and existing helpers in `e2e/helpers.ts`.
- Produces: a browser regression proving an enrolled student loses access when an admin turns the course back into a draft.

- [ ] **Step 1: Write the failing scenario**

```ts
test("student loses access when an admin unpublishes an enrolled course", async ({ page, adminPage }) => {
  const course = await createPublishedCourseWithLesson(adminPage);
  await enrollStudent(course.id);
  await signInStudent(page);
  await page.goto(`/portal/course/${course.id}`);
  await setCourseStatus(adminPage, course.id, "draft");
  await page.goto(`/portal/course/${course.id}`);
  await expect(page).toHaveURL(/\/portal\/courses/);
});
```

- [ ] **Step 2: Verify the scenario fails**

Run: `npm run test:e2e -- e2e/admin.spec.ts -g "unpublishes an enrolled course"`

Expected: FAIL until selectors/helpers target the guarded publication flow.

- [ ] **Step 3: Use stable labels or existing `data-testid` selectors; await responses and redirects rather than timed sleeps.**

- [ ] **Step 4: Verify affected E2E suites pass**

Run: `npm run test:e2e -- e2e/admin.spec.ts e2e/enrollment-gate.spec.ts`

Expected: PASS.

- [ ] **Step 5: Run quality gates and commit**

Run: `npm run lint; npm run typecheck; npm test -- --runInBand`

Expected: all commands exit with code 0.

Run: `git add e2e/admin.spec.ts e2e/enrollment-gate.spec.ts; git commit -m "test: cover publication access revocation"`

## Plan self-review

- Spec coverage: authoring, versioning, publishing, Storage gating, access visibility, audit events, and targeted tests map to Tasks 1–4.
- Remaining independent deliverables—progress/offline, certificates, assessments/quiz, analytics—require their own plans after this deliverable is verified.
- The public interfaces used in Tasks 2–4 are defined in their preceding task or already exist in the repository.
