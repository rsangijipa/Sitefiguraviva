import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/infrastructure/supabase/database.types";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type { ResourceKey } from "./contracts";

export interface RecordRow {
  id: string; user_id: string; resource_key: ResourceKey; schema_version: number;
  formation_id: string | null; payload: Json; created_at: string; updated_at: string;
  expires_at: string; legacy_record: boolean; client_request_id: string; content_version: string | null;
}
export interface ContentRow {
  id: string; resource_key: ResourceKey; version: number; status: string;
  configuration: Json; authored_by: string | null; reviewer_id: string | null;
  reviewer_name: string | null; reviewer_crp: string | null; reviewed_at: string | null;
  created_at: string; updated_at: string;
}
type Table<Row> = { Row: Row & Record<string, unknown>; Insert: Partial<Row> & Record<string, unknown>; Update: Partial<Row> & Record<string, unknown>; Relationships: [] };
type ResourceDatabase = Omit<Database, "public"> & {
  public: Omit<Database["public"], "Tables"> & { Tables: Omit<Database["public"]["Tables"], "interactive_resource_entries"> & {
    arrival_records: Table<RecordRow>; polarity_records: Table<RecordRow>; phenomenology_lab_records: Table<RecordRow>;
    interactive_resource_entries: Table<RecordRow>;
    resource_content_versions: Table<ContentRow>;
    resource_editorial_roles: Table<{ user_id: string; role: "docente_autor" | "docente_revisor"; crp: string; name: string }>;
    resource_formation_retention: Table<{ enrollment_id: string; user_id: string; course_id: string; title: string; end_date: string; departure_date: string | null }>;
    resource_release_checks: Table<{ id: string; backup_max_days: number; restoration_verified_at: string | null; ledger_verified_at: string | null; purge_verified_at: string | null; enabled: boolean }>;
    resource_art_approvals: Table<{ id: string; kit_version: string; approved_by: string; approved_at: string; assets: Json }>;
  }};
};
// Reuse the existing privileged client. This single boundary describes unapplied
// local migrations without creating a second client or exposing its key.
export function resourceDatabase() { return createSupabaseServiceClient() as unknown as SupabaseClient<ResourceDatabase>; }
export function recordTable(key: ResourceKey) {
  if (key === "chegada") return "arrival_records" as const;
  if (key === "polaridades-e-cadeiras") return "polarity_records" as const;
  if (key === "laboratorio-fenomenologico") return "phenomenology_lab_records" as const;
  return "interactive_resource_entries" as const;
}
export const RECORD_TABLES = ["arrival_records", "polarity_records", "phenomenology_lab_records", "interactive_resource_entries"] as const;
