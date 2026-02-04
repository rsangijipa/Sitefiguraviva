
import { createClient } from '@supabase/supabase-js'; // Keeping legacy support if needed, but focusing on Firebase
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error("❌ Erro: Credenciais de Firebase Admin não encontradas no .env.local");
    process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
    });
}

const db = admin.firestore();
const uid = process.argv[2];

if (!uid) {
    console.error("Uso: node scripts/lgpd_export.mjs <uid>");
    process.exit(1);
}

async function exportUserData() {
    console.log(`🔒 Iniciando exportação LGPD para UID: ${uid}...`);
    const exportData = {
        meta: {
            uid: uid,
            exportDate: new Date().toISOString(),
            version: '1.0'
        },
        profile: {},
        enrollments: [],
        progress: [],
        auditLogs: []
    };

    try {
        // 1. Profile Data (users/{uid})
        console.log('📦 Coletando perfil...');
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            exportData.profile = userDoc.data();
        } else {
            console.warn(`⚠️ Perfil de usuário não encontrado.`);
        }

        // 2. Enrollments (Root Collection)
        console.log('📦 Coletando matrículas...');
        // Note: As per architecture, enrollmentId is usually uid_courseId
        // But better to query by userId field if it exists, or scan known IDs if reliable.
        // Assuming we store userId in enrollment doc for queryability as per firestore.rules
        const enrollmentsSnapshot = await db.collection('enrollments')
            .where('userId', '==', uid)
            .get();

        enrollmentsSnapshot.forEach(doc => {
            exportData.enrollments.push({ id: doc.id, ...doc.data() });
        });

        // 3. Progress (progress/{uid}_{courseId}_{lessonId} or similar)
        // Adjust query based on actual progress logic. Assuming 'userId' field exists.
        console.log('📦 Coletando progresso de aprendizado...');
        const progressSnapshot = await db.collection('progress')
            .where('userId', '==', uid)
            .get();

        progressSnapshot.forEach(doc => {
            exportData.progress.push({ id: doc.id, ...doc.data() });
        });

        // 4. Audit Logs (Where actor.uid == uid)
        console.log('📦 Coletando logs de atividade...');
        const logsSnapshot = await db.collection('audit_logs')
            .where('actor.uid', '==', uid)
            .get();

        logsSnapshot.forEach(doc => {
            exportData.auditLogs.push({ id: doc.id, ...doc.data() });
        });

        // Write to file
        const filename = `lgpd_export_${uid}_${Date.now()}.json`;
        const outputPath = path.resolve(__dirname, `../exports/${filename}`);

        // Ensure exports dir exists
        if (!fs.existsSync(path.resolve(__dirname, '../exports'))) {
            fs.mkdirSync(path.resolve(__dirname, '../exports'));
        }

        fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
        console.log(`✅ Exportação concluída com sucesso!`);
        console.log(`📁 Arquivo salvo em: ${outputPath}`);
        console.log(`⚠️ ALERTA: Este arquivo contém DADOS PESSOAIS. Compartilhe APENAS com o titular requisitante de forma segura.`);

    } catch (error) {
        console.error("❌ Falha na exportação:", error);
        process.exit(1);
    }
}

exportUserData();
