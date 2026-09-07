const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!serviceAccountPath) {
    console.error("No FIREBASE_SERVICE_ACCOUNT_PATH");
    process.exit(1);
}

const cleanedPath = serviceAccountPath.replace(/^["']|["']$/g, '');
const fs = require('fs');
if (!fs.existsSync(cleanedPath)) {
    console.error("File not found:", cleanedPath);
    process.exit(1);
}

try {
    const serviceAccount = JSON.parse(fs.readFileSync(cleanedPath, 'utf8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("Admin Initialized for project:", serviceAccount.project_id);

    const db = admin.firestore();
    const courseId = 'Ti8sjbPwhL9j7E9KLCHc';

    async function test() {
        console.log("Fetching course:", courseId);
        try {
            const snap = await db.collection('courses').doc(courseId).get();
            if (snap.exists) {
                console.log("SUCCESS: Found course:", snap.data().title);
            } else {
                console.log("NOT FOUND: Course does not exist.");
            }
        } catch (e) {
            console.error("FAILURE:", e.message);
            if (e.code === 16) {
                console.error("This is the 16 UNAUTHENTICATED error!");
            }
        }
    }

    test();
} catch (e) {
    console.error("Parse/Init error:", e.message);
}
