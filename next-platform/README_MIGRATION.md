# Firebase Migration Guide for SiteFiguraViva

This guide details how to execute the migration from Supabase to Firebase.

## 1. Environment Setup

Fill in the following values in your `.env.local` file:

```env
# --- FIREBASE CLIENT (From Firebase Console -> Project Settings) ---
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# --- FIREBASE ADMIN (For Scripts) ---
# Generate a new private key in Project Settings -> Service Accounts
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# --- SUPABASE (For Data Migration Source) ---
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 2. Deploy Security Rules

Copy the content of `firestore.rules` (in the root folder) and paste it into the **Firestore -> Rules** tab in the Firebase Console. Do the same for Storage if you have rules (default to allow auth read/write for now).

## 3. Migrate Data

Run the migration script to copy data from Supabase tables to Firestore collections:

```bash
node scripts/migrate-supabase.js
```

*Note: This requires `dotenv` and `@supabase/supabase-js`, which are already installed.*

## 4. Set Admin Privileges

The new system uses "Custom Claims" for admin security (RBAC).

1. Create a user via the Login page (Sign Up is not implemented publicly, so create via Firebase Console > Authentication > Add User).
2. Copy the **User UID**.
3. Run the script:

```bash
node scripts/set-admin.js <UID>
```

## 5. Verify & Launch

- Start the server: `npm run dev`
- Log in at `/admin/login`.
- Verify you can see the Dashboard (which currently might show empty if you haven't refactored the Admin Dashboard page itself yet).
- Verify the Home page loads content from Firestore (checking the Network tab for Firestore requests).
