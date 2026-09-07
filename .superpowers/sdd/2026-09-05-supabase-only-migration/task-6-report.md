# Task 6 report: Replace Firebase uploads, telemetry and messaging

## Status

Completed locally. The Firebase-backed upload path, analytics initialization,
and messaging service worker were removed from the Task 6 surface.

## Implemented

- Added `src/infrastructure/supabase/storage.client.ts` with a browser-side
  upload adapter that:
  - uses the existing Supabase browser client from Task 2;
  - uploads into the `uploads` bucket with `upsert: true`;
  - validates MIME type and maximum size before upload;
  - returns `{ url, path, name, size }` for admin consumers.
- Replaced Firebase Storage usage in:
  - `src/components/admin/ImageUpload.tsx`
  - `src/components/admin/FileUpload.tsx`
  - `src/app/admin/(protected)/blog/components/BlogPostForm.tsx`
- Migrated `src/components/admin/MaterialsManager.tsx` to the existing
  Supabase admin course actions instead of Firestore.
- Simplified `src/lib/telemetry.ts` so it no longer initializes Firebase
  Analytics and now only provides the existing local logging facade.
- Deleted `public/firebase-messaging-sw.js`.
- Added focused tests for storage uploads and telemetry initialization.

## TDD evidence

Red run:

```text
npm test -- --runInBand src/infrastructure/supabase/__tests__/storage.client.test.ts src/lib/__tests__/telemetry.test.ts
```

Initial failure state:

- `src/infrastructure/supabase/__tests__/storage.client.test.ts` failed with
  `Cannot find module '../storage.client'`.
- `src/lib/__tests__/telemetry.test.ts` failed because `getAnalytics` was
  called once when consent was present.

Green run:

```text
npm test -- --runInBand src/infrastructure/supabase/__tests__/storage.client.test.ts src/lib/__tests__/telemetry.test.ts
```

Final result: 2 suites passed, 4 tests passed.

## Verification

```text
npm run typecheck
```

Result: exit 0.

```text
rg -n "firebase|firebase/storage|firebase/analytics|lib/firebase/client" \
  'src/components/admin/ImageUpload.tsx' \
  'src/components/admin/FileUpload.tsx' \
  'src/components/admin/MaterialsManager.tsx' \
  'src/app/admin/(protected)/blog/components/BlogPostForm.tsx' \
  'src/lib/telemetry.ts' \
  'src/infrastructure/supabase/storage.client.ts'
```

Result: no matches in the touched Task 6 files.

## Commit

`1e7bb20` (`feat: move uploads and telemetry off firebase`)

## Notes

- The admin material flow now uses the existing Supabase server actions for
  listing, adding, and deleting materials. The upload metadata remains in the
  client form state, and the Supabase row stores the URL plus a short
  description for display.
- I did not add any secret logging or live upload step for Task 6; the task was
  satisfied with adapter coverage, typecheck, and removal of Firebase runtime
  imports from the touched files.

## Review fix round 1

Reviewer findings resolved:

- The push-notification manager no longer registers `/firebase-messaging-sw.js`
  or touches Firebase Messaging at runtime.
- Material uploads now preserve the uploaded storage path through the admin
  action and repository layer.
- Material deletion now removes the stored object from Supabase Storage before
  deleting the row.
- Storage uploads now use collision-safe unique object names instead of a fixed
  filename pattern.

Verification:

```text
npm test -- --runInBand src/infrastructure/supabase/__tests__/storage.client.test.ts src/infrastructure/supabase/__tests__/storage.server.test.ts src/components/system/__tests__/PushNotificationManager.test.tsx src/app/actions/admin/__tests__/course-mutations.materials.test.ts
```

Result: 4 suites passed, 10 tests passed.

```text
npm run typecheck
```

Result: exit 0.

Commit:

`ff7165c` (`fix: harden task 6 uploads and material cleanup`)
