'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/auth/server';
import {
    DEFAULT_FOUNDER,
    DEFAULT_INSTITUTE,
    DEFAULT_TEAM,
    FounderSettings,
    InstituteSettings,
    TeamSettings
} from '@/lib/siteSettings';
import { Timestamp } from 'firebase-admin/firestore';

// --- Seed Action ---

export async function seedSiteSettingsAction() {
    try {
        await requireAdmin(); // Gate: Admin only

        const batch = adminDb.batch();

        // 1. Founder
        const founderRef = adminDb.collection('siteSettings').doc('founder');
        const founderSnap = await founderRef.get();
        if (!founderSnap.exists) {
            batch.set(founderRef, {
                ...DEFAULT_FOUNDER,
                updatedAt: Timestamp.now(),
                updatedBy: 'seed-script'
            });
        }

        // 2. Institute
        const instituteRef = adminDb.collection('siteSettings').doc('institute');
        const instituteSnap = await instituteRef.get();
        if (!instituteSnap.exists) {
            batch.set(instituteRef, {
                ...DEFAULT_INSTITUTE,
                updatedAt: Timestamp.now(),
                updatedBy: 'seed-script'
            });
        }

        // 3. Team
        const teamRef = adminDb.collection('siteSettings').doc('team');
        const teamSnap = await teamRef.get();
        if (!teamSnap.exists) {
            batch.set(teamRef, {
                ...DEFAULT_TEAM,
                updatedAt: Timestamp.now(),
                updatedBy: 'seed-script'
            });
        }

        await batch.commit();

        return { success: true, message: 'Site settings seeded successfully (idempotent).' };
    } catch (error: any) {
        console.error('Seed Error:', error);
        return { success: false, error: error.message };
    }
}

// --- Update Actions ---

export async function updateFounderSettingsAction(data: Partial<FounderSettings>) {
    try {
        const claims = await requireAdmin();

        await adminDb.collection('siteSettings').doc('founder').set({
            ...data,
            updatedAt: Timestamp.now(),
            updatedBy: claims.uid
        }, { merge: true });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateInstituteSettingsAction(data: Partial<InstituteSettings>) {
    try {
        const claims = await requireAdmin();

        await adminDb.collection('siteSettings').doc('institute').set({
            ...data,
            updatedAt: Timestamp.now(),
            updatedBy: claims.uid
        }, { merge: true });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTeamSettingsAction(data: TeamSettings) {
    try {
        const claims = await requireAdmin();

        await adminDb.collection('siteSettings').doc('team').set({
            members: data.members,
            updatedAt: Timestamp.now(),
            updatedBy: claims.uid
        }, { merge: true }); // Merge true preserves other fields if any, but members array is replaced

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
