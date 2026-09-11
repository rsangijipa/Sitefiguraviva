"use server";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { uploadPublicAsset } from "@/infrastructure/supabase/storage.server";
import { verifySession } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { z } from "zod";
import sharp from "sharp";
import { logger } from "@/lib/logger";

const MAX_SIZE_MB = 5;
const MAX_IMAGE_DIMENSION = 8000;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Schema for Profile Update (Server-Side Validation)
const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Nome muito curto")
    .max(100, "Nome muito longo"),
  bio: z.string().trim().max(500, "Bio muito longa").optional(),
  phoneNumber: z.string().trim().max(30, "Telefone inválido").optional(),
  profession: z.string().trim().max(100, "Profissão muito longa").optional(),
  city: z.string().trim().max(100, "Cidade muito longa").optional(),
  state: z.string().trim().max(2, "UF inválida").optional(),
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
    .optional(),
  instagram: z.string().trim().max(60, "Instagram muito longo").optional(),
});

/**
 * Updates basic profile info (DisplayName, Bio) with strict validation & audit.
 */
export async function updateProfile(data: {
  displayName: string;
  bio?: string;
  phoneNumber?: string;
  profession?: string;
  city?: string;
  state?: string;
  dateOfBirth?: string;
  instagram?: string;
}) {
  try {
    const claims = await verifySession();
    if (!claims) return { error: "Unauthorized", status: 401 };
    const uid = claims.uid;
    const supabase = createSupabaseServiceClient();

    // 1. Validate Input (Zod)
    const parseResult = updateProfileSchema.safeParse(data);
    if (!parseResult.success) {
      return {
        error: parseResult.error.issues[0]?.message || "Dados inválidos",
        status: 400,
      };
    }
    const {
      displayName,
      bio,
      phoneNumber,
      profession,
      city,
      state,
      dateOfBirth,
      instagram,
    } = parseResult.data;

    const normalizedPhone = phoneNumber?.replace(/\s+/g, "") || "";
    const normalizedProfession = profession?.trim() || "";
    const normalizedCity = city?.trim() || "";
    const normalizedState = state?.trim().toUpperCase() || "";
    const normalizedInstagram = instagram?.trim().replace(/^@/, "") || "";

    const essentialCount = [
      displayName?.trim(),
      normalizedPhone,
      normalizedProfession,
      normalizedCity,
      normalizedState,
      dateOfBirth,
    ].filter(Boolean).length;
    const profileCompletion = Math.round((essentialCount / 6) * 100);

    // 2. Fetch current for diff
    const { data: currentData } = await supabase
      .from("profiles")
      .select(
        "display_name,bio,phone_number,profession,city,state,date_of_birth,instagram,profile_completion",
      )
      .eq("id", uid)
      .maybeSingle();

    // 3. Update Auth (DisplayName only)
    const { error: authError } = await supabase.auth.admin.updateUserById(uid, {
      user_metadata: { displayName },
    });
    if (authError) throw authError;

    // 4. Update Firestore
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: uid,
      display_name: displayName,
      bio: bio || "",
      phone_number: normalizedPhone,
      profession: normalizedProfession,
      city: normalizedCity,
      state: normalizedState,
      date_of_birth: dateOfBirth || null,
      instagram: normalizedInstagram,
      profile_completion: profileCompletion,
      profile_completed_at:
        profileCompletion === 100 ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    } as any);
    if (profileError) throw profileError;

    // 5. Audit Log (Refined Diffs)
    await logAudit({
      actor: { uid: uid, email: claims.email },
      action: "profile.update",
      target: { collection: "users", id: uid, summary: "Updated profile info" },
      diff: {
        before: {
          displayName: currentData?.display_name || "",
          bio: currentData?.bio || "",
          phoneNumber: currentData?.phone_number || "",
          profession: currentData?.profession || "",
          city: currentData?.city || "",
          state: currentData?.state || "",
          dateOfBirth: currentData?.date_of_birth || "",
          instagram: currentData?.instagram || "",
          profileCompletion: currentData?.profile_completion || 0,
        },
        after: {
          displayName,
          bio: bio || "",
          phoneNumber: normalizedPhone,
          profession: normalizedProfession,
          city: normalizedCity,
          state: normalizedState,
          dateOfBirth: dateOfBirth || "",
          instagram: normalizedInstagram,
          profileCompletion,
        },
      },
    });

    revalidatePath("/portal/settings");
    revalidatePath("/portal");

    return { success: true };
  } catch (error) {
    console.error("Profile Update Error:", error);
    return { error: "Falha ao atualizar perfil.", status: 500 };
  }
}

/**
 * Uploads a sanitized avatar to the canonical Supabase Storage bucket.
 */
export async function uploadAvatar(formData: FormData) {
  try {
    const claims = await verifySession();
    if (!claims) return { error: "Unauthorized", status: 401 };
    const uid = claims.uid;

    const file = formData.get("file") as File;
    if (!file) return { error: "Nenhum arquivo enviado." };

    // 1. Basic Validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { error: "Formato inválido. Use JPG, PNG ou WEBP." };
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return { error: `Arquivo muito grande. Máximo ${MAX_SIZE_MB}MB.` };
    }

    // 2. Decode, validate and sanitize the actual image contents.
    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // Sanitization must never be skippable in production: this flag exists
    // only to speed up local development when Sharp's native binary isn't
    // available, and is hard-disabled outside development regardless of the
    // env value (see P1-04 in docs/RELATORIO_AUDITORIA_COMPLETA_2026-09-04.md).
    const BYPASS_SHARP =
      process.env.NODE_ENV !== "production" &&
      process.env.DEBUG_BYPASS_SHARP === "true";
    let sanitizedBuffer: Buffer;

    if (BYPASS_SHARP) {
      logger.warn("[uploadAvatar] Sharp sanitization bypassed (dev only)");
      sanitizedBuffer = rawBuffer;
    } else {
      // Remove EXIF, resize to 512px, convert to WebP for optimization
      try {
        const image = sharp(rawBuffer, {
          limitInputPixels: MAX_IMAGE_DIMENSION ** 2,
        });
        const metadata = await image.metadata();
        if (
          !metadata.width ||
          !metadata.height ||
          metadata.width > MAX_IMAGE_DIMENSION ||
          metadata.height > MAX_IMAGE_DIMENSION ||
          !["jpeg", "png", "webp"].includes(metadata.format || "")
        ) {
          return {
            error:
              "A imagem enviada é inválida ou excede as dimensões permitidas.",
          };
        }

        sanitizedBuffer = await image
          .resize(512, 512, {
            fit: "cover",
            position: "center",
          })
          .webp({ quality: 85 })
          .toBuffer();
      } catch (sharpError: any) {
        logger.error("[uploadAvatar] Sharp sanitization failed", {
          uid,
          message: sharpError.message,
        });
        return { error: "Falha no processamento da imagem." };
      }
    }

    const publicUrl = await uploadPublicAsset({
      bucket: "course-assets",
      path: `avatars/${uid}/avatar.webp`,
      body: sanitizedBuffer,
      contentType: "image/webp",
    });

    // 3. Update User Record & Auth
    const supabase = createSupabaseServiceClient();
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ photo_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", uid);
    if (profileError) throw profileError;

    // 4. Audit Log
    await logAudit({
      actor: { uid: uid, email: claims.email },
      action: "profile.avatar_update",
      target: {
        collection: "users",
        id: uid,
        summary: "Uploaded and sanitized new avatar",
      },
      metadata: {
        originalSize: file.size,
        sanitizedSize: sanitizedBuffer.length,
        type: "image/webp",
        url: publicUrl,
      },
    });

    revalidatePath("/portal/settings");
    revalidatePath("/portal");

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Avatar Upload Error:", error);
    return { error: "Falha ao processar avatar.", status: 500 };
  }
}
