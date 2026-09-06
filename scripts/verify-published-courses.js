const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

// Verify Prerequisite
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!serviceAccountPath || !require("fs").existsSync(serviceAccountPath)) {
  console.error("ERROR: FIREBASE_SERVICE_ACCOUNT_PATH not set or invalid.");
  console.error(
    "This script requires the local service account for verification.",
  );
  process.exit(1);
}

// Initialize Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(require(serviceAccountPath)),
    });
    console.log("✅ Admin Initialized via Service Account");
  } catch (e) {
    console.error("Initialization Failed:", e.message);
    process.exit(1);
  }
}

const db = admin.firestore();

async function verify() {
  console.log("\n--- Verifying Course Visibility (War Room Criteria) ---\n");

  // 1. Execute Merge Strategy (Same as source code)
  const [openSnap, publishedSnap] = await Promise.all([
    db.collection("courses").where("status", "==", "open").get(),
    db.collection("courses").where("isPublished", "==", true).get(),
  ]);

  const coursesMap = new Map();
  [...openSnap.docs, ...publishedSnap.docs].forEach((doc) => {
    if (!coursesMap.has(doc.id)) {
      coursesMap.set(doc.id, { id: doc.id, ...doc.data() });
    }
  });

  const visibleCourses = Array.from(coursesMap.values());
  console.log(`✅ VISIBLE COURSES (${visibleCourses.length}):`);
  visibleCourses.forEach((c) => {
    console.log(
      `  - [${c.id}] ${c.title} (Status: ${c.status}, Published: ${c.isPublished})`,
    );
  });

  // 2. Fetch ALL to find hidden/inconsistent ones
  const allSnap = await db.collection("courses").get();
  const hidden = allSnap.docs.filter((d) => !coursesMap.has(d.id));

  if (hidden.length > 0) {
    console.log(`\n🚫 HIDDEN COURSES (${hidden.length}):`);
    hidden.forEach((d) => {
      const c = d.data();
      console.log(
        `  - [${d.id}] ${c.title} (Status: ${c.status}, Published: ${c.isPublished})`,
      );

      // Logic Check: Should this be hidden?
      const shouldBeVisible = c.status === "open" || c.isPublished === true;
      if (shouldBeVisible) {
        console.error(
          `  !!! CRITICAL ERROR: Course ${d.id} matches visibility criteria but was NOT found in merge query! Check Indexes/Types!`,
        );
      } else {
        console.log(`    -> Properly hidden (Draft/Archived)`);
      }
    });
  } else {
    console.log("\nAll courses are currently visible.");
  }

  console.log("\n--- Verification Complete ---");
}

verify().catch(console.error);
