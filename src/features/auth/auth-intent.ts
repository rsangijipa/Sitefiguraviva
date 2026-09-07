export type AuthIntent = "student" | "admin";

type SearchParamsReader = Pick<URLSearchParams, "get">;

export function getAuthIntent(searchParams: SearchParamsReader): AuthIntent {
  const explicitIntent = searchParams.get("intent");
  const nextPath = searchParams.get("next");

  if (explicitIntent === "admin" || nextPath?.startsWith("/admin")) {
    return "admin";
  }

  return "student";
}

export function getSafeNextPath(
  nextPath: string | null | undefined,
  role: string | null | undefined,
): string {
  const fallback = role === "admin" ? "/admin" : "/portal";

  if (
    !nextPath ||
    !nextPath.startsWith("/") ||
    nextPath.startsWith("//") ||
    nextPath.includes("\\")
  ) {
    return fallback;
  }

  if (nextPath.startsWith("/admin") && role !== "admin") {
    return "/portal";
  }

  return nextPath;
}
