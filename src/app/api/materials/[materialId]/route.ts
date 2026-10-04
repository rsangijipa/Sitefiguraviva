import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import {
  COURSE_MATERIAL_BUCKET,
  safeExternalMaterialUrl,
  validatePrivateMaterialPath,
} from "@/lib/course-materials";
export const dynamic = "force-dynamic";
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ materialId: string }> },
) {
  const session = await verifySession();
  const headers = {
    "Cache-Control": "private, no-store",
    "Referrer-Policy": "no-referrer",
  };
  if (!session)
    return NextResponse.json(
      { error: "Faça login para acessar o material." },
      { status: 401, headers },
    );
  try {
    const { materialId } = await context.params;
    const db = createSupabaseServiceClient();
    const { data, error } = await db.rpc("resolve_course_material", {
      p_user: session.uid,
      p_material: materialId,
    });
    if (error || !data)
      return NextResponse.json(
        { error: "Material indisponível para esta conta." },
        { status: 404, headers },
      );
    const material = data as {
      type: string;
      url: string;
      course_id: string;
      storage_bucket: string | null;
      storage_path: string | null;
    };
    let url: string;
    if (
      material.storage_bucket === COURSE_MATERIAL_BUCKET &&
      validatePrivateMaterialPath(material.course_id, material.storage_path)
    ) {
      const { data: signed, error: signError } = await db.storage
        .from(COURSE_MATERIAL_BUCKET)
        .createSignedUrl(material.storage_path, 60, { download: true });
      if (signError || !signed?.signedUrl)
        throw new Error("Missing signed URL");
      url = signed.signedUrl;
    } else if (material.type === "link") {
      url = safeExternalMaterialUrl(material.url);
    } else {
      return NextResponse.json(
        {
          error: "Este arquivo antigo precisa ser migrado pelo administrador.",
        },
        { status: 409, headers },
      );
    }
    return new NextResponse(null, {
      status: 302,
      headers: { ...headers, Location: url },
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível abrir o material." },
      { status: 404, headers },
    );
  }
}
