/**
 * @jest-environment node
 */
jest.mock("server-only", () => ({}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(),
}));
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { processEnrollmentEmails } from "../processor.server";

type Row = Record<string, any>;

function fakeDb(claimed: Row[], profiles: Row[], courses: Row[]) {
  const updates: Array<{ table: string; fields: Row; filters: Array<[string, string, unknown]> }> = [];
  const rpc = jest.fn(async () => ({ data: claimed, error: null }));
  const from = (table: string) => {
    const filters: Array<[string, string, unknown]> = [];
    let pendingUpdate: Row | null = null;
    const builder: any = {
      update: (fields: Row) => {
        pendingUpdate = fields;
        return builder;
      },
      select: () => builder,
      eq: (key: string, value: unknown) => {
        filters.push(["eq", key, value]);
        return builder;
      },
      lt: (key: string, value: unknown) => {
        filters.push(["lt", key, value]);
        return builder;
      },
      maybeSingle: async () => {
        const id = filters.find(([, key]) => key === "id")?.[2];
        const rows = table === "profiles" ? profiles : courses;
        return { data: rows.find((row) => row.id === id) ?? null, error: null };
      },
      then: (resolve: (value: unknown) => unknown) => {
        if (pendingUpdate) updates.push({ table, fields: pendingUpdate, filters });
        const data = pendingUpdate && filters.some(([op]) => op === "lt") ? [{ id: "stale" }] : null;
        return Promise.resolve({ data, error: null }).then(resolve);
      },
    };
    return builder;
  };
  return { client: { from, rpc }, updates, rpc };
}

const env = {
  RESEND_API_KEY: "re_test",
  ENROLLMENT_EMAIL_FROM: "Instituto Figura Viva <contato@institutofiguraviva.com.br>",
  NEXT_PUBLIC_BASE_URL: "https://www.institutofiguraviva.com.br",
};
const now = new Date("2026-11-15T12:00:00Z");
const row = (overrides: Row = {}) => ({
  id: "o1",
  event_key: "enrollment-confirmed/e1",
  user_id: "u1",
  course_id: "c1",
  kind: "enrollment_confirmed",
  attempts: 1,
  ...overrides,
});
const profiles = [{ id: "u1", email: "aluna@example.com", display_name: "Ana" }];
const courses = [{ id: "c1", title: "Supervisão Clínica: CO-VISAR" }];
const okFetch = () =>
  jest.fn(async () => new Response(JSON.stringify({ id: "re_123" }), { status: 200 }));

beforeEach(() => {
  process.env.NEXT_PUBLIC_BASE_URL = env.NEXT_PUBLIC_BASE_URL;
});

const outboxUpdates = (updates: ReturnType<typeof fakeDb>["updates"]) =>
  updates.filter((u) => u.table === "enrollment_email_outbox" && !u.filters.some(([op]) => op === "lt"));

it("does nothing and claims nothing until Resend is configured", async () => {
  const db = fakeDb([row()], profiles, courses);
  jest.mocked(createSupabaseServiceClient).mockReturnValue(db.client as any);
  const result = await processEnrollmentEmails({ env: {}, now });
  expect(result).toEqual({ status: "not_configured", missing: ["RESEND_API_KEY", "ENROLLMENT_EMAIL_FROM"] });
  expect(db.rpc).not.toHaveBeenCalled();
});

it("sends a confirmation with the event key as idempotency key and marks it sent", async () => {
  const db = fakeDb([row()], profiles, courses);
  jest.mocked(createSupabaseServiceClient).mockReturnValue(db.client as any);
  const fetchImpl = okFetch();

  const result = await processEnrollmentEmails({ env, now, fetchImpl });

  expect(result).toMatchObject({ status: "done", claimed: 1, sent: 1, retried: 0, failed: 0, canceledStale: 1 });
  const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
  expect(url).toBe("https://api.resend.com/emails");
  const headers = init.headers as Record<string, string>;
  expect(headers["Idempotency-Key"]).toBe("enrollment-confirmed/e1");
  expect(headers.Authorization).toBe("Bearer re_test");
  const body = JSON.parse(String(init.body));
  expect(body).toMatchObject({
    to: ["aluna@example.com"],
    from: env.ENROLLMENT_EMAIL_FROM,
    subject: "Matrícula confirmada: Supervisão Clínica: CO-VISAR",
  });
  expect(body.html).toContain("https://www.institutofiguraviva.com.br/portal");
  expect(body.text).toContain("Olá, Ana.");
  expect(outboxUpdates(db.updates)[0].fields).toMatchObject({ status: "sent", provider_id: "re_123", locked_at: null });
});

it("cancels stale pending events before claiming", async () => {
  const db = fakeDb([], profiles, courses);
  jest.mocked(createSupabaseServiceClient).mockReturnValue(db.client as any);
  await processEnrollmentEmails({ env, now, fetchImpl: okFetch() });
  const stale = db.updates.find((u) => u.filters.some(([op]) => op === "lt"));
  expect(stale?.fields.status).toBe("canceled");
  expect(stale?.filters).toEqual(
    expect.arrayContaining([
      ["eq", "status", "pending"],
      ["lt", "created_at", "2026-11-08T12:00:00.000Z"],
    ]),
  );
});

it("puts transient failures back in the queue with backoff", async () => {
  const db = fakeDb([row({ attempts: 2 })], profiles, courses);
  jest.mocked(createSupabaseServiceClient).mockReturnValue(db.client as any);
  const fetchImpl = jest.fn(async () => new Response(JSON.stringify({ message: "rate limited" }), { status: 429 }));

  const result = await processEnrollmentEmails({ env, now, fetchImpl });

  expect(result).toMatchObject({ retried: 1, failed: 0, sent: 0 });
  expect(outboxUpdates(db.updates)[0].fields).toMatchObject({
    status: "pending",
    last_error: "rate limited",
    next_attempt_at: "2026-11-15T12:30:00.000Z",
  });
});

it("fails permanently on a rejected address or after the last attempt", async () => {
  const rejected = fakeDb([row()], profiles, courses);
  jest.mocked(createSupabaseServiceClient).mockReturnValue(rejected.client as any);
  await processEnrollmentEmails({
    env,
    now,
    fetchImpl: jest.fn(async () => new Response(JSON.stringify({ message: "domain not verified" }), { status: 403 })),
  });
  expect(outboxUpdates(rejected.updates)[0].fields).toMatchObject({ status: "failed", last_error: "domain not verified" });

  const exhausted = fakeDb([row({ attempts: 5 })], profiles, courses);
  jest.mocked(createSupabaseServiceClient).mockReturnValue(exhausted.client as any);
  await processEnrollmentEmails({ env, now, fetchImpl: jest.fn(async () => { throw new Error("ECONNRESET"); }) });
  expect(outboxUpdates(exhausted.updates)[0].fields).toMatchObject({ status: "failed" });
});

it("fails a row whose student has no e-mail, without calling the provider", async () => {
  const db = fakeDb([row()], [{ id: "u1", email: null }], courses);
  jest.mocked(createSupabaseServiceClient).mockReturnValue(db.client as any);
  const fetchImpl = okFetch();
  await processEnrollmentEmails({ env, now, fetchImpl });
  expect(fetchImpl).not.toHaveBeenCalled();
  expect(outboxUpdates(db.updates)[0].fields).toMatchObject({ status: "failed", last_error: "Aluno sem e-mail cadastrado." });
});
