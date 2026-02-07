const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env.local');
const keyPath = 'c:/Users/aless/OneDrive/Imagens/lithe-transport-479116-m2-firebase-adminsdk-fbsvc-99d53cd368.json';

try {
    const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    const privateKey = keyData.private_key;
    const base64Key = Buffer.from(privateKey).toString('base64');

    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

    // Check if base64 key exists
    if (envContent.includes('FIREBASE_PRIVATE_KEY_BASE64=')) {
        envContent = envContent.replace(/FIREBASE_PRIVATE_KEY_BASE64=.*/, `FIREBASE_PRIVATE_KEY_BASE64="${base64Key}"`);
    } else {
        envContent += `\nFIREBASE_PRIVATE_KEY_BASE64="${base64Key}"\n`;
    }

    // Also update project ID and client Email just in case
    if (envContent.includes('FIREBASE_PROJECT_ID=')) {
        envContent = envContent.replace(/FIREBASE_PROJECT_ID=.*/, `FIREBASE_PROJECT_ID="${keyData.project_id}"`);
    } else {
        envContent += `\nFIREBASE_PROJECT_ID="${keyData.project_id}"\n`;
    }

    if (envContent.includes('FIREBASE_CLIENT_EMAIL=')) {
        envContent = envContent.replace(/FIREBASE_CLIENT_EMAIL=.*/, `FIREBASE_CLIENT_EMAIL="${keyData.client_email}"`);
    } else {
        envContent += `\nFIREBASE_CLIENT_EMAIL="${keyData.client_email}"\n`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log('Successfully updated .env.local with Base64 key!');
} catch (error) {
    console.error('Error updating .env.local:', error);
    process.exit(1);
}
