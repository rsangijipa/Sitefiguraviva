const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables manually to test
dotenv.config({ path: '.env.local' });

const projectId = (process.env.FIREBASE_PROJECT_ID || '').replace(/^["']|["']$/g, '');
const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').replace(/^["']|["']$/g, '');
const rawKey = process.env.FIREBASE_PRIVATE_KEY;

if (!rawKey) {
    console.error('No private key found in .env.local!');
    process.exit(1);
}

const privateKey = rawKey.replace(/\\n/g, '\n').replace(/^["']|["']$/g, '').replace(/\r/g, '').trim();

console.log('Testing Authentication...');
console.log('Project:', projectId);
console.log('Email:', clientEmail);
console.log('Key Length:', privateKey.length);

try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey
            })
        });
    }

    const db = admin.firestore();
    db.collection('test').limit(1).get()
        .then(() => {
            console.log('SUCCESS: Firestore connection established!');
            process.exit(0);
        })
        .catch(err => {
            console.error('FAILURE: Firestore connection error:', err.message);
            // Check for specific error code
            if (err.code === 16 || err.message.includes('UNAUTHENTICATED')) {
                console.error('\nPOSSIBLE CAUSES:\n1. Invalid Private Key Format\n2. Mismatched Client Email/Key\n3. System Clock Drift\n4. Expired/Revoked Credentials');
            }
            process.exit(1);
        });

} catch (error) {
    console.error('INITIALIZATION ERROR:', error);
}
