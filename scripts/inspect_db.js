
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

async function checkData() {
    const app = initializeApp(config);
    const db = getFirestore(app);

    console.log("Checking Firestore Data...");
    try {
        const snap = await getDocs(collection(db, "courses"));
        console.log(`Coleção 'courses': ${snap.size} documentos encontrados.`);
        snap.forEach(d => console.log(` - ID: ${d.id}, Titulo: ${d.data().title}`));

        if (snap.size === 0) {
            console.log("⚠️ A coleção 'courses' está VAZIA. A migração não gravou nada.");
        }
    } catch (e) {
        console.error("❌ Erro ao ler 'courses':", e.message);
    }
    process.exit(0);
}

checkData();
