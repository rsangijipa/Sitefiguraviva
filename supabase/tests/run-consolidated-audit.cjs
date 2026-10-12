const { PGlite } = require(process.env.PGLITE_MODULE || "@electric-sql/pglite");
const fs = require("node:fs");
const path = require("node:path");
(async () => {
  const db = new PGlite();
  await db.exec(
    `create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create schema storage; create table auth.users(id uuid primary key); create table auth.sessions(id uuid primary key,user_id uuid,created_at timestamptz default now(),not_after timestamptz); create table storage.objects(id uuid primary key); alter table storage.objects enable row level security; create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$; grant usage on schema auth to anon,authenticated,service_role; grant execute on all functions in schema auth to anon,authenticated,service_role;`,
  );
  for (const f of [
    "202606110001_p2_lms_foundation.sql",
    "202606110002_p2_lms_extended.sql",
    "202609040001_p0_rls_hardening.sql",
    "202609060001_task5_engagement_domains.sql",
    "202609060004_interactions_presence.sql",
    "20261003220157_block_02_enrollment_conflicts_active_access.sql",
    "20261004163454_block_17_session_revocation.sql",
    "20261012145104_consolidated_audit_database_hardening.sql",
  ]) {
    if (f === "20261012145104_consolidated_audit_database_hardening.sql")
      await db.exec(
        "grant all on all tables in schema public to authenticated,service_role; grant select on all tables in schema public to anon;",
      );
    let sql = fs
      .readFileSync(path.join(__dirname, "../migrations", f), "utf8")
      .replace("create extension if not exists pgcrypto;", "");
    try {
      await db.exec(sql);
      console.log("PASS migration", f);
    } catch (e) {
      console.error("FAIL", f, e.message);
      process.exit(1);
    }
  }

  try {
    await db.exec(
      fs.readFileSync(
        path.join(__dirname, "consolidated_audit_database_hardening.sql"),
        "utf8",
      ),
    );
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  console.log("PASS RLS and RPC regression tests");
  await db.close();
})();
