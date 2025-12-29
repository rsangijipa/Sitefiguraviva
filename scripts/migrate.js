import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    // OVERRIDE: Trying standard bucket format
    storageBucket: "elosusgrupos.appspot.com",
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const PUBLIC_DIR = path.join(__dirname, '../public');
const DATA_DIR = path.join(__dirname, '../src/data');

// Add mime types
const getMimeType = (filePath) => {
    if (filePath.endsWith('.png')) return 'image/png';
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
    if (filePath.endsWith('.svg')) return 'image/svg+xml';
    if (filePath.endsWith('.pdf')) return 'application/pdf';
    return 'application/octet-stream';
};

async function uploadFile(localPath, storagePath) {
    if (!localPath) return null;

    // Normalize path (handle leading slash)
    const cleanPath = localPath.startsWith('/') ? localPath.substring(1) : localPath;
    const fullPath = path.join(PUBLIC_DIR, cleanPath);

    if (!fs.existsSync(fullPath)) {
        console.warn(`[SKIP] File not found: ${localPath}`);
        return null;
    }

    try {
        const fileBuffer = fs.readFileSync(fullPath);
        const storageRef = ref(storage, storagePath);
        const meta = { contentType: getMimeType(cleanPath) };

        await uploadBytes(storageRef, fileBuffer, meta);
        const url = await getDownloadURL(storageRef);
        console.log(`[UPLOAD] ${localPath} -> OK`);
        return url;
    } catch (error) {
        console.error(`[ERROR] Upload failed for ${localPath}:`, error.message);
        return null;
    }
}

async function migrateGallery() {
    console.log("\n--- Migrating Gallery ---");
    const galleryPath = path.join(DATA_DIR, 'gallery.json');
    if (!fs.existsSync(galleryPath)) return;

    const galleryData = JSON.parse(fs.readFileSync(galleryPath, 'utf8'));

    for (const item of galleryData) {
        if (item.src) {
            const fileName = path.basename(item.src);
            const storageUrl = await uploadFile(item.src, `gallery/${fileName}`);
            if (storageUrl) item.src = storageUrl;
        }

        item.createdAt = new Date().toISOString();
        const docId = item.id ? item.id.replace(/\W+/g, '-').toLowerCase() : `gallery-${Date.now()}`;

        await setDoc(doc(db, "gallery", docId), item);
        console.log(`[DB] Saved Gallery: ${docId}`);
    }
}

async function migrateMediators() {
    console.log("\n--- Migrating Mediators ---");
    const mediators = [
        {
            id: 'lilian-gusmao',
            name: 'Lílian V. N. Gusmão Vianei',
            image: '/assets/lilian-vanessa.jpeg',
            bio: 'Mulher, mineira, migrante, mãe atípica e feminista. Atuo como psicóloga, Gestalt-terapeuta, idealizadora, sócia fundadora e curadora do Instituto de Gestalt-terapia de Rondônia – Figura Viva com ênfase em estudos, vivências a partir de temas feministas, antirracistas, anticapacitistas e decoloniais, que des-cobrem e in-ventam uma presença sensível no campo/organismo/ambiente. Formação e Pós-formação em Gestalt-terapia, Trauma, Psicoterapia corporal, Neurodiversidades. Escreve com interesse em temas como o lugar da mulher na Gestalt-terapia a partir de Laura Perls, opressões de gênero, violências, solidariedade política entre mulheres brancas e multiétnicas. Mestra em Ciências Ambientais pela UNITAU e graduada em psicologia pela UFMG.'
        },
        {
            id: 'wanne-belmino',
            name: 'Wanne Belmino',
            image: null,
            bio: 'Informações sobre Wanne Belmino em breve.'
        },
        {
            id: 'samara-bernardo',
            name: 'Sâmara Bernardo',
            image: null,
            bio: 'Informações sobre Sâmara Bernardo em breve.'
        }
    ];

    for (const m of mediators) {
        if (m.image) {
            const storageUrl = await uploadFile(m.image, `mediators/${path.basename(m.image)}`);
            if (storageUrl) m.image = storageUrl;
        }
        await setDoc(doc(db, "mediators", m.id), m);
        console.log(`[DB] Saved Mediator: ${m.id}`);
    }
}

async function migrateCourses() {
    console.log("\n--- Migrating Courses ---");
    const coursesPath = path.join(DATA_DIR, 'courses.json');
    if (!fs.existsSync(coursesPath)) return;

    const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

    for (const course of coursesData) {
        const courseSlug = course.id;

        // Single Image
        if (course.image) {
            const storageUrl = await uploadFile(course.image, `courses/${courseSlug}/cover-${path.basename(course.image)}`);
            if (storageUrl) course.image = storageUrl;
        }

        // Array Images
        if (course.images && Array.isArray(course.images)) {
            const newImages = [];
            for (const imgPath of course.images) {
                const fileName = path.basename(imgPath);
                const storageUrl = await uploadFile(imgPath, `courses/${courseSlug}/gallery-${fileName}`);
                newImages.push(storageUrl || imgPath);
            }
            course.images = newImages;
        }

        // Mediator Images within Course
        if (course.mediators && Array.isArray(course.mediators)) {
            for (const mediator of course.mediators) {
                if (mediator.image) {
                    const fileName = path.basename(mediator.image);
                    // Deduplicate by just uploading to a central mediators folder? Or keep scoped?
                    // Let's use central mediators folder for reused images
                    const storageUrl = await uploadFile(mediator.image, `mediators/${fileName}`);
                    if (storageUrl) mediator.image = storageUrl;
                }
            }
        }

        course.createdAt = new Date().toISOString();
        const docRef = doc(db, "courses", courseSlug);
        // Use setDoc with merge to update without overwriting everything if rerun
        await setDoc(docRef, course, { merge: true });
        console.log(`[DB] Saved Course: ${courseSlug}`);
    }
}

async function main() {
    try {
        await migrateGallery();
        await migrateMediators();
        await migrateCourses();
        console.log("\n✅ Migration All Done!");
        process.exit(0);
    } catch (e) {
        console.error("\n❌ Migration Fatal Error", e);
        process.exit(1);
    }
}

main();
