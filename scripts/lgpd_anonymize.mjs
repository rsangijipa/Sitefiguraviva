
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!process.env.FIREBASE_CLIENT_EMAIL) {
    console.error("❌ Erro: Env vars ausentes.");
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
    console.error("Uso: node scripts/lgpd_anonymize.mjs <uid>");
    process.exit(1);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function anonymizeUser() {
    console.log(`🛑 ATENÇÃO: Você está prestes a ANONIMIZAR (apagar dados pessoais) do usuário ${uid}.`);
    console.log(`Esta ação é IRREVERSÍVEL. Certifique-se de que o usuário solicitou formalmente a exclusão.`);

    rl.question('Digite "CONFIRMAR" para prosseguir: ', async (answer) => {
        if (answer !== 'CONFIRMAR') {
            console.log('Operação cancelada.');
            process.exit(0);
        }

        try {
            console.log('🧹 Iniciando anonimização...');
            const batch = db.batch();

            // 1. User Profile (Overwrite PII with redacted)
            const userRef = db.collection('users').doc(uid);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
                batch.update(userRef, {
                    name: 'ANONYMIZED_USER',
                    email: `deleted_${uid}@anonymized.local`,
                    phone: admin.firestore.FieldValue.delete(),
                    photoURL: admin.firestore.FieldValue.delete(),
                    address: admin.firestore.FieldValue.delete(),
                    cpf: admin.firestore.FieldValue.delete(),
                    deletedAt: admin.firestore.FieldValue.serverTimestamp(),
                    isDeleted: true
                });
            }

            // 2. Disable Auth User (So they can't login again)
            await admin.auth().updateUser(uid, {
                disabled: true,
                displayName: 'ANONYMIZED_USER',
                // We cannot delete the email effectively without deleting the account, 
                // but we can scramble it if email uniqueness isn't a blocker for re-signup.
                // For now, just disabling is safer to prevent re-registration collision if not desired.
            });
            console.log('🔒 Conta de autenticação desativada.');

            // 3. Anonymize Enrollments (Keep progress stats, remove specific PII if any)
            const enrollmentsSnapshot = await db.collection('enrollments').where('userId', '==', uid).get();
            enrollmentsSnapshot.forEach(doc => {
                batch.update(doc.ref, {
                    userEmail: 'redacted',
                    userName: 'Anonymized Student'
                });
            });

            // 4. Delete Applications (Forms often have PII)
            const applicationsSnapshot = await db.collection('applications').where('uid', '==', uid).get();
            applicationsSnapshot.forEach(doc => {
                batch.delete(doc.ref); // Hard delete for raw forms is usually safer for LGPD
            });

            await batch.commit();
            console.log(`✅ Operação de esquecimento concluída para ${uid}.`);
            process.exit(0);

        } catch (error) {
            console.error("❌ Falha na anonimização:", error);
            process.exit(1);
        }
    });
}

anonymizeUser();
