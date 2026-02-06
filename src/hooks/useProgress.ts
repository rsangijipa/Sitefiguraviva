
import { useLiveQuery } from 'dexie-react-hooks';
import { db, OfflineProgress } from '@/lib/storage/db';
import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateLessonProgress } from '@/actions/progress';

export function useProgress(courseId: string, moduleId: string, lessonId: string) {
    const { user } = useAuth();
    const userId = user?.uid;

    // 1. Live Query from IndexedDB
    const localProgress = useLiveQuery(
        () => userId ? db.progress.where({ userId, lessonId }).first() : Promise.resolve(undefined),
        [userId, lessonId]
    );

    // 2. Sync Function (Local -> Server Action)
    const syncToRemote = useCallback(async (entry: OfflineProgress) => {
        if (!userId) return;
        if (entry.synced) return; // Skip if already synced

        try {
            await updateLessonProgress(
                courseId,
                moduleId,
                lessonId,
                {
                    status: entry.completed ? 'completed' : 'in_progress',
                    maxWatchedSecond: entry.seekPosition, // Assuming seekPosition tracks max watched? Or need logic?
                    // Ideally check max, but for now passing seekPosition is "current progress"
                    percent: entry.completed ? 100 : 0
                }
            );

            // Mark as synced locally
            if (entry.id) {
                await db.progress.update(entry.id, { synced: true });
            }
        } catch (err) {
            console.warn("Sync failed (Offline?):", err);
        }
    }, [userId, courseId, moduleId, lessonId]);

    // 3. Save Function (UI calls this)
    const updateProgress = useCallback(async (seekPosition: number, completed: boolean = false) => {
        if (!userId) return;

        const entry: OfflineProgress = {
            userId,
            courseId,
            lessonId,
            timestamp: Date.now(),
            seekPosition, // We are treating this as "max watched" effectively if monotonic
            completed,
            synced: false
        };

        // Upsert Local
        const existing = await db.progress.where({ userId, lessonId }).first();
        if (existing && existing.id) {
            // Only update locally if advanced? Or always update?
            // For maxWatched validation (VP-01), the Server Action will handle merging max.
            await db.progress.update(existing.id, entry);
        } else {
            await db.progress.add(entry);
        }
    }, [userId, courseId, lessonId]);

    // 4. Force Sync (Call on Pause/Unmount/Complete)
    const triggerSync = useCallback(async () => {
        if (!userId) return;
        const entry = await db.progress.where({ userId, lessonId }).first();
        if (entry) {
            syncToRemote(entry);
        }
    }, [userId, lessonId, syncToRemote]);

    return {
        progress: localProgress,
        updateProgress,
        triggerSync
    };
}
