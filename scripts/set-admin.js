/**
 * SCRIPT PARA ELEVAR USUÁRIO A ADMIN
 * Uso: node scripts/set-admin.js <email>
 */

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error("Erro: Credenciais de Firebase Admin não encontradas no .env.local");
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
});

const email = process.argv[2];

if (!email) {
    console.error("Uso: node scripts/set-admin.js <email>");
    process.exit(1);
}

async function setAdmin() {
    try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, { admin: true, role: 'admin' });
        console.log(`Sucesso! O usuário ${email} agora é um administrador.`);
        process.exit(0);
    } catch (error) {
        console.error("Erro ao definir admin:", error);
        process.exit(1);
    }
}

setAdmin();
