# 🛰️ ORBITAL MASTER PLAN — FIGURA VIVA LMS v2.0

**Status**: Active / In Progress
**Version**: 2.0
**Last Updated**: 2026-02-07

---

## I. Executive Summary

This document outlines the implementation strategy for **Figura Viva LMS v2.0**, a university-grade EAD platform designed for high integrity, auditability, and scalability. The core philosophy is **Server-Side Authority (SSoT)**: ensuring that every critical action—from enrollment to certification—is validated, executed, and logged by the server, preventing client-side manipulation.

**Key Achievements (Current State):**

- **Enrollment Gate (SSoT)**: Fully implemented (Orbitals 01-07). Access is strictly controlled via `enrollments` collection with support for PIX, Stripe, Subscriptions, and Manual approvals.
- **Canonical Access Guard**: `assertCanAccessCourse` enforces rules universally across the portal and API.
- **Certificate Engine**: Implemented with full server-side revalidation of progress and course structure.
- **Security Hardening**: Firestore rules block client writes to critical collections (`enrollments`, `progress`, `certificates`, `audit_logs`).

**Immediate Focus:**

- Hardening the **Authoring & Publishing** flows (Orbitals 08+).
- Optimizing the **Course Player** for offline resilience and UX.
- Expanding **Observability** beyond basic audit logs.

---

## II. Architecture Overview

The platform uses a **Hybrid Architecture**:

1. **Client (Next.js/React)**: Optimistic UI, Offline Cache (Dexie - Planned), Rich Interactivity.
2. **Server (Next.js Actions/Firebase Admin)**: The "Gatekeeper". All writes to business-critical data pass through Server Actions.
3. **Database (Firestore)**: No-SQL document store.
    - **Public/Read-Heavy**: `courses` (published).
    - **Private/Transactional**: `enrollments`, `progress`, `users`.
    - **Immutable/Audit**: `certificates`, `audit_logs`.

### Access Control Flow

`User Request` → `Middleware/Guard` → `Server Action` → `SSoT Check (Enrollment + Publish Status)` → `Transaction` → `Event Bus`

---

## III. Data Model (SSoT)

### 3.1 Content (Catalog)

- **`courses/{courseId}`**:
  - `isPublished` (bool): Master visibility switch.
  - `status` ('draft' | 'open' | 'archived'): Lifecycle state.
  - `contentRevision` (int): Incremented on structural changes.
  - `modules` (subcollection): Ordered containers.
  - `lessons` (subcollection): Content units.

### 3.2 Access (Enrollments) - **[DONE]**

- **`enrollments/{uid}_{courseId}`**:
  - `status`: 'pending' | 'active' | 'expired' | 'canceled'
  - `paymentMethod`: 'pix' | 'stripe' | 'subscription' | 'free'
  - `accessUntil` (timestamp?): For subscriptions.
  - `sourceRef`: Payment ID for idempotency.
  - `courseVersionAtEnrollment`: Snapshot version.

### 3.3 Progress - **[DONE]**

- **`progress/{uid}_{courseId}_{lessonId}`**:
  - `status`: 'completed' | 'in_progress'
  - `percent`: 0-100
  - `completedAt`: Timestamp (Immutable once set).

### 3.4 Certificates - **[DONE]**

- **`certificates/{uid}_{courseId}_v{version}`**:
  - `verificationCode`: Short generic code.
  - `integrityHash`: SHA256 of the snapshot.
  - `courseSnapshot`: Complete structure at time of issuance.
  - `issuedAt`: Timestamp.
  - `issuedBy`: 'system'.

---

## IV. Contracts & Invariantes

1. **Zero Trust Client**: The client is a view-only layer. It cannot write to `enrollments` or `progress` directly.
2. **Payment = Access**: Access is *only* granted if `enrollment.status == 'active'` AND `now < accessUntil`.
3. **Monotonic Progress**: A completed lesson cannot revert to incomplete via student action.
4. **Immutability**: Certificates and Audit Logs are append-only.
5. **Synchronization**: Admin changes (publish/unpublish) propagate immediately to access gates.

---

## V. Implementation Plan (Phased)

### ✅ Phase 0: The Core Foundation (Completed)

- [x] **SSoT Data Contract**: Enforced `EnrollmentDoc` and types.
- [x] **Canonical Access Gate**: Implemented `assertCanAccessCourse`.
- [x] **Enrollment Engine**: PIX, Stripe, Subscription, Free flows active.
- [x] **Security Rules**: `firestore.rules` hardened for "No Client Writes".
- [x] **Certificate Engine**: Full server-side issuance with re-check.
- [x] **E2E Verification**: Playwright tests for access control (`enrollment-gate.spec.ts`).

### 🟡 Phase 1: Authoring & Publishing (Next Up)

*Objective: Robust content management.*

- [ ] **Authoring Guard**: Ensure only Admin/Tutor can write to `courses` (Server Actions).
- [ ] **Publishing Transaction**: "Publish" button triggers atomic update and revision increment.
- [ ] **Storage Gate**: Review `storage.rules` to secure uploaded assets (videos/PDFs).
- [ ] **Version History**: Refine tracking of `contentRevision` changes on module/lesson edits.

### 🔵 Phase 2: User Experience & Offline

*Objective: Smooth learning experience.*

- [ ] **Dexie Integration**: Robust offline syncing for progress (optimistic updates).
- [ ] **Video Metrics**: Throttled updates for `maxWatchedSecond`.
- [ ] **Catalog Experience**: "My Courses" vs "Explore" tailored views.
- [ ] **Public Verification**: Certificate verification page by code.

### 🟣 Phase 3: Observability & Scale

*Objective: Production readiness.*

- [ ] **Reconciliation Jobs**: Daily drift detection (Progress vs Summary).
- [ ] **Advanced Telemetry**: Monitoring business KPIs (completion rates, drop-offs).

---

## VI. Test Plan

### 6.1 Playwright E2E (Critical Path)

- **Enrollment**: Full cycle (Buy -> Access -> Guard). **[DONE]**
- **Consumption**: Lesson navigation, completion, progress persistence.
- **Certification**: Complete all -> Issue -> Verify Code. **[DONE]**
- **Admin**: Create -> Publish -> Unpublish -> Verify Student Lockout.

### 6.2 Security Rules Tests

- Verify `request.auth.token.admin` is required for sensitive writes.
- Verify Students can only read *their* data.

---

## VII. Migration & Rollout

1. **Database Migration**:
    - Run `scripts/migrate-enrollments.mjs` (if legacy data exists) to backfill `contentRevision` and `enrollmentId` patterns.
2. **Feature Flagging**:
    - Use `NEXT_PUBLIC_ENABLE_V2_GATE` (or similar) if rolling out incrementally.

---

## VIII. Definition of Done (DoD)

- [ ] Code implements the SSoT pattern (Server Actions).
- [ ] Firestore Rules allow **zero** unauthorized writes.
- [ ] E2E Tests pass for the specific feature.
- [ ] Audit Log is generated for the action.
- [ ] UX handles "Access Denied" gracefully.

---

## IX. Risk Register

| Risk | Probability | Mitigation |
| :--- | :--- | :--- |
| **Data Drift** (Client vs Server Progress) | Medium | Server is authority; Client re-fetches on mount; Sync job. |
| **Stripe Webhook Failures** | Low | Webhook creates "Pending" if confused; Reconciliation job fixes it. |
| **Storage Cost Spikes** | Low | Cloudflare Stream or Signed URLs with short expiry. |

---

## X. Backlog (Immediate Actions)

1. **Refine Authoring Actions**: Ensure `createCourse`, `updateLesson` bump revisions correctly.
2. **Implement Storage Rules**: Lockdown `storage.rules`.
3. **Enhance Course Player**: Add "Next Lesson" logic and persistent video metrics.
