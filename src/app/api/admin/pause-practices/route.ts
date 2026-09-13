import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

const VALID_IDS = [
  "breathing",
  "observing",
  "listening",
  "movement",
  "slowing",
] as const;

type PracticeId = (typeof VALID_IDS)[number];

// Local type for pause_practices — mirrors migration 202609110012_pause_practices.sql
interface PausePracticeRow {
  id: string;
  title: string;
  description: string;
  content_text: string;
  sort_order: number;
  available: boolean;
  durations: unknown;
  capabilities: unknown;
  content_version: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Cast Supabase client to bypass strict schema lookup for new tables
const getSupabase = () =>
  createSupabaseServiceClient() as unknown as SupabaseClient<{
    public: {
      Tables: {
        pause_practices: {
          Row: PausePracticeRow;
          Insert: Partial<PausePracticeRow>;
          Update: Partial<PausePracticeRow>;
          Relationships: [];
        };
      };
      Views: Record<string, never>;
      Functions: Record<string, never>;
      Enums: Record<string, never>;
    };
  }>;

interface PatchBody {
  id?: string;
  title?: string;
  description?: string;
  order?: number;
  available?: boolean;
  content_text?: string;
  durations?: unknown;
  capabilities?: unknown;
}

function validatePatch(body: PatchBody): string | null {
  if (!body.id) return "id é obrigatório.";
  if (!VALID_IDS.includes(body.id as PracticeId)) {
    return `practice_id deve ser um dos valores: ${VALID_IDS.join(", ")}.`;
  }
  if (body.title !== undefined && typeof body.title === "string") {
    if (body.title.length > 100)
      return "title deve ter no máximo 100 caracteres.";
  }
  if (body.description !== undefined && typeof body.description === "string") {
    if (body.description.length > 200)
      return "description deve ter no máximo 200 caracteres.";
  }
  if (
    body.content_text !== undefined &&
    typeof body.content_text === "string"
  ) {
    if (body.content_text.length > 1000)
      return "content_text deve ter no máximo 1000 caracteres.";
  }
  if (body.order !== undefined) {
    const n = Number(body.order);
    if (!Number.isInteger(n) || n < 0)
      return "order deve ser um número inteiro não-negativo.";
  }
  if (body.available !== undefined && typeof body.available !== "boolean") {
    return "available deve ser um booleano.";
  }
  if (body.durations !== undefined) {
    const d = body.durations as unknown[];
    if (
      !Array.isArray(d) ||
      !d.every((v) => typeof v === "number" && Number.isInteger(v) && v > 0)
    ) {
      return "durations deve ser um array de inteiros positivos.";
    }
  }
  if (body.capabilities !== undefined) {
    const c = body.capabilities as Record<string, unknown>;
    if (
      typeof c !== "object" ||
      (c.audio !== undefined && typeof c.audio !== "boolean") ||
      (c.motion !== undefined && typeof c.motion !== "boolean") ||
      (c.static !== undefined && typeof c.static !== "boolean")
    ) {
      return "capabilities deve conter apenas audio, motion e static como booleanos.";
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const claims = await verifySession();
    if (!claims) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const sb = getSupabase();
    const { data, error } = await sb
      .from("pause_practices")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ practices: data ?? [] });
  } catch (error: any) {
    console.error("GET pause_practices error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const claims = await verifySession();
    if (!claims) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    if (!claims.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: PatchBody = await request.json();
    const validationError = validatePatch(body);
    if (validationError) {
      return NextResponse.json(
        { error: "validation_error", detail: validationError },
        { status: 400 },
      );
    }

    const sb = getSupabase();

    // Fetch current record first to bump content_version
    const { data: existing } = await (sb as any)
      .from("pause_practices")
      .select("content_version")
      .eq("id", body.id!)
      .single();

    const existingVersion: number = existing ? existing.content_version : 0;

    // Build typed update payload — columns match pause_practices table schema
    const updatePayload: Record<string, unknown> = {};
    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.description !== undefined)
      updatePayload.description = body.description;
    if (body.order !== undefined) updatePayload.sort_order = body.order;
    if (body.available !== undefined) updatePayload.available = body.available;
    if (body.content_text !== undefined) {
      updatePayload.content_text = body.content_text;
      updatePayload.content_version =
        typeof existingVersion === "number" ? existingVersion + 1 : 1;
    }
    if (body.durations !== undefined) updatePayload.durations = body.durations;
    if (body.capabilities !== undefined)
      updatePayload.capabilities = body.capabilities;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update." },
        { status: 400 },
      );
    }

    const updateResult = await (sb as any)
      .from("pause_practices")
      .update(updatePayload)
      .eq("id", body.id!);

    const selectResult = await (sb as any)
      .from("pause_practices")
      .select("*")
      .eq("id", body.id!)
      .single();

    const updatedRow = selectResult?.data ?? null;

    if (selectResult?.error) throw selectResult.error;
    if (updateResult?.error) throw updateResult.error;

    return NextResponse.json({ practice: updatedRow, success: true });
  } catch (error: any) {
    console.error("POST pause_practices error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
