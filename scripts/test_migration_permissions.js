
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, setDoc } from "firebase/firestore";
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
    console.log("Testing permissions...");

    // 1. Test 'test_connection' (Should work if old rules persist)
    try {
        await addDoc(collection(db, "test_connection"), { test: true });
        console.log("✅ Write to 'test_connection' ALLOWED.");
    } catch (e) {
        console.error("❌ Write to 'test_connection' BLOCKED.", e.code);
    }

    // 2. Test 'gallery' (Target for migration)
    try {
        await setDoc(doc(db, "gallery", "test-doc"), { test: true });
        console.log("✅ Write to 'gallery' ALLOWED.");
    } catch (e) {
        console.error("❌ Write to 'gallery' BLOCKED.", e.code);
    }

    process.exit(0);
}

test();
