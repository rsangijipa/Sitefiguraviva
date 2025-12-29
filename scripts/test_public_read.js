
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

async function testPublicRead() {
    console.log("--- Testing Public Read Access ---");
    // Connect anonymously (no auth)
    const app = initializeApp(config, "publicTestApp");
    const db = getFirestore(app);

    const collections = ['courses', 'gallery', 'mediators', 'blog_posts'];

    for (const colName of collections) {
        try {
            console.log(`Reading '${colName}'...`);
            const snap = await getDocs(collection(db, colName));
            console.log(`✅ Success! Read ${snap.size} documents from '${colName}'.`);
        } catch (e) {
            console.error(`❌ FAILED to read '${colName}':`, e.code);
        }
    }
    process.exit(0);
}

testPublicRead();
