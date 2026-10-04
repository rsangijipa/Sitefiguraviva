/*
 * Idempotent private-storage migration.
 * Run with DRY_RUN=1 first, then `npm run migrate:assessment-attachments`.
 */
import { createClient } from "@supabase/supabase-js";
import { validateSupabaseKey } from "../src/infrastructure/supabase/environment.js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase URL and a server-only secret/service-role key are required");
validateSupabaseKey(url, key, "service");
const supabase = createClient(url, key, { auth: { persistSession: false } });
const dryRun = process.env.DRY_RUN === "1";
const publicPrefix = "/storage/v1/object/public/course-assets/";
let migrated = 0;
let skipped = 0;
let failed = 0;

function sourcePath(fileUrl) {
  try {
    const url = new URL(fileUrl);
    const index = url.pathname.indexOf(publicPrefix);
    return index >= 0 ? decodeURIComponent(url.pathname.slice(index + publicPrefix.length)) : null;
  } catch {
    return null;
  }
}

const { data: submissions, error } = await supabase
  .from("assessment_submissions")
  .select("id,user_id,answers,attachment_migration_state")
  .in("attachment_migration_state", ["legacy_pending", "native", "failed"]);
if (error) throw error;

for (const submission of submissions ?? []) {
  const answers = Array.isArray(submission.answers) ? submission.answers : [];
  let changed = false;
  const nextAnswers = [];
  try {
    for (const answer of answers) {
      if (!answer?.fileUrl || answer.storagePath) { nextAnswers.push(answer); continue; }
      const oldPath = sourcePath(answer.fileUrl);
      if (!oldPath || !submission.user_id || !answer.questionId) { nextAnswers.push(answer); skipped++; continue; }
      const name = oldPath.split("/").at(-1)?.replace(/[^A-Za-z0-9._-]/g, "_") || "attachment";
      const newPath = `${submission.user_id}/${submission.id}/${answer.questionId}/${crypto.randomUUID()}-${name}`;
      if (!dryRun) {
        const { data: blob, error: downloadError } = await supabase.storage.from("course-assets").download(oldPath);
        if (downloadError) throw downloadError;
        const { error: uploadError } = await supabase.storage.from("assessment-submissions").upload(newPath, blob, { upsert: false });
        if (uploadError) throw uploadError;
      }
      nextAnswers.push({ ...answer, storagePath: newPath, fileName: name, fileUrl: undefined });
      changed = true;
      migrated++;
    }
    if (changed && !dryRun) {
      const { error: updateError } = await supabase.from("assessment_submissions")
        .update({ answers: nextAnswers, attachment_migration_state: "migrated" })
        .eq("id", submission.id);
      if (updateError) throw updateError;
    }
  } catch (migrationError) {
    failed++;
    if (!dryRun) await supabase.from("assessment_submissions").update({ attachment_migration_state: "failed" }).eq("id", submission.id);
    console.error(`Submission ${submission.id} failed`, migrationError);
  }
}

console.log(JSON.stringify({ dryRun, migrated, skipped, failed, submissions: submissions?.length ?? 0 }));
process.exitCode = failed ? 1 : 0;
