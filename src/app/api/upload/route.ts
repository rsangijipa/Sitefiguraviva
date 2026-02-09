import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase/admin";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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

    const claims = await auth.verifySessionCookie(sessionCookie, true);

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

    // Validate file extension
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
          error: `File type not allowed. Accepted: ${allowedExtensions.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${claims.uid}_${timestamp}_${sanitizedName}`;

    // Save to public/uploads directory
    const uploadDir = join(process.cwd(), "public", "uploads", "assessments");

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = join(uploadDir, filename);

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file
    await writeFile(filepath, buffer);

    // Return public URL
    const fileUrl = `/uploads/assessments/${filename}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      filename,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
