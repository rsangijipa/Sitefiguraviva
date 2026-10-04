/** @jest-environment node */
const rpc = jest.fn(),
  redisLimit = jest.fn(),
  constructor = jest.fn();
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({ rpc }),
}));
jest.mock("@upstash/redis", () => ({ Redis: jest.fn() }));
jest.mock("@upstash/ratelimit", () => ({
  Ratelimit: Object.assign(
    jest.fn().mockImplementation((...args: unknown[]) => {
      constructor(...args);
      return { limit: redisLimit };
    }),
    { slidingWindow: jest.fn() },
  ),
}));
const saved = { ...process.env };
const config = { maxRequests: 2, windowMs: 60000 };
async function load() {
  return await import("../rateLimit");
}
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  for (const key of [
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "RATE_LIMIT_HASH_SECRET",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SECRET_KEY",
    "VERCEL",
    "RATE_LIMIT_IP_HEADER",
  ])
    delete process.env[key];
  Object.assign(process.env, {
    NODE_ENV: "production",
    SUPABASE_SERVICE_ROLE_KEY: "fake-test-key-with-at-least-32-characters",
  });
  rpc.mockResolvedValue({
    data: { allowed: true, remaining: 1, resetAt: Date.now() + 60000 },
    error: null,
  });
  redisLimit.mockResolvedValue({
    success: true,
    remaining: 1,
    reset: Date.now() + 60000,
  });
});
afterEach(() => {
  process.env = { ...saved };
  jest.useRealTimers();
});
it("uses shared PostgreSQL in production without Redis", async () => {
  const { rateLimit } = await load();
  await expect(
    rateLimit("person@example.com", "signup", config),
  ).resolves.toMatchObject({ allowed: true });
  expect(rpc).toHaveBeenCalledWith("consume_request_rate_limit", {
    p_key: expect.stringMatching(/^[0-9a-f]{64}$/),
    p_max: 2,
    p_window_ms: 60000,
  });
  expect(JSON.stringify(rpc.mock.calls)).not.toContain("person@example.com");
});
it("retains allowance across independent instance instances", async () => {
  const counts = new Map<string, number>();
  rpc.mockImplementation(async (_, args) => {
    const count = (counts.get(args.p_key) || 0) + 1;
    counts.set(args.p_key, count);
    return {
      data: {
        allowed: count <= 2,
        remaining: Math.max(0, 2 - count),
        resetAt: Date.now() + 60000,
      },
      error: null,
    };
  });
  let instance = await load();
  expect((await instance.rateLimit("id", "signup", config)).allowed).toBe(true);
  jest.resetModules();
  instance = await load();
  expect((await instance.rateLimit("id", "signup", config)).allowed).toBe(true);
  expect((await instance.rateLimit("id", "signup", config)).allowed).toBe(
    false,
  );
  expect(counts.size).toBe(1);
});
it("separates action and configuration counters", async () => {
  const { rateLimit } = await load();
  await rateLimit("id", "signup", config);
  await rateLimit("id", "reset", config);
  await rateLimit("id", "signup", { ...config, maxRequests: 3 });
  expect(new Set(rpc.mock.calls.map((c) => c[1].p_key)).size).toBe(3);
});
it("does not fall back to process memory when database fails", async () => {
  rpc.mockResolvedValue({
    data: null,
    error: { message: "database unavailable" },
  });
  const { rateLimit } = await load();
  await expect(rateLimit("id", "signup", config)).rejects.toMatchObject({
    name: "RateLimitUnavailableError",
  });
  await expect(rateLimit("id", "signup", config)).rejects.toMatchObject({
    name: "RateLimitUnavailableError",
  });
  expect(rpc).toHaveBeenCalledTimes(2);
});
it("rejects malformed shared responses", async () => {
  rpc.mockResolvedValue({
    data: { allowed: true, remaining: NaN, resetAt: 0 },
    error: null,
  });
  await expect(
    (await load()).rateLimit("id", "signup", config),
  ).rejects.toMatchObject({ name: "RateLimitUnavailableError" });
});
it("requires server hash key in production", async () => {
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  await expect(
    (await load()).rateLimit("id", "signup", config),
  ).rejects.toMatchObject({ name: "RateLimitUnavailableError" });
  expect(rpc).not.toHaveBeenCalled();
});
it("uses configured Redis and rejects its timeout success", async () => {
  Object.assign(process.env, {
    UPSTASH_REDIS_REST_URL: "https://redis.example.test",
    UPSTASH_REDIS_REST_TOKEN: "fake-token",
  });
  redisLimit.mockResolvedValue({
    success: true,
    reason: "timeout",
    remaining: 0,
    reset: 0,
  });
  await expect(
    (await load()).rateLimit("id", "signup", config),
  ).rejects.toMatchObject({ name: "RateLimitUnavailableError" });
  expect(constructor).toHaveBeenCalledWith(
    expect.objectContaining({ timeout: 0, analytics: false }),
  );
  expect(rpc).not.toHaveBeenCalled();
});
it("does not switch counters when configured Redis is unavailable", async () => {
  Object.assign(process.env, {
    UPSTASH_REDIS_REST_URL: "https://redis.example.test",
    UPSTASH_REDIS_REST_TOKEN: "fake-token",
  });
  redisLimit.mockRejectedValue(new Error("network failure"));
  await expect(
    (await load()).rateLimit("id", "signup", config),
  ).rejects.toMatchObject({ name: "RateLimitUnavailableError" });
  expect(rpc).not.toHaveBeenCalled();
});
it("bounds a stalled backend", async () => {
  jest.useFakeTimers();
  rpc.mockImplementation(() => new Promise(() => {}));
  const { rateLimit } = await load();
  const result = expect(
    rateLimit("id", "signup", config),
  ).rejects.toMatchObject({ name: "RateLimitUnavailableError" });
  await jest.advanceTimersByTimeAsync(3001);
  await result;
});
it("keeps local memory only for development with reset semantics", async () => {
  Object.assign(process.env, { NODE_ENV: "development" });
  const { rateLimit } = await load();
  expect((await rateLimit("local", "dev", config)).allowed).toBe(true);
  expect((await rateLimit("local", "dev", config)).allowed).toBe(true);
  expect((await rateLimit("local", "dev", config)).allowed).toBe(false);
  expect(rpc).not.toHaveBeenCalled();
});
it("does not trust arbitrary forwarded IPs by default", async () => {
  const { getClientIdentifier } = await load();
  expect(
    getClientIdentifier({
      headers: new Headers({ "x-forwarded-for": "203.0.113.99" }),
    }),
  ).toBe("unknown");
});
it("uses Vercel overwritten IP header when deployed there", async () => {
  process.env.VERCEL = "1";
  const { getClientIdentifier } = await load();
  expect(
    getClientIdentifier({
      headers: new Headers({
        "x-vercel-forwarded-for": "203.0.113.10",
        "x-forwarded-for": "198.51.100.5",
      }),
    }),
  ).toBe("203.0.113.10");
});
it("validates explicitly configured proxy addresses", async () => {
  process.env.RATE_LIMIT_IP_HEADER = "x-real-ip";
  const { getClientIdentifier } = await load();
  expect(
    getClientIdentifier({
      headers: new Headers({ "x-real-ip": "2001:db8::1" }),
    }),
  ).toBe("2001:db8::1");
  expect(
    getClientIdentifier({ headers: new Headers({ "x-real-ip": "forged-id" }) }),
  ).toBe("unknown");
});
it.each([
  { maxRequests: 0, windowMs: 60000 },
  { maxRequests: 2, windowMs: 0 },
])("rejects invalid configuration", async (invalid) => {
  await expect(
    (await load()).rateLimit("id", "signup", invalid),
  ).rejects.toThrow("Invalid rate limit configuration");
  expect(rpc).not.toHaveBeenCalled();
});

it("uses a server secret key for rate-limit hashing without a legacy service key", async () => {
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_SECRET_KEY =
    "sb_secret_fake-with-at-least-32-characters";
  const { rateLimit } = await load();
  await expect(
    rateLimit("person@example.com", "signup", config),
  ).resolves.toMatchObject({ allowed: true });
  expect(rpc).toHaveBeenCalledWith(
    "consume_request_rate_limit",
    expect.objectContaining({ p_key: expect.stringMatching(/^[0-9a-f]{64}$/) }),
  );
});
