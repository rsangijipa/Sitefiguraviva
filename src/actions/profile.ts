"use server";

import { auth, db, storage } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';
import sharp from 'sharp';

const MAX_SIZE_MB = 2; // User requested limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Schema for Profile Update (Server-Side Validation)
const updateProfileSchema = z.object({
    displayName: z.string().min(2, 'Nome muito curto').max(100, 'Nome muito longo'),
    bio: z.string().max(500, 'Bio muito longa').optional(),
});

/**
 * Updates basic profile info (DisplayName, Bio) with strict validation & audit.
 */
export async function updateProfile(data: { displayName: string; bio?: string }) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return { error: 'Unauthorized', status: 401 };

    try {
        const claims = await auth.verifySessionCookie(sessionCookie, true);
        const uid = claims.uid;

        // 1. Validate Input (Zod)
        const parseResult = updateProfileSchema.safeParse(data);
        if (!parseResult.success) {
            return { error: parseResult.error.issues[0]?.message || 'Dados inválidos', status: 400 };
        }
        const { displayName, bio } = parseResult.data;

        // 2. Fetch current for diff
        const userDocRef = db.collection('users').doc(uid);
        const userDoc = await userDocRef.get();
        const currentData = userDoc.data() || {};

        // 3. Update Auth (DisplayName only)
        await auth.updateUser(uid, {
            displayName
        });

        // 4. Update Firestore
        await userDocRef.set({
            displayName,
            bio: bio || '',
            updatedAt: new Date().toISOString()
        }, { merge: true });

        // 5. Audit Log (Refined Diffs)
        await logAudit({
            actor: { uid: uid, email: claims.email },
            action: 'profile.update',
            target: { collection: 'users', id: uid, summary: 'Updated profile info' },
            diff: {
                before: { displayName: currentData.displayName || '', bio: currentData.bio || '' },
                after: { displayName, bio: bio || '' }
            }
        });

        revalidatePath('/portal/settings');
        revalidatePath('/portal');

        return { success: true };

    } catch (error) {
        console.error("Profile Update Error:", error);
        return { error: 'Falha ao atualizar perfil.', status: 500 };
    }
}

/**
 * Uploads avatar image to Firebase Storage (Admin SDK) with strict sanitization (P1).
 */
export async function uploadAvatar(formData: FormData) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return { error: 'Unauthorized', status: 401 };

    try {
        const claims = await auth.verifySessionCookie(sessionCookie, true);
        const uid = claims.uid;

        const file = formData.get('file') as File;
        if (!file) return { error: 'Nenhum arquivo enviado.' };

        // 1. Basic Validation
        if (!ALLOWED_TYPES.includes(file.type)) {
            return { error: 'Formato inválido. Use JPG, PNG ou WEBP.' };
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            return { error: `Arquivo muito grande. Máximo ${MAX_SIZE_MB}MB.` };
        }

        // 2. Multi-step Sanitization (P1)
        const rawBuffer = Buffer.from(await file.arrayBuffer());

        // Remove EXIF, resize to 512px, convert to WebP for optimization
        const sanitizedBuffer = await sharp(rawBuffer)
            .resize(512, 512, {
                fit: 'cover',
                position: 'center'
            })
            .webp({ quality: 85 })
            .toBuffer();

        const fileName = `avatars/${uid}/avatar.webp`;
        const bucket = storage.bucket();
        const fileRef = bucket.file(fileName);

        await fileRef.save(sanitizedBuffer, {
            metadata: {
                contentType: 'image/webp',
                metadata: {
                    sanitized: 'true',
                    originalSize: file.size.toString(),
                    uploadedBy: uid
                }
            }
        });

        await fileRef.makePublic();
        const publicUrl = fileRef.publicUrl();

        // 3. Update User Record & Auth
        await db.collection('users').doc(uid).set({
            photoURL: publicUrl,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        await auth.updateUser(uid, {
            photoURL: publicUrl
        });

        // 4. Audit Log
        await logAudit({
            actor: { uid: uid, email: claims.email },
            action: 'profile.avatar_update',
            target: { collection: 'users', id: uid, summary: 'Uploaded and sanitized new avatar' },
            metadata: {
                originalSize: file.size,
                sanitizedSize: sanitizedBuffer.length,
                type: 'image/webp',
                url: publicUrl
            }
        });

        revalidatePath('/portal/settings');
        revalidatePath('/portal');

        return { success: true, url: publicUrl };

    } catch (error) {
        console.error("Avatar Upload Error:", error);
        return { error: 'Falha ao processar avatar.', status: 500 };
    }
}
