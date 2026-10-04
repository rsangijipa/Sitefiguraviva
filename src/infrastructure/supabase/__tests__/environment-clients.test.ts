/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({})),
}));
const saved = { ...process.env };
beforeEach(() => {
  jest.resetModules();
  for (const name of [
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SECRET_KEY",
  ])
    delete process.env[name];
  process.env.NEXT_PUBLIC_SUPABASE_URL =
    "https://jdxorryvmcvtqsddkpdm.supabase.co";
});
afterEach(() => {
  process.env = { ...saved };
});
it("refuses browser secrets before invoking the SDK", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "sb_secret_fake";
  const { createSupabaseBrowserClient } = await import("../client");
  const { createClient } = await import("@supabase/supabase-js");
  expect(() => createSupabaseBrowserClient()).toThrow(/Privileged/);
  expect(createClient).not.toHaveBeenCalled();
});
it("refuses retired URLs on server and browser clients", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL =
    "https://ponhrxfdfbzaronotelp.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "sb_publishable_fake";
  process.env.SUPABASE_SECRET_KEY = "sb_secret_fake";
  const browser = await import("../client");
  const server = await import("../server");
  expect(() => browser.createSupabaseBrowserClient()).toThrow(/retired/);
  for (const create of [
    server.createSupabaseServiceClient,
    server.createSupabaseAnonServerClient,
    server.createSupabaseAuthServerClient,
  ])
    expect(() => create()).toThrow(/retired/);
  const { createClient } = await import("@supabase/supabase-js");
  expect(createClient).not.toHaveBeenCalled();
});
it("accepts new server keys without persisting a user session", async () => {
  process.env.SUPABASE_SECRET_KEY = "sb_secret_fake";
  const { createSupabaseServiceClient } = await import("../server");
  createSupabaseServiceClient();
  const { createClient } = await import("@supabase/supabase-js");
  expect(createClient).toHaveBeenCalledWith(
    expect.any(String),
    "sb_secret_fake",
    expect.objectContaining({
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  );
});
it("does not silently use a public key for the privileged client", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_fake";
  const { createSupabaseServiceClient } = await import("../server");
  expect(() => createSupabaseServiceClient()).toThrow(/server-side/);
  process.env.SUPABASE_SECRET_KEY = "sb_publishable_fake";
  expect(() => createSupabaseServiceClient()).toThrow(/Server-side/);
  const { createClient } = await import("@supabase/supabase-js");
  expect(createClient).not.toHaveBeenCalled();
});
