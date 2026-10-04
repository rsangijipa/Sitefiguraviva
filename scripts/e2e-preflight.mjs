import { pathToFileURL } from "node:url";

export function assertIsolatedE2eEnvironment(env) {
  const url = new URL(env.BASE_URL || "");
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/" ||
    url.port ||
    [
      "institutofiguraviva.com.br",
      "www.institutofiguraviva.com.br",
      "localhost",
      "127.0.0.1",
    ].includes(url.hostname)
  )
    throw new Error(
      "Use an explicit HTTPS staging origin, separate from production.",
    );
  if (
    env.E2E_ISOLATED_ENVIRONMENT !== "true" ||
    env.E2E_ALLOW_MUTATIONS !== "true"
  )
    throw new Error(
      "Explicit isolated staging and mutation settings are required.",
    );
  if (
    !/^[a-z]{20}$/.test(env.E2E_SUPABASE_PROJECT_REF || "") ||
    env.E2E_SUPABASE_PROJECT_REF === "jdxorryvmcvtqsddkpdm"
  )
    throw new Error("A separate staging Supabase project is required.");
  for (const name of [
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "STUDENT_EMAIL",
    "STUDENT_PASSWORD",
  ])
    if (!env[name]?.trim()) throw new Error(`Missing ${name}.`);
  return url.origin;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    assertIsolatedE2eEnvironment(process.env);
    console.log("Isolated E2E configuration verified.");
  } catch {
    console.error(
      "E2E blocked: configure isolated staging, a separate database and test accounts.",
    );
    process.exitCode = 1;
  }
}
