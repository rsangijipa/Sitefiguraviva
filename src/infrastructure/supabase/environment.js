// Shared by Next config and the clients. No environment reads or Node APIs here.
// JWT decoding only classifies configuration; Supabase verifies authentication.
const retiredProjects = new Set([
  "ponhrxfdfbzaronotelp",
  "svffadtbyuyodajbwpsa",
]);

/** @param {string} key */
function legacyClaims(key) {
  const parts = key.trim().split(".");
  if (parts.length !== 3) return undefined;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(
      atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "=")),
    );
    return claims && typeof claims === "object" ? claims : undefined;
  } catch {
    return undefined;
  }
}

/** @param {string} value */
function validateSupabaseUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Invalid NEXT_PUBLIC_SUPABASE_URL.");
  }
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    (url.protocol !== "https:" && !(loopback && url.protocol === "http:")) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.pathname !== "/" && url.pathname !== "")
  )
    throw new Error(
      "Supabase URL must be an HTTPS origin (HTTP loopback is allowed for local tests).",
    );
  const ref = /^([a-z0-9]+)\.supabase\.co$/.exec(
    url.hostname.replace(/\.$/, ""),
  )?.[1];
  if (ref && retiredProjects.has(ref))
    throw new Error("Supabase configuration references a retired project.");
  return { url: url.origin, ref };
}

/** @param {string} urlValue @param {string} key @param {'public'|'service'} kind */
function validateSupabaseKey(urlValue, key, kind) {
  const { ref } = validateSupabaseUrl(urlValue);
  const claims = legacyClaims(key);
  if (claims?.ref && retiredProjects.has(claims.ref))
    throw new Error("Supabase key references a retired project.");
  if (ref && claims?.ref && ref !== claims.ref)
    throw new Error("Supabase URL and key reference different projects.");
  if (
    kind === "public" &&
    (key.trim().startsWith("sb_secret_") ||
      (claims?.role && claims.role !== "anon"))
  )
    throw new Error(
      "Privileged Supabase keys must never be configured in NEXT_PUBLIC variables.",
    );
  if (
    kind === "service" &&
    (key.trim().startsWith("sb_publishable_") ||
      (claims?.role && claims.role !== "service_role"))
  )
    throw new Error(
      "Server-side Supabase access requires a secret or service-role key.",
    );
}

/** @param {Record<string, string | undefined>} env */
function assertSupabaseBuildEnvironment(env) {
  for (const [name, value] of Object.entries(env)) {
    if (!name.startsWith("NEXT_PUBLIC_") || !value) continue;
    const claims = legacyClaims(value);
    if (
      /SERVICE_ROLE|SECRET_KEY|PRIVATE_KEY|DATABASE_PASSWORD/.test(name) ||
      value.trim().startsWith("sb_secret_") ||
      claims?.role === "service_role"
    )
      throw new Error(
        "A privileged credential is configured in a NEXT_PUBLIC variable. Remove it before building.",
      );
    if (claims?.ref && retiredProjects.has(claims.ref))
      throw new Error(
        "A public variable references a retired Supabase project.",
      );
  }
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return; // Runtime clients still require their complete configuration.
  validateSupabaseUrl(url);
  for (const key of [
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ])
    if (key) validateSupabaseKey(url, key, "public");
  for (const key of [env.SUPABASE_SECRET_KEY, env.SUPABASE_SERVICE_ROLE_KEY])
    if (key) validateSupabaseKey(url, key, "service");
}

exports.validateSupabaseUrl = validateSupabaseUrl;
exports.validateSupabaseKey = validateSupabaseKey;
exports.assertSupabaseBuildEnvironment = assertSupabaseBuildEnvironment;
