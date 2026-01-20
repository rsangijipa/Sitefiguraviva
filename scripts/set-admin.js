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

const identifier = process.argv[2];

if (!identifier) {
    console.error("Usage: node scripts/set-admin.js <uid_or_email>");
    process.exit(1);
}

async function setAdmin(input) {
    try {
        let user;

        // Check if input looks like an email
        if (input.includes('@')) {
            try {
                user = await admin.auth().getUserByEmail(input);
                console.log(`🔍 Found user by email: ${user.email} (${user.uid})`);
            } catch (e) {
                console.error(`❌ No user found with email: ${input}`);
                return;
            }
        } else {
            try {
                user = await admin.auth().getUser(input);
                console.log(`🔍 Found user by UID: ${user.uid}`);
            } catch (e) {
                console.error(`❌ No user found with UID: ${input}`);
                return;
            }
        }

        const uid = user.uid;

        // Set the Claim
        await admin.auth().setCustomUserClaims(uid, { admin: true });
        console.log(`✅ Successfully made user ${user.email} (${uid}) an ADMIN.`);

        // Verify
        const updatedUser = await admin.auth().getUser(uid);
        console.log("Current Claims:", updatedUser.customClaims);
        console.log("⚠️  User may need to logout and login again/refresh token to see changes.");

    } catch (error) {
        console.error("❌ Error setting admin claim:", error);
    }
}

setAdmin(identifier);
