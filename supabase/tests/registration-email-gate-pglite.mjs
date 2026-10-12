// In-memory PostgreSQL only. Valida que a aprovação de cadastro exige e-mail confirmado.
import { PGlite } from "../../.next-v2-tools/node_modules/@electric-sql/pglite/dist/index.js";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const read = (file) => readFileSync(new URL(`../migrations/${file}`, import.meta.url), "utf8");
const ids = {
  admin: "00000000-0000-4000-8000-000000000001", student: "00000000-0000-4000-8000-000000000002",
  confirmed: "00000000-0000-4000-8000-000000000003", spam: "00000000-0000-4000-8000-000000000004",
  tutor: "00000000-0000-4000-8000-000000000005",
};
const db = new PGlite();
let checks = 0;
const approve = (actor, target, flag = true) => db.query("select public.review_pending_registration($1,$2,$3) as r", [actor, target, flag]);
try {
  await db.exec(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin;
    create schema auth;
    create table auth.users(id uuid primary key, email text, email_confirmed_at timestamptz);
    create table public.profiles(id uuid primary key, email text, role text not null default 'student', is_active boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz);
    create table public.admin_operation_events(id bigserial primary key, actor_id uuid, target_id uuid, action text, details jsonb);
    grant usage on schema public to service_role;`);
  await db.exec(read("20261012195500_admin_registration_approval.sql"));
  await db.exec(read("20261013130000_registration_email_verification_gate.sql"));
  await db.query(`insert into auth.users values ($1,'a@x.com',now()),($2,'s@x.com',null),($3,'c@x.com',now()),($4,'sp@x.com',null),($5,'t@x.com',now())`, [ids.admin, ids.student, ids.confirmed, ids.spam, ids.tutor]);
  await db.query(`insert into public.profiles(id,email,role,is_active,registration_status) values
    ($1,'a@x.com','admin',true,'approved'),($2,'s@x.com','student',false,'pending'),($3,'c@x.com','student',false,'pending'),
    ($4,'sp@x.com','student',false,'pending'),($5,'t@x.com','tutor',true,'approved')`, [ids.admin, ids.student, ids.confirmed, ids.spam, ids.tutor]);

  await assert.rejects(() => approve(ids.admin, ids.student), /Email not confirmed/); checks++;
  const stillPending = (await db.query("select is_active, registration_status from public.profiles where id=$1", [ids.student])).rows[0];
  assert.deepEqual(stillPending, { is_active: false, registration_status: "pending" }); checks++;
  assert.equal((await db.query("select count(*)::int as n from public.admin_operation_events")).rows[0].n, 0); checks++;

  await approve(ids.admin, ids.confirmed);
  assert.deepEqual((await db.query("select is_active, registration_status from public.profiles where id=$1", [ids.confirmed])).rows[0], { is_active: true, registration_status: "approved" }); checks++;
  assert.equal((await db.query("select details->>'email_confirmed' as c from public.admin_operation_events where target_id=$1", [ids.confirmed])).rows[0].c, "true"); checks++;

  // Rejeitar cadastro não confirmado é permitido (spam).
  await approve(ids.admin, ids.spam, false);
  assert.deepEqual((await db.query("select is_active, registration_status from public.profiles where id=$1", [ids.spam])).rows[0], { is_active: false, registration_status: "rejected" }); checks++;

  // Quem não é administração ativa não revisa nada, nem com e-mail confirmado.
  await assert.rejects(() => approve(ids.tutor, ids.student), /Administrator required/); checks++;
  await assert.rejects(() => approve(ids.confirmed, ids.student), /Administrator required/); checks++;

  // Cadastro já decidido não é revisto, e usuário inexistente falha.
  await assert.rejects(() => approve(ids.admin, ids.confirmed), /Pending registration not found/); checks++;
  await assert.rejects(() => approve(ids.admin, "00000000-0000-4000-8000-0000000000ff"), /Pending registration not found/); checks++;

  // Privilégios: o booleano só é executável pelo service_role.
  await db.exec("set role authenticated");
  await assert.rejects(() => db.query("select public.registration_email_confirmed($1)", [ids.confirmed])); checks++;
  await assert.rejects(() => db.query("select public.review_pending_registration($1,$2,true)", [ids.admin, ids.student])); checks++;
  await db.exec("reset role; set role service_role");
  assert.equal((await db.query("select public.registration_email_confirmed($1) as c", [ids.confirmed])).rows[0].c, true); checks++;
  assert.equal((await db.query("select public.registration_email_confirmed($1) as c", [ids.student])).rows[0].c, false); checks++;
  assert.equal((await db.query("select public.registration_email_confirmed('00000000-0000-4000-8000-0000000000ff') as c")).rows[0].c, false); checks++;
  await db.exec("reset role");
  console.log(JSON.stringify({ engine: "PGlite PostgreSQL in-memory", checks, passed: true }));
} catch (error) { console.error(error.message); process.exitCode = 1; } finally { await db.close(); }
