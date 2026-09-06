import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { getSupabaseSessionClaims } from "@/lib/auth/supabase-session";

/**
 * File Upload API
 * Handles file uploads for practical assessment questions
 *
 * Security:
 * - Requires authentication
 * - File size limit: 10MB
 * - Allowed extensions: .pdf, .doc, .docx, .jpg, .png, .mp4
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = await getSupabaseSessionClaims(sessionCookie);
    if (!claims || !claims.isActive) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // P1-02: Rate Limit Uploads
    const { rateLimit, getClientIdentifier } = await import("@/lib/rateLimit");
    const rl = await rateLimit(getClientIdentifier(request), "file_upload", {
      maxRequests: 10,
      windowMs: 60000,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many uploads. Wait a minute." },
        { status: 429 },
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 },
      );
    }

    // P1-03: MIME validation + extension validation
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/quicktime",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type (MIME)" },
        { status: 400 },
      );
    }

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".jpg",
      ".jpeg",
      ".png",
      ".mp4",
      ".mov",
    ];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();

    if (!allowedExtensions.includes(fileExt)) {
      return NextResponse.json(
        {
          error: `File extension not allowed. Accepted: ${allowedExtensions.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${claims.uid}_${timestamp}_${sanitizedName}`;

    const filepath = `uploads/${claims.uid}/assessments/${filename}`;

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const supabase = createSupabaseServiceClient();
    const { error: uploadError } = await supabase.storage
      .from("course-assets")
      .upload(filepath, buffer, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;

    // Generate a long-lived signed URL for downloading (or standard public URL)
    // We use a 7-day signed URL as a secure default for private uploads.
    const { data: signed, error: signedError } = await supabase.storage
      .from("course-assets")
      .createSignedUrl(filepath, 7 * 24 * 60 * 60);
    if (signedError) throw signedError;

    return NextResponse.json({
      success: true,
      fileUrl: signed.signedUrl,
      filename,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
