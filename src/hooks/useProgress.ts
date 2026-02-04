
import { useLiveQuery } from 'dexie-react-hooks';
import { db, OfflineProgress } from '@/lib/storage/db'; // Ensure correct import path
import { useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // Assuming you have an AuthContext
import { app, db as remoteDb } from '@/lib/firebase/client'; // Adjust to your firebase init file
import { doc, setDoc } from 'firebase/firestore';

export function useProgress(courseId: string, lessonId: string) {
    const { user } = useAuth();
    const userId = user?.uid;

    // 1. Live Query from IndexedDB (Always fast, reactive)
    const localProgress = useLiveQuery(
        () => userId ? db.progress.where({ userId, lessonId }).first() : Promise.resolve(undefined),
        [userId, lessonId]
    );

    // 2. Sync Function (Local -> Remote)
    const syncToRemote = useCallback(async (entry: OfflineProgress) => {
        if (!userId) return;

        try {
            // Firestore Path: progress/{uid}_{courseId} (Aggregate Doc)
            const docId = `${userId}_${courseId}`;
            const remoteRef = doc(remoteDb, 'progress', docId);

            await setDoc(remoteRef, {
                userId,
                courseId,
                [`lessonProgress.${lessonId}`]: {
                    completed: entry.completed,
                    seekPosition: entry.seekPosition,
                    updatedAt: new Date() // Use serverTimestamp() or Date
                },
                lastLessonId: lessonId,
                lastAccessedAt: new Date()
            }, { merge: true });

            // P1.4: Signal Completion to Event Bus (Total Sync)
            if (entry.completed) {
                import('@/app/actions/progress').then(({ completeLesson }) => {
                    completeLesson(courseId, lessonId).catch(err => console.warn("Event Bus Signal Failed", err));
                });
            }

            // Mark as synced locally
            if (entry.id) {
                await db.progress.update(entry.id, { synced: true });
            }
        } catch (err) {
            console.warn("Sync failed (Offline?):", err);
            // Leave synced=false to retry later
        }
    }, [userId, courseId, lessonId]);

    // 3. Save Function (UI calls this)
    // 3. Save Function (Local - fast)
    const updateProgress = useCallback(async (seekPosition: number, completed: boolean = false) => {
        if (!userId) return;

        const entry: OfflineProgress = {
            userId,
            courseId,
            lessonId,
            timestamp: Date.now(),
            seekPosition,
            completed,
            synced: false
        };

        // Upsert Local
        const existing = await db.progress.where({ userId, lessonId }).first();
        if (existing && existing.id) {
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
