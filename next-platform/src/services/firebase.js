import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
let db;
let auth;
let storage;
let analytics = null;

if (typeof window === 'undefined' && !firebaseConfig.apiKey) {
    // During build or server-side without config, we might want to skip initialization
    // or provide a mock to avoid build errors if pages are statically generated.
    console.warn("Firebase config missing during server-side rendering/build.");
} else {
    try {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        db = getFirestore(app);
        auth = getAuth(app);
        storage = getStorage(app);

        if (typeof window !== "undefined") {
            isSupported().then((yes) => {
                if (yes) {
                    analytics = getAnalytics(app);
                }
            });
        }
    } catch (error) {
        console.error("Firebase initialization error:", error);
    }
}

export { app, analytics, db, auth, storage };
