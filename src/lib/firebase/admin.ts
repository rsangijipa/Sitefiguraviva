import admin from 'firebase-admin';

// Check for required environment variables
const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
];

const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables for Firebase Admin: ${missingEnvVars.join(', ')}`);
}

// Ensure initialization happens only once
if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
            console.log("Firebase Admin Initialized successfully.");
        } else {
            console.error("Firebase Admin skipped - missing credentials.");
        }
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}

// Export safe accessors that throw specific errors on usage if not initialized
// This prevents top-level crashes during module evaluation
const createProxy = (name: string) => {
    return new Proxy({}, {
        get: (_target, prop) => {
            if (admin.apps.length > 0) {
                // If initialized later, return the real thing? 
                // No, the proxy is bound to the export. 
                // We should return the actual service instance property.
                const service = name === 'firestore' ? admin.firestore() :
                    name === 'auth' ? admin.auth() :
                        admin.storage();
                const value = service[prop as keyof typeof service];
                // If it's a function, bind it to the service
                if (typeof value === 'function') {
                    return (value as Function).bind(service);
                }
                return value;
            }
            throw new Error(`Firebase Admin SDK not initialized. Missing environment variables: ${missingEnvVars.join(', ')}. Cannot access '${name}.${String(prop)}'`);
        }
    });
};

let db: FirebaseFirestore.Firestore;
let auth: admin.auth.Auth;
let storage: admin.storage.Storage;

// We assign the real instances if ready, otherwise proxies.
// BUT, since ES modules caches exports, if we export proxies, they stay proxies.
// So we ALWAYS export proxies that delegate to the real instance if available, 
// or throw if not. This is safer for Next.js hot reloading too.

const dbProxy = new Proxy({}, {
    get: (_target, prop) => {
        if (admin.apps.length) {
            const instance = admin.firestore();
            const val = instance[prop as keyof typeof instance];
            return typeof val === 'function' ? (val as Function).bind(instance) : val;
        }
        throw new Error(`Firebase Admin SDK not initialized (Firestore). Missing: ${missingEnvVars.join(', ')}`);
    }
}) as FirebaseFirestore.Firestore;

const authProxy = new Proxy({}, {
    get: (_target, prop) => {
        if (admin.apps.length) {
            const instance = admin.auth();
            const val = instance[prop as keyof typeof instance];
            return typeof val === 'function' ? (val as Function).bind(instance) : val;
        }
        throw new Error(`Firebase Admin SDK not initialized (Auth). Missing: ${missingEnvVars.join(', ')}`);
    }
}) as admin.auth.Auth;

const storageProxy = new Proxy({}, {
    get: (_target, prop) => {
        if (admin.apps.length) {
            const instance = admin.storage();
            const val = instance[prop as keyof typeof instance];
            return typeof val === 'function' ? (val as Function).bind(instance) : val;
        }
        throw new Error(`Firebase Admin SDK not initialized (Storage). Missing: ${missingEnvVars.join(', ')}`);
    }
}) as admin.storage.Storage;

// Export aliases for backward compatibility or clarity
export { dbProxy as db, authProxy as auth, storageProxy as storage, dbProxy as adminDb, authProxy as adminAuth };
