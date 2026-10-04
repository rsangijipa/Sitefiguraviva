import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { getSupabaseSessionClaims } from "@/lib/auth/supabase-session";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import {
  compressImage,
  ImageCompressionError,
} from "@/lib/image-compression.server";

export const runtime = "nodejs";

const bucket = "assessment-submissions";
const acceptedFiles = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "video/mp4": [".mp4"],
  "video/quicktime": [".mov"],
} as const;

const formSchema = z.object({
  submissionId: z.string().uuid(),
  answerId: z
    .string()
    .min(1)
    .max(128)
    .regex(/^[A-Za-z0-9_-]+$/),
});

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get("session")?.value;
    const claims = session && (await getSupabaseSessionClaims(session));
    if (!claims?.isActive)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const limited = await rateLimit(
      getClientIdentifier(request),
      "assessment_file_upload",
      { maxRequests: 10, windowMs: 60_000 },
    );
    if (!limited.allowed)
      return NextResponse.json(
        { error: "Too many uploads. Wait a minute." },
        { status: 429 },
      );

    const formData = await request.formData();
    const parsed = formSchema.safeParse({
      submissionId: formData.get("submissionId"),
      answerId: formData.get("answerId"),
    });
    const file = formData.get("file");
    if (!parsed.success || !(file instanceof File))
      return NextResponse.json(
        { error: "Invalid upload request" },
        { status: 400 },
      );
    if (file.size === 0 || file.size > 10 * 1024 * 1024)
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 },
      );

    const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    const extensions = acceptedFiles[file.type as keyof typeof acceptedFiles];
    if (!extensions || !extensions.includes(extension as never))
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

    const supabase = createSupabaseServiceClient();
    const { data: submission, error: submissionError } = await supabase
      .from("assessment_submissions")
      .select("id,user_id,status")
      .eq("id", parsed.data.submissionId)
      .eq("user_id", claims.uid)
      .in("status", ["pending", "submitted"])
      .maybeSingle();
    if (submissionError) throw submissionError;
    if (!submission)
      return NextResponse.json(
        { error: "Submission not found or unavailable" },
        { status: 404 },
      );

    const filename = file.name.replace(/[^A-Za-z0-9._-]/g, "_").slice(-120);
    const rawBytes = Buffer.from(await file.arrayBuffer());
    const image = file.type.startsWith("image/")
      ? await compressImage(rawBytes, file.type, {
          format: "source",
          maxBytes: 10 * 1024 * 1024,
          maxDimension: 2560,
          quality: 88,
        })
      : null;
    const bytes = image?.body ?? rawBytes;
    const storagePath = `${claims.uid}/${submission.id}/${parsed.data.answerId}/${crypto.randomUUID()}-${filename}`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, bytes, {
        contentType: image?.contentType ?? file.type,
        upsert: false,
      });
    if (uploadError) throw uploadError;

    return NextResponse.json(
      {
        storagePath,
        fileName: filename,
        mimeType: image?.contentType ?? file.type,
        size: bytes.length,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ImageCompressionError)
      return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Assessment file upload failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
