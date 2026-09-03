/**
 * SCRIPT PARA CRIAR DOCUMENTO DE USUÁRIO NO FIRESTORE
 * Uso: node scripts/create-user-doc.js <email>
 */

const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  console.error(
    "Erro: Credenciais de Firebase Admin não encontradas no .env.local",
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

const email = process.argv[2];

if (!email) {
  console.error("Uso: node scripts/create-user-doc.js <email>");
  process.exit(1);
}

async function createUserDoc() {
  try {
    const user = await admin.auth().getUserByEmail(email);

    // Create/Update Firestore document
    await admin
      .firestore()
      .collection("users")
      .doc(user.uid)
      .set(
        {
          email: user.email,
          displayName: user.displayName || email.split("@")[0],
          role: "admin",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { merge: true },
      );

    console.log(`✅ Documento Firestore criado/atualizado para ${email}`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Role: admin`);
    process.exit(0);
  } catch (error) {
    console.error("Erro ao criar documento:", error);
    process.exit(1);
  }
}

createUserDoc();
