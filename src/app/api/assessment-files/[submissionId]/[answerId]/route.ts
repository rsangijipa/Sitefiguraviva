import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { getSupabaseSessionClaims } from "@/lib/auth/supabase-session";

const paramsSchema = z.object({
  submissionId: z.string().uuid(),
  answerId: z
    .string()
    .min(1)
    .max(128)
    .regex(/^[A-Za-z0-9_-]+$/),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ submissionId: string; answerId: string }> },
) {
  const session = request.cookies.get("session")?.value;
  const claims = session && (await getSupabaseSessionClaims(session));
  if (!claims?.isActive)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = paramsSchema.safeParse(await context.params);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid file reference" },
      { status: 400 },
    );

  const supabase = createSupabaseServiceClient();
  const { data: submission, error } = await supabase
    .from("assessment_submissions")
    .select("user_id,answers")
    .eq("id", parsed.data.submissionId)
    .maybeSingle();
  if (error) throw error;
  if (
    !submission ||
    (submission.user_id !== claims.uid && !claims.admin && !claims.tutor)
  )
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const answer = Array.isArray(submission.answers)
    ? (submission.answers.find(
        (item) =>
          item &&
          typeof item === "object" &&
          (item as { questionId?: string }).questionId === parsed.data.answerId,
      ) as { storagePath?: string } | undefined)
    : undefined;
  if (
    !answer?.storagePath ||
    !answer.storagePath.startsWith(
      `${submission.user_id}/${parsed.data.submissionId}/${parsed.data.answerId}/`,
    )
  )
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data: signed, error: signedError } = await supabase.storage
    .from("assessment-submissions")
    .createSignedUrl(answer.storagePath, 600);
  if (signedError || !signed)
    throw signedError ?? new Error("Could not sign assessment file");
  return NextResponse.redirect(signed.signedUrl);
}
