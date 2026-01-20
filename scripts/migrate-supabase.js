const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Setup Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase Credentials in .env.local");
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// Setup Firebase Admin
const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

if (!serviceAccount.privateKey) {
    console.error("❌ Missing FIREBASE_PRIVATE_KEY in .env.local");
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function migrateCollection(tableName, collectionName, transformFn = (x) => x) {
    console.log(`🚀 Migrating ${tableName} -> ${collectionName}...`);

    const { data: rows, error } = await supabase.from(tableName).select('*');
    if (error) {
        console.error(`❌ Error fetching ${tableName}:`, error.message);
        return;
    }

    console.log(`Found ${rows.length} rows in ${tableName}. Writing to Firestore...`);

    let batch = db.batch();
    let count = 0;
    let total = 0;

    for (const row of rows) {
        const transformed = transformFn(row);
        // Clean undefined values (Firestore rejects them)
        Object.keys(transformed).forEach(key => transformed[key] === undefined && delete transformed[key]);

        const docRef = db.collection(collectionName).doc(row.id || row.key); // Use ID or Key
        batch.set(docRef, transformed);
        count++;

        // Firestore batches max 500
        if (count >= 400) {
            await batch.commit();
            total += count;
            console.log(`...committed ${total} docs`);
            batch = db.batch();
            count = 0;
        }
    }

    if (count > 0) {
        await batch.commit();
        total += count;
    }

    console.log(`✅ Finished ${collectionName}: ${total} docs migrated.`);
}

async function run() {
    try {
        await migrateCollection('courses', 'courses');
        await migrateCollection('posts', 'posts');
        await migrateCollection('gallery', 'gallery');
        await migrateCollection('team_members', 'team_members');

        // Site Content (key-based)
        await migrateCollection('site_content', 'pages', (row) => ({
            ...row,
            // Ensure ID is key for pages
            id: row.key
        }));

        console.log("🎉 MIGRATION COMPLETE!");
    } catch (e) {
        console.error("Migration failed:", e);
    }
}

run();
