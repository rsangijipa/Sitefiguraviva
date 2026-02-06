import admin from 'firebase-admin';

// --- Env Resolution (Server-side) ---
// We accept either FIREBASE_* or NEXT_PUBLIC_FIREBASE_* for convenience.
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const missingRequired: string[] = [];
if (!projectId) missingRequired.push('FIREBASE_PROJECT_ID (or NEXT_PUBLIC_FIREBASE_PROJECT_ID)');
if (!clientEmail) missingRequired.push('FIREBASE_CLIENT_EMAIL');
if (!process.env.FIREBASE_PRIVATE_KEY) missingRequired.push('FIREBASE_PRIVATE_KEY');

if (missingRequired.length > 0) {
    console.error(`Missing required environment variables for Firebase Admin: ${missingRequired.join(', ')}`);
}

// Ensure initialization happens only once
if (!admin.apps.length) {
    try {
        if (projectId && clientEmail && privateKey) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
                ...(storageBucket ? { storageBucket } : {}),
            });
            console.log('Firebase Admin Initialized successfully.');
        } else {
            console.error('Firebase Admin skipped - missing credentials/projectId.');
        }
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}

// --- Safe Proxies ---
// We export proxies that delegate to the real service instance when initialized,
// and throw a clear error otherwise. This avoids module-evaluation crashes.

const dbProxy = new Proxy({}, {
    get: (_target, prop) => {
        if (admin.apps.length) {
            const instance = admin.firestore();
            const val = instance[prop as keyof typeof instance];
            return typeof val === 'function' ? (val as Function).bind(instance) : val;
        }
        throw new Error(`Firebase Admin SDK not initialized (Firestore). Missing: ${missingRequired.join(', ')}`);
    }
}) as FirebaseFirestore.Firestore;

const authProxy = new Proxy({}, {
    get: (_target, prop) => {
        if (admin.apps.length) {
            const instance = admin.auth();
            const val = instance[prop as keyof typeof instance];
            return typeof val === 'function' ? (val as Function).bind(instance) : val;
        }
        throw new Error(`Firebase Admin SDK not initialized (Auth). Missing: ${missingRequired.join(', ')}`);
    }
}) as admin.auth.Auth;

const storageProxy = new Proxy({}, {
    get: (_target, prop) => {
        if (admin.apps.length) {
            const instance = admin.storage();
            const val = instance[prop as keyof typeof instance];
            return typeof val === 'function' ? (val as Function).bind(instance) : val;
        }
        throw new Error(`Firebase Admin SDK not initialized (Storage). Missing: ${missingRequired.join(', ')}`);
    }
}) as admin.storage.Storage;

// Export aliases for backward compatibility or clarity
export { dbProxy as db, authProxy as auth, storageProxy as storage, dbProxy as adminDb, authProxy as adminAuth };
