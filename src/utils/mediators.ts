export interface Mediator {
  name: string;
  role: string;
  image: string;
  bio: string;
}

export function getMediatorDetails(value: unknown): Mediator | null {
  if (typeof value === "string") {
    return value.trim()
      ? { name: value.trim(), role: "Mediadora", image: "", bio: "" }
      : null;
  }
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.name !== "string" || !item.name.trim()) return null;
  const text = (...keys: string[]) => {
    for (const key of keys)
      if (typeof item[key] === "string" && item[key].trim())
        return item[key].trim();
    return "";
  };
  return {
    name: item.name.trim(),
    role: text("role", "title") || "Mediadora",
    image: text("image", "imageUrl", "photoURL", "photo"),
    bio: text("bio", "curriculum", "description"),
  };
}

// Public profiles are separate from the course's permission-bearing team map.
export function getCourseMediators(
  details: unknown,
  legacy: unknown,
  team: unknown,
): Mediator[] {
  const saved = (details as Record<string, unknown> | null)?.mediators;
  const old = (legacy as Record<string, unknown> | null)?.mediators;
  const source = Array.isArray(saved)
    ? saved
    : Array.isArray(old)
      ? old
      : Array.isArray(team)
        ? team
        : [];
  return source
    .map(getMediatorDetails)
    .filter((item): item is Mediator => item !== null);
}

export function getMediatorParagraphs(bio: string): string[] {
  const paragraphs = bio
    .split(/\n\s*\n/)
    .map((text) => text.trim())
    .filter(Boolean);
  if (paragraphs.length !== 1 || bio.length < 700) return paragraphs;
  // Older curricula were saved as one long paragraph. Group complete sentences for readability.
  const sentences = paragraphs[0].split(/(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-Þ])/u);
  const groups: string[] = [];
  for (const sentence of sentences) {
    const last = groups.length - 1;
    if (last < 0 || groups[last].length + sentence.length > 500)
      groups.push(sentence);
    else groups[last] += " " + sentence;
  }
  return groups;
}
