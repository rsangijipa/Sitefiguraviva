import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const ROOT_DIR = path.resolve(__dirname, '../../');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');
const ENV_PATH = path.resolve(__dirname, '../.env.local');

// Load Env
dotenv.config({ path: ENV_PATH });

// Init Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
}

const db = admin.firestore();
const bucketName = `lithe-transport-479116-m2.firebasestorage.app`;
const storage = admin.storage().bucket(bucketName);

console.log("Bucket Name being used:", storage.name);
console.log("Public Dir:", PUBLIC_DIR);

/**
 * UPLOADS
 */
async function uploadFile(localPath, destination) {
    if (!fs.existsSync(localPath)) {
        console.warn(`⚠️ Local file not found: ${localPath}`);
        return null;
    }

    try {
        const [file] = await storage.upload(localPath, {
            destination: destination,
            metadata: {
                cacheControl: 'public, max-age=31536000',
            },
        });

        // Make public and get URL
        await file.makePublic().catch(e => console.warn(`Could not make public: ${e.message}`));
        return `https://storage.googleapis.com/${storage.name}/${destination}`;
    } catch (e) {
        console.error(`❌ Upload failed for ${localPath}:`, e.message);
        return null;
    }
}

function parseInfoTxt(content) {
    const data = {};
    const lines = content.split('\n');
    let currentKey = null;

    for (const line of lines) {
        if (line.includes(':')) {
            const [key, ...valParts] = line.split(':');
            currentKey = key.trim().toLowerCase();
            const value = valParts.join(':').trim();
            data[currentKey] = value;
        } else if (currentKey && line.trim()) {
            data[currentKey] += '\n' + line.trim();
        }
    }
    return data;
}

/**
 * MIGRATION SECTIONS
 */

async function syncStaticPages() {
    console.log("📄 Syncing Static Pages (Founder & Institute)...");

    const founderData = {
        name: "Lilian Vanessa Nicacio Gusmão Vianei",
        role: "Psicóloga e Gestalt-terapeuta",
        bio: "Psicóloga, gestalt-terapeuta e pesquisadora, com trajetória que integra clínica, docência e estudos em trauma, psicoterapia corporal e neurodiversidades, além de perspectivas feministas e decoloniais.",
        image: await uploadFile(path.join(PUBLIC_DIR, 'assets/lilian-vanessa.jpeg'), 'assets/lilian-vanessa.jpeg'),
        link: "http://lattes.cnpq.br/",
        updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    const instituteData = {
        title: "O Instituto Figura Viva",
        subtitle: "Um espaço vivo de acolhimento clínico e formação profissional — onde o encontro transforma.",
        manifesto_title: "Habitar a Fronteira",
        manifesto_text: "Na Gestalt, a vida acontece no contato: na fronteira entre organismo e ambiente, entre o que sinto e o que digo, entre o que foi e o que pode nascer agora. No Figura Viva, a gente leva isso a sério — com rigor, com ética e com humanidade.",
        quote: "O encontro é a fronteira onde a vida se renova.",
        address: "Rua Pinheiro Machado, 2033 – Central, Porto Velho – RO • CEP 76801-057",
        phone: "(69) 99248-1585",
        updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('pages').doc('founder').set(founderData, { merge: true });
    await db.collection('pages').doc('institute').set(instituteData, { merge: true });

    console.log("✅ Static Pages synced.");
}

async function syncCourses() {
    console.log("📚 Syncing Courses...");
    const coursesDir = path.join(PUBLIC_DIR, 'cursos');
    const folders = fs.readdirSync(coursesDir).filter(f => fs.lstatSync(path.join(coursesDir, f)).isDirectory());

    for (const folder of folders) {
        const folderPath = path.join(coursesDir, folder);
        console.log(`Processing Course: ${folder}...`);

        const infoPath = path.join(folderPath, 'info.txt');
        if (!fs.existsSync(infoPath)) continue;

        const info = parseInfoTxt(fs.readFileSync(infoPath, 'utf8'));

        // Handle Mediators
        const mediators = [];
        if (info.mediador1) {
            const [name, ...bioParts] = info.mediador1.split('|');
            mediators.push({
                name: name.trim(),
                bio: bioParts.join('|').trim(),
                photo: await uploadFile(path.join(folderPath, 'mediador1.jpeg'), `courses/${folder}/mediador1.jpeg`)
            });
        }
        if (info.mediador2) {
            const [name, ...bioParts] = info.mediador2.split('|');
            mediators.push({
                name: name.trim(),
                bio: bioParts.join('|').trim(),
                photo: await uploadFile(path.join(folderPath, 'mediador2.jpeg'), `courses/${folder}/mediador2.jpeg`)
            });
        }

        const courseData = {
            title: info.title || folder,
            subtitle: info.subtitle || '',
            category: info.category || 'Curso',
            status: info.status || 'Aberto',
            date: info.date || '',
            link: info.link || '',
            description: info.description || '',
            image: await uploadFile(path.join(folderPath, 'capa.jpeg'), `courses/${folder}/capa.jpeg`),
            tags: info.tags ? info.tags.split(',').map(t => t.trim()) : [],
            details: {
                intro: info.intro || '',
                format: info.format || '',
                schedule: ''
            },
            mediators: mediators,
            isPublished: true,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        };

        // Query by title to avoid duplicates
        const existing = await db.collection('courses').where('title', '==', courseData.title).get();
        if (existing.empty) {
            await db.collection('courses').add(courseData);
        } else {
            await existing.docs[0].ref.update(courseData);
        }
    }
    console.log("✅ Courses synced.");
}

async function syncDocuments() {
    console.log("📄 Syncing Documents...");
    const docsDir = path.join(PUBLIC_DIR, 'documents');
    if (!fs.existsSync(docsDir)) return;

    const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.pdf'));

    for (const file of files) {
        const filePath = path.join(docsDir, file);
        console.log(`Uploading Doc: ${file}...`);

        const url = await uploadFile(filePath, `public/docs/${file}`);
        const stats = fs.statSync(filePath);
        const sizeMb = (stats.size / (1024 * 1024)).toFixed(2) + ' MB';

        const docData = {
            title: file.replace('.pdf', ''),
            category: 'public',
            file_url: url,
            file_path: `public/docs/${file}`,
            file_size: sizeMb,
            file_type: 'pdf',
            isPublished: true,
            created_at: admin.firestore.FieldValue.serverTimestamp()
        };

        const existing = await db.collection('publicDocs').where('file_path', '==', docData.file_path).get();
        if (existing.empty) {
            await db.collection('publicDocs').add(docData);
        }
    }
    console.log("✅ Documents synced.");
}

async function syncGallery() {
    console.log("🖼️ Syncing Gallery...");
    const galleryDir = path.join(PUBLIC_DIR, 'images');
    if (!fs.existsSync(galleryDir)) return;

    const files = fs.readdirSync(galleryDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));

    for (const file of files) {
        const filePath = path.join(galleryDir, file);
        console.log(`Uploading Image: ${file}...`);

        const txtPath = filePath + '.txt';
        let metadata = {};
        if (fs.existsSync(txtPath)) {
            metadata = parseInfoTxt(fs.readFileSync(txtPath, 'utf8'));
        } else {
            // Alternative txt name check
            const altTxtPath = path.join(galleryDir, file.replace(/\.(png|jpg|jpeg)$/, '.txt'));
            if (fs.existsSync(altTxtPath)) {
                metadata = parseInfoTxt(fs.readFileSync(altTxtPath, 'utf8'));
            }
        }

        const url = await uploadFile(filePath, `gallery/${file}`);

        const galleryItem = {
            title: metadata.title || 'Imagem da Galeria',
            legend: metadata.legend || '',
            tags: metadata.tags || '',
            src: url,
            category: metadata.tags ? metadata.tags.split(',')[0].trim() : 'Geral',
            created_at: admin.firestore.FieldValue.serverTimestamp()
        };

        const existing = await db.collection('gallery').where('src', '==', galleryItem.src).get();
        if (existing.empty) {
            await db.collection('gallery').add(galleryItem);
        }
    }
    console.log("✅ Gallery synced.");
}

async function runMigration() {
    try {
        await syncStaticPages();
        await syncCourses();
        await syncDocuments();
        await syncGallery();
        console.log("\n🚀 MIGRATION COMPLETED SUCCESSFULLY!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
    }
}

runMigration();
