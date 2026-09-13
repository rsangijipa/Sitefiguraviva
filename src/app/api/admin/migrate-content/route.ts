import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type { Json } from "@/infrastructure/supabase/database.types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const claims = await verifySession();
    if (!claims) {
      return NextResponse.json(
        { error: "Unauthorized: No session" },
        { status: 401 },
      );
    }
    if (!claims.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admins only" },
        { status: 403 },
      );
    }

    const supabase = createSupabaseServiceClient();
    let migratedCount = 0;
    const pageSize = 500;
    for (let from = 0; ; from += pageSize) {
      const { data: lessons, error } = await supabase
        .from("lessons")
        .select("id, blocks, legacy_payload")
        .order("id", { ascending: true })
        .range(from, from + pageSize - 1);
      if (error) throw error;

      for (const lesson of lessons ?? []) {
        const blocks = Array.isArray(lesson.blocks) ? lesson.blocks : [];
        const legacyPayload =
          lesson.legacy_payload && typeof lesson.legacy_payload === "object"
            ? { ...(lesson.legacy_payload as Record<string, unknown>) }
            : {};
        const legacyContent = legacyPayload.content;

        if (
          blocks.length > 0 ||
          typeof legacyContent !== "string" ||
          !legacyContent.trim()
        ) {
          continue;
        }

        delete legacyPayload.content;
        legacyPayload.legacyContent = legacyContent;
        const { error: updateError } = await supabase
          .from("lessons")
          .update({
            blocks: [
              {
                id: `legacy-text-${lesson.id}`,
                type: "text",
                order: 1,
                isPublished: true,
                content: { text: legacyContent },
              },
            ] as unknown as Json,
            legacy_payload: legacyPayload as Json,
          })
          .eq("id", lesson.id);
        if (updateError) throw updateError;
        migratedCount += 1;
      }

      if (!lessons || lessons.length < pageSize) break;
    }

    return NextResponse.json({
      success: true,
      message: `Migrated ${migratedCount} legacy lessons to blocks.`,
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
