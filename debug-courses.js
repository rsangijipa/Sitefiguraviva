const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'c:/Users/aless/OneDrive/Imagens/lithe-transport-479116-m2-firebase-adminsdk-fbsvc-99d53cd368.json';

if (!fs.existsSync(serviceAccountPath)) {
    console.error('Service account not found:', serviceAccountPath);
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function listCourses() {
    console.log('Fetching courses from project:', serviceAccount.project_id);
    const snap = await admin.firestore().collection('courses').get();

    if (snap.empty) {
        console.log('No courses found.');
        return;
    }

    console.log(`Found ${snap.size} courses:`);
    snap.forEach(doc => {
        const data = doc.data();
        console.log(`- [${doc.id}] ${data.title} (Status: ${data.status || 'N/A'}, Published: ${data.isPublished})`);
    });
}

listCourses().catch(console.error);
