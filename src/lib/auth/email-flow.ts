// Use deployment configuration, never form input or forwarded request headers.
export function getAuthEmailRedirect(
  kind: "confirm" | "recovery",
  courseId?: string,
) {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (!base)
    throw new Error(
      "NEXT_PUBLIC_BASE_URL is required for Auth email redirects.",
    );
  const origin = new URL(base);
  if (
    origin.protocol !== "https:" &&
    !(
      origin.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)
    )
  ) {
    throw new Error("Auth redirect requires HTTPS or local development.");
  }
  if (origin.username || origin.password)
    throw new Error("Invalid Auth redirect origin.");
  const url = new URL(
    kind === "confirm" ? "/auth/confirm" : "/auth/update-password",
    origin.origin,
  );
  if (kind === "confirm" && courseId)
    url.searchParams.set("courseId", courseId);
  return url.toString();
}
