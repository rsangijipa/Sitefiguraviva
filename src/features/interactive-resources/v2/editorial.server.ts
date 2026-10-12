import "server-only";
import { cache } from "react";
import { resourceDatabase, type ContentRow } from "./database.server";
import { EditorialConfigSchema, assertPublishable, type EditorialVersion } from "./editorial-schema";
import type { ResourceKey } from "./contracts";

export function contentVersion(row: ContentRow): EditorialVersion {
  return {
    id: row.id, resourceKey: row.resource_key, version: row.version,
    status: row.status as EditorialVersion["status"],
    configuration: EditorialConfigSchema.parse(row.configuration), authoredBy: row.authored_by,
    reviewerName: row.reviewer_name, reviewerCrp: row.reviewer_crp, reviewedAt: row.reviewed_at,
  };
}
export const publishedEditorial = cache(async (key: ResourceKey): Promise<EditorialVersion | null> => {
  try {
    const db = resourceDatabase();
    const { data, error } = await db.from("resource_content_versions").select("*").eq("resource_key", key).eq("status", "published").order("version", { ascending: false }).limit(1).maybeSingle();
    if (error || !data?.reviewer_id || !data.reviewer_name || !data.reviewer_crp || !data.reviewed_at) return null;
    const version = contentVersion(data);
    if (version.configuration.resourceKey !== key) return null;
    assertPublishable(version.configuration);
    if (version.configuration.artApprovalId) {
      const art = await db.from("resource_art_approvals").select("id").eq("id", version.configuration.artApprovalId).maybeSingle();
      if (art.error || !art.data) return null;
    }
    return version;
  } catch { return null; } // Unapplied migration/unavailable database never publishes legacy data.
});
