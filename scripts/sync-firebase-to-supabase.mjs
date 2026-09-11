import { createClient } from "@supabase/supabase-js";
import admin from "firebase-admin";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or Supabase API Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function write(table, payload, options) {
  const { error } = await supabase.from(table).upsert(payload, options);
  if (error) throw new Error(`${table}: ${error.message}`);
}

function normalizeCourseStatus(value) {
  const status = String(value || "draft").trim().toLowerCase();
  return ({ aberto: "open", aberto_para_inscricao: "open", publicado: "open", fechado: "closed", arquivado: "archived" })[status] || (['draft', 'open', 'closed', 'archived'].includes(status) ? status : 'draft');
}

function normalizeBillingType(value) {
  const type = String(value || "free").trim().toLowerCase();
  return ({ gratuito: "free", assinatura: "subscription", recorrente: "subscription", avulso: "one_time" })[type] || (['subscription', 'one_time', 'free'].includes(type) ? type : 'free');
}

function normalizeEnrollmentStatus(value) {
  const status = String(value || "active").trim().toLowerCase();
  if (status === "cancelled") return "canceled";
  return ["pending_approval", "active", "completed", "canceled", "refunded", "pending", "expired", "locked", "awaiting_payment", "awaiting_approval", "blocked", "past_due", "rejected"].includes(status) ? status : "pending";
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("⚠️ Firebase Admin environment variables missing. Data export will skip Firebase reads.");
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
}

async function syncFirebaseToSupabase() {
  console.log("🚀 Starting Firebase -> Supabase ETL Sync...");

  if (!admin.apps.length) {
    console.log("Skipping Firestore export because Firebase credentials were not provided.");
    return;
  }

  const firestore = admin.firestore();

  // 1. Sync Site Content
  console.log("📦 Syncing 'site_content'...");
  const siteContentSnap = await firestore.collection("site_content").get();
  for (const doc of siteContentSnap.docs) {
    const data = doc.data();
    await write("site_content", {
      key: doc.id,
      content: data,
    });
  }
  console.log(`✅ Synced ${siteContentSnap.size} site_content items.`);

  // 2. Sync Courses
  console.log("📦 Syncing 'courses'...");
  const coursesSnap = await firestore.collection("courses").get();
  for (const doc of coursesSnap.docs) {
    const c = doc.data();
    await write("courses", {
      id: doc.id,
      title: c.title || "Curso sem título",
      subtitle: c.subtitle || null,
      slug: c.slug || doc.id,
      description: c.description || null,
      cover_image_url: c.coverImageUrl || c.cover_image_url || null,
      instructor_name: c.instructorName || c.instructor_name || null,
      is_published: c.isPublished ?? c.is_published ?? false,
      status: normalizeCourseStatus(c.status),
      billing_type: normalizeBillingType(c.billingType || c.billing_type),
      tags: Array.isArray(c.tags) ? c.tags : [],
      details: c.details || {},
      team: c.team || {},
      stats: c.stats || {},
      certificate_rules: c.certificateRules || c.certificate_rules || { enabled: false },
      legacy_payload: c,
    });

    // Subcollection: modules
    const modulesSnap = await firestore.collection("courses").doc(doc.id).collection("modules").get();
    for (const mDoc of modulesSnap.docs) {
      const m = mDoc.data();
      await write("course_modules", {
        id: mDoc.id,
        course_id: doc.id,
        title: m.title || "Módulo sem título",
        description: m.description || null,
        sort_order: m.order ?? m.sort_order ?? 0,
        is_published: m.isPublished ?? true,
        legacy_payload: m,
      });

      // Subcollection: lessons
      const lessonsSnap = await firestore
        .collection("courses")
        .doc(doc.id)
        .collection("modules")
        .doc(mDoc.id)
        .collection("lessons")
        .get();

      for (const lDoc of lessonsSnap.docs) {
        const l = lDoc.data();
        await write("lessons", {
          id: lDoc.id,
          course_id: doc.id,
          module_id: mDoc.id,
          title: l.title || "Aula sem título",
          description: l.description || null,
          sort_order: l.order ?? l.sort_order ?? 0,
          is_published: l.isPublished ?? true,
          type: l.type || "text",
          video_url: l.videoUrl || l.video_url || null,
          blocks: l.blocks || [],
          legacy_payload: l,
        });
      }
    }
  }
  console.log(`✅ Synced ${coursesSnap.size} courses and their nested modules/lessons.`);

  // 3. Sync Enrollments
  console.log("📦 Syncing 'enrollments'...");
  const enrollmentsSnap = await firestore.collection("enrollments").get();
  let skippedOrphans = 0;
  for (const doc of enrollmentsSnap.docs) {
    const e = doc.data();
    const legacyUid = e.uid || e.userId || null;
    if (!legacyUid || !e.courseId) continue;
    const { data: courseExists, error: courseLookupError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", e.courseId)
      .maybeSingle();
    if (courseLookupError) throw new Error(`courses lookup: ${courseLookupError.message}`);
    if (!courseExists) {
      skippedOrphans += 1;
      console.warn(`⚠️ Skipping orphan enrollment ${doc.id}: course ${e.courseId} is not present in Supabase.`);
      continue;
    }
    const enrollmentPayload = {
      user_id: null,
      legacy_firebase_uid: legacyUid,
      course_id: e.courseId,
      status: normalizeEnrollmentStatus(e.status),
      payment_status: e.paymentStatus || null,
      payment_method: e.paymentMethod || null,
      legacy_payload: e,
    };
    const { data: existingEnrollment, error: lookupError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("legacy_firebase_uid", legacyUid)
      .eq("course_id", e.courseId)
      .maybeSingle();
    if (lookupError) throw new Error(`enrollments lookup: ${lookupError.message}`);
    if (existingEnrollment?.id) {
      const { error } = await supabase.from("enrollments").update(enrollmentPayload).eq("id", existingEnrollment.id);
      if (error) throw new Error(`enrollments: ${error.message}`);
    } else {
      await write("enrollments", enrollmentPayload);
    }
  }
  console.log(`✅ Synced ${enrollmentsSnap.size - skippedOrphans} enrollments; skipped ${skippedOrphans} orphan enrollments.`);

  console.log("🎉 Firebase -> Supabase ETL Sync Completed Successfully!");
}

syncFirebaseToSupabase().catch((err) => {
  console.error("❌ Sync Error:", err);
  process.exit(1);
});
