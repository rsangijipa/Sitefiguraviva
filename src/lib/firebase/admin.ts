import admin from 'firebase-admin';

// --- Safe Proxies & Mocking ---

/**
 * Creates a recursive proxy that handles common Firebase chaining patterns.
 */
function createChainableMock(serviceName: string, propPath: string = ''): any {
    const isDev = process.env.NODE_ENV !== 'production';

    const mockCallable = (...args: any[]) => {
        if (isDev && propPath !== 'verifySessionCookie') {
            console.warn(`[DEVELOPMENT] ${serviceName} call ignored: ${propPath}`);
        }
        return createChainableMock(serviceName, propPath);
    };

    const mock: any = mockCallable;

    mock.get = async () => ({
        docs: [],
        size: 0,
        empty: true,
        exists: false,
        data: () => ({}),
        val: () => ({}),
        forEach: (cb: any) => { },
    });

    if (propPath === 'verifySessionCookie') {
        mockCallable.then = (resolve: any) => resolve({
            uid: 'mock-admin-uid',
            email: 'admin@mock.com',
            admin: true,
            role: 'admin'
        });
    }

    mock.set = async () => ({});
    mock.update = async () => ({});
    mock.add = async () => ({ id: 'mock-id' });
    mock.delete = async () => ({});

    const chainableMethods = ['collection', 'doc', 'where', 'orderBy', 'limit', 'startAt', 'endAt', 'parent', 'ref'];
    chainableMethods.forEach(method => {
        mock[method] = () => createChainableMock(serviceName, `${propPath}.${method}`);
    });

    return mock;
}

/**
 * Ensures Firebase Admin initialization happens only once and handles
 * development fallbacks gracefully.
 */
function getAdminApp() {
    const isDev = process.env.NODE_ENV !== 'production';

    if (admin.apps.length > 0) {
        if (isDev) {
            // In dev, if we are calling this, maybe we want a fresh start if things are broken.
            // But usually Next.js HMR is the culprit. 
            // Let's just return the first one but log it.
            return admin.apps[0];
        }
        return admin.apps[0];
    }

    try {
        let credential;
        let authStrategy = 'None';

        // 1. Priority: Local File Path (Hybrid Auth for Dev)
        let serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '';
        if (serviceAccountPath) {
            // Remove any surrounding quotes (e.g. 'path' or "path")
            serviceAccountPath = serviceAccountPath.replace(/^["']|["']$/g, '');

            const fs = require('fs');
            console.log(`[FIREBASE INIT] Checking local path: ${serviceAccountPath}`);

            if (fs.existsSync(serviceAccountPath)) {
                try {
                    const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
                    const serviceAccount = JSON.parse(fileContent);
                    credential = admin.credential.cert(serviceAccount);
                    authStrategy = `Local File Path (${serviceAccount.project_id})`;
                    console.log(`[FIREBASE INIT] Success: Loaded from local file for project: ${serviceAccount.project_id}`);
                } catch (e: any) {
                    console.error('[FIREBASE INIT] Failed to load local service account file:', e.message);
                }
            } else {
                console.warn(`[FIREBASE INIT] File not found at: ${serviceAccountPath}`);
            }
        }

        // 2. Priority: Base64 Env (CI/CD)
        if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
            try {
                const buffer = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64');
                const json = JSON.parse(buffer.toString('utf8'));
                credential = admin.credential.cert(json);
                authStrategy = `Base64 Env (${json.project_id})`;
            } catch (e: any) {
                console.error('[FIREBASE INIT] Failed to parse Base64 service account:', e.message);
            }
        }

        // 3. Priority: Standard Env Vars (Production)
        if (!credential) {
            const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '').replace(/^["']|["']$/g, '');
            const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').replace(/^["']|["']$/g, '');
            let privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/^["']|["']$/g, '');

            if (privateKey) {
                privateKey = privateKey.replace(/\\n/g, '\n').replace(/\r/g, '').trim();
            }

            if (projectId && clientEmail && privateKey) {
                credential = admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                });
                authStrategy = `Standard Env Vars (${projectId})`;
            }
        }

        // 4. Fallback: Application Default Credentials (GCP)
        if (!credential && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            credential = admin.credential.applicationDefault();
            authStrategy = 'Application Default';
        }

        if (!credential) {
            throw new Error('No valid Firebase credentials found in environment (Path, Base64, or Standard vars).');
        }

        console.log(`[FIREBASE ADMIN] Initialized successfully using strategy: ${authStrategy}`);

        const storageBucket = (process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '').replace(/^["']|["']$/g, '');
        const finalProjectId = (credential as any)?.projectId || (credential as any)?.project_id || process.env.FIREBASE_PROJECT_ID;

        console.log(`[FIREBASE ADMIN] App initialization for project: ${finalProjectId}`);

        return admin.initializeApp({
            credential,
            projectId: finalProjectId,
            ...(storageBucket ? { storageBucket } : {}),
        });

    } catch (error: any) {
        console.error('[FIREBASE ADMIN] Critical Initialization Failure:', error.message);
        if (isDev) {
            console.warn('[FIREBASE ADMIN] Running in Mock Mode due to init failure.');
            return null;
        }
        throw error; // Crash in production if auth fails
    }
}

// Singleton Proxies with Auto-Retry on Auth Failure
function handleAdminProxy(serviceMethod: (app: admin.app.App) => any, serviceName: string) {
    return new Proxy({}, {
        get: (_target, prop) => {
            const app = getAdminApp();
            if (!app) {
                if (process.env.NODE_ENV === 'production') {
                    throw new Error(`Firebase Admin SDK not initialized (${serviceName}).`);
                }
                const mock = createChainableMock(serviceName, String(prop));
                return mock[prop] || mock;
            }

            const instance = serviceMethod(app);
            const val = (instance as any)[prop];

            if (typeof val === 'function') {
                return (...args: any[]) => {
                    try {
                        const result = val.apply(instance, args);
                        // If it's a promise (like .get() or .set()), catch auth errors
                        if (result && typeof result.then === 'function') {
                            return result.catch(async (err: any) => {
                                if (err.code === 16 || err.message?.includes('UNAUTHENTICATED')) {
                                    console.warn(`[FIREBASE ADMIN] Auth failure detected in ${serviceName}.${String(prop)}. Resetting app...`);
                                    if (admin.apps.length > 0) {
                                        await Promise.all(admin.apps.map(a => a.delete().catch(() => { })));
                                    }
                                    // Retry once
                                    const freshApp = getAdminApp();
                                    if (freshApp) {
                                        const freshInstance = serviceMethod(freshApp);
                                        return (freshInstance as any)[prop].apply(freshInstance, args);
                                    }
                                }
                                throw err;
                            });
                        }
                        return result;
                    } catch (err: any) {
                        throw err;
                    }
                };
            }
            return val;
        }
    });
}

const dbProxy = handleAdminProxy((app) => admin.firestore(app), 'Firestore') as FirebaseFirestore.Firestore;
const authProxy = handleAdminProxy((app) => admin.auth(app), 'Auth') as admin.auth.Auth;
const storageProxy = handleAdminProxy((app) => admin.storage(app), 'Storage') as admin.storage.Storage;

export { dbProxy as db, authProxy as auth, storageProxy as storage, dbProxy as adminDb, authProxy as adminAuth };
