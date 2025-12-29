// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Using hardcoded config as requested by USER to eliminate ENV issues
const firebaseConfig = {
    apiKey: "AIzaSyCt0HudxrbW6RN_3FMLxXdwbOOdd7mE01o",
    authDomain: "elosusgrupos.firebaseapp.com",
    projectId: "elosusgrupos",
    // FORCE appspot bucket for uploads to work
    storageBucket: "elosusgrupos.appspot.com",
    messagingSenderId: "257423216168",
    appId: "1:257423216168:web:c66b071490c6ddf8f86f1d",
    measurementId: "G-4FKDTE85BN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Log to confirm hardcoded init
console.log("🔥 Firebase Initialized with HARDCODED config (Bucket: elosusgrupos.appspot.com)");

export { app, analytics, db, auth, storage };
