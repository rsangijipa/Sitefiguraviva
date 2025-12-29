
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString } from "firebase/storage";
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const config1 = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    // Try currently configured bucket
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET
};

// Common alternative: project-id.appspot.com
const config2 = {
    ...config1,
    storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`
};

async function testBucket(config, name) {
    console.log(`Testing Bucket Config: ${name} (${config.storageBucket})`);
    try {
        const app = initializeApp(config, name);
        const storage = getStorage(app);
        const testRef = ref(storage, 'test_upload.txt');
        await uploadString(testRef, "Test content");
        console.log(`✅ Success! The correct bucket is: ${config.storageBucket}`);
        return config.storageBucket;
    } catch (e) {
        console.error(`❌ Failed: ${e.code || e.message}`);
        return null;
    }
}

async function main() {
    let successBucket = await testBucket(config1, "CurrentEnv");

    if (!successBucket) {
        successBucket = await testBucket(config2, "AppSpotFallback");
    }

    if (successBucket) {
        console.log(`\nRECOMMENDATION: Update .env VITE_FIREBASE_STORAGE_BUCKET to: ${successBucket}`);
    } else {
        console.log("\n❌ All attempts failed. Please verify Storage Rules allow write or check Console for exact bucket name.");
    }
}

main();
