import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type { Json } from "@/infrastructure/supabase/database.types";
import {
  DEFAULT_FOUNDER,
  DEFAULT_INSTITUTE,
  DEFAULT_SEO,
} from "@/lib/siteSettings";

export async function GET(request: NextRequest) {
  try {
    const claims = await verifySession();
    if (!claims) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    if (!claims.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createSupabaseServiceClient();
    const defaults = [
      { key: "founder", content: DEFAULT_FOUNDER },
      { key: "institute", content: DEFAULT_INSTITUTE },
      { key: "seo", content: DEFAULT_SEO },
    ];
    const { data: existing, error: readError } = await supabase
      .from("public_pages")
      .select("key")
      .in(
        "key",
        defaults.map((setting) => setting.key),
      );
    if (readError) throw readError;

    const existingKeys = new Set(
      (existing ?? []).map((setting) => setting.key),
    );
    const missing = defaults
      .filter((setting) => !existingKeys.has(setting.key))
      .map((setting) => ({
        key: setting.key,
        content: setting.content as unknown as Json,
        is_published: true,
        published_at: new Date().toISOString(),
      }));

    if (missing.length > 0) {
      const { error: insertError } = await supabase
        .from("public_pages")
        .insert(missing);
      if (insertError) throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: "Site settings seeded successfully (idempotent).",
    });
  } catch (error: any) {
    console.error("Seed Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
