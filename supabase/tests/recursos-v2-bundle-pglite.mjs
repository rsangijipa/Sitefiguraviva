// In-memory PostgreSQL only. Valida supabase/manual/01_aplicar_recursos_v2.sql
// nos cenários que o SQL Editor do Supabase pode encontrar.
import { PGlite } from "../../.next-v2-tools/node_modules/@electric-sql/pglite/dist/index.js";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { buildBundle, PREREQUISITES } from "../../scripts/build-recursos-v2-bundle.mjs";
import { buildDemoSeed } from "../../scripts/build-recursos-demo-seed.mjs";

const bundle = buildBundle();
assert.equal(readFileSync(new URL("../manual/01_aplicar_recursos_v2.sql", import.meta.url), "utf8"), bundle, "Regere o script: node scripts/build-recursos-v2-bundle.mjs");
const seed = buildDemoSeed();
assert.equal(readFileSync(new URL("../manual/02_conteudo_demonstracao.sql", import.meta.url), "utf8"), seed, "Regere o conteúdo: node scripts/build-recursos-demo-seed.mjs");

const BASE = `
 create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;
 create schema auth;create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create table public.profiles(id uuid primary key references auth.users(id),email text,role text not null,is_active boolean not null default true);
 create table public.courses(id text primary key,is_published boolean not null,status text not null);
 create table public.enrollments(id uuid primary key,user_id uuid references public.profiles(id),course_id text references public.courses(id),status text);
 grant usage on schema public,auth to anon,authenticated,service_role;`;
const HELPERS = `
 create schema private;
 create function private.current_auth_session_is_active() returns boolean language sql stable as $$select exists(select 1 from public.profiles where id=auth.uid() and is_active)$$;
 create function private.current_user_can_staff() returns boolean language sql stable as $$select exists(select 1 from public.profiles where id=auth.uid() and role in ('admin','tutor'))$$;
 create function private.current_user_can_admin() returns boolean language sql stable as $$select exists(select 1 from public.profiles where id=auth.uid() and role='admin')$$;
 grant usage on schema private to anon,authenticated,service_role;`;

async function scenario(name, setup, run) {
  const db = new PGlite();
  try { await db.exec(BASE); if (setup) await db.exec(setup); await run(db); console.log(`ok · ${name}`); }
  finally { await db.close(); }
}
const exists = async (db, sql) => (await db.query(`select (${sql}) as ok`)).rows[0].ok;
let checks = 0;

try {
  await scenario("banco sem as tabelas legadas", HELPERS, async db => {
    await db.exec(bundle);
    assert.ok(await exists(db, "to_regclass('public.interactive_resource_entries') is not null")); checks++;
    assert.ok(await exists(db, "exists(select 1 from information_schema.columns where table_name='resource_content_versions' and column_name='review_note')")); checks++;
    assert.equal((await db.query("select count(*)::int as n from public.resource_content_versions where status='draft'")).rows[0].n, 17); checks++;
  });

  const partial = HELPERS + "\n" + readFileSync(new URL(`../migrations/${PREREQUISITES[1]}`, import.meta.url), "utf8") + "\n" + readFileSync(new URL(`../migrations/${PREREQUISITES[2]}`, import.meta.url), "utf8");
  await scenario("banco com parte das tabelas legadas já criada", partial, async db => {
    await db.exec(bundle);
    assert.ok(await exists(db, "to_regtype('public.fv_resource_key') is not null")); checks++;
  });

  // Estado real informado pelo diagnóstico: só need_records existe, já com registros.
  // Ela pode ter vindo da migração do repositório ou da migração do app antigo.
  const appNeeds = `create table public.need_records (
    id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
    client_request_id uuid not null, schema_version integer not null default 1, content_version text not null default '1.0.0',
    state text not null check (state in ('selected','unsure')), entries jsonb not null default '[]'::jsonb,
    ordered boolean not null default false, focus_entry_id text, small_step text check (small_step is null or char_length(small_step)<=300),
    created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
    constraint uq_need_records_user_req unique (user_id, client_request_id), constraint ck_entries_max_five check (jsonb_array_length(entries)<=5));
   alter table public.need_records enable row level security;
   create policy "Alunos leem apenas seus proprios registros de necessidades" on public.need_records for select using (auth.uid()=user_id);`;
  const repoNeeds = readFileSync(new URL("../migrations/202609130008_need_records.sql", import.meta.url), "utf8");
  for (const [label, needs, requestId] of [["app antigo", appNeeds, "gen_random_uuid()"], ["repositório", repoNeeds, "'req-1'"]]) {
    await scenario(`need_records existente com dados (${label})`, `${HELPERS}\n${needs}`, async db => {
      await db.exec("insert into auth.users values('00000000-0000-4000-8000-000000000001'); insert into public.profiles(id,role) values('00000000-0000-4000-8000-000000000001','student');");
      await db.exec(`insert into public.need_records(user_id,client_request_id,content_version,state,entries) values('00000000-0000-4000-8000-000000000001',${requestId},'1.0.0','unsure','[]')`);
      await db.exec(bundle);
      const row = (await db.query("select resource_key::text as key, legacy_record, payload->>'state' as state, expires_at>now() as alive from public.need_records")).rows[0];
      assert.deepEqual(row, { key: "necessidades-agora", legacy_record: true, state: "unsure", alive: true }); checks++;
      assert.equal((await db.query("select count(*)::int as n from pg_policies where tablename='need_records'")).rows[0].n, 1); checks++;
    });
  }

  await scenario("conteúdo de demonstração", HELPERS, async db => {
    await db.exec(bundle);
    await assert.rejects(() => db.exec(seed), /Nenhuma conta de administração/); checks++;
    await db.exec("rollback");
    const admin = "00000000-0000-4000-8000-000000000009", reviewer = "00000000-0000-4000-8000-000000000008";
    await db.exec(`insert into auth.users values('${admin}'),('${reviewer}'); insert into public.profiles(id,role) values('${admin}','admin'),('${reviewer}','student');`);
    // Uma versão assinada de Igarapé já publicada não pode ser substituída.
    // O gatilho devolve ao rascunho quando o conteúdo muda; a assinatura vem num segundo passo.
    await db.exec(`update public.resource_content_versions set authored_by='${admin}',
      configuration=jsonb_set(configuration,'{items}','[{"id":"x","kind":"guidance","title":"T","text":"T","deck":"","format":"","prompt":"","teacherResponse":"","segments":[],"alternatives":[],"relatedConcepts":[],"references":[],"asset":"","license":""}]') where resource_key='igarape'`);
    await db.exec(`update public.resource_content_versions set status='published',reviewer_id='${reviewer}',reviewer_name='Revisão de teste',reviewer_crp='00/0000',reviewed_at=now() where resource_key='igarape'`);
    await db.exec(seed);
    const count = async (where) => (await db.query(`select count(*)::int as n from public.resource_content_versions where ${where}`)).rows[0].n;
    assert.equal(await count("status='published' and demo"), 16); checks++;
    assert.equal(await count("resource_key='igarape' and status='published' and not demo"), 1); checks++;
    assert.equal(await count("status='draft' and jsonb_array_length(configuration->'items')=0"), 0); checks++;
    assert.equal(await count("resource_key='cartas-gestalticas' and status='published' and jsonb_array_length(configuration->'items')=27"), 1); checks++;
    await db.exec(seed);
    assert.equal(await count("status='published' and demo"), 16); assert.equal(await count("status='archived' and demo"), 16); checks++;
  });

  await scenario("pré-requisito ausente aborta sem alterar nada", null, async db => {
    await assert.rejects(() => db.exec(bundle), /Pré-requisitos ausentes.*current_auth_session_is_active/); checks++;
    await db.exec("rollback");
    assert.ok(await exists(db, "to_regclass('public.interactive_resource_entries') is null and to_regtype('public.fv_resource_key') is null")); checks++;
  });

  await scenario("segunda execução é recusada com orientação", HELPERS, async db => {
    await db.exec(bundle);
    await assert.rejects(() => db.exec(bundle), /já estão aplicados/); checks++;
  });
  console.log(JSON.stringify({ engine: "PGlite PostgreSQL in-memory", checks, passed: true }));
} catch (error) { console.error(error.message); process.exitCode = 1; }
