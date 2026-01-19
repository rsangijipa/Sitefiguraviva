const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Construct service account from env vars
const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Handle private key newlines
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

if (!serviceAccount.privateKey || !serviceAccount.clientEmail) {
    console.error("❌ Missing FIREBASE_PRIVATE_KEY or FIREBASE_CLIENT_EMAIL in .env.local");
    process.exit(1);
}

// Initialize Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const uid = process.argv[2];

if (!uid) {
    console.error("Usage: node scripts/set-admin.js <uid>");
    process.exit(1);
}

async function setAdmin(uid) {
    try {
        await admin.auth().setCustomUserClaims(uid, { admin: true });
        console.log(`✅ Successfully made user ${uid} an ADMIN.`);

        // Verify
        const user = await admin.auth().getUser(uid);
        console.log("Current Claims:", user.customClaims);

    } catch (error) {
        console.error("❌ Error setting admin claim:", error);
    }
}

setAdmin(uid);
