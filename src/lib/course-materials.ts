export const COURSE_MATERIAL_BUCKET = "course-materials";
export const MAX_COURSE_MATERIAL_BYTES = 10 * 1024 * 1024;
export function materialDownloadUrl(id: string) {
  return `/api/materials/${encodeURIComponent(id)}`;
}
export function validatePrivateMaterialPath(
  courseId: string,
  path: unknown,
): path is string {
  return (
    typeof path === "string" &&
    path.startsWith(`courses/${courseId}/materials/`) &&
    /^courses\/[^/]+\/materials\/[0-9a-f-]{36}\.pdf$/i.test(path)
  );
}
export function safeExternalMaterialUrl(value: unknown): string {
  if (typeof value !== "string" || value.length > 2048)
    throw new Error("Informe um link HTTPS válido.");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Informe um link HTTPS válido.");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1"
  )
    throw new Error("Informe um link HTTPS válido.");
  return url.href;
}
