"use client";

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/storage/db';
import { updateLessonProgress } from '@/actions/progress';

export function useProgressSync(courseId: string, moduleId: string, lessonId: string, userId: string) {
    // 1. Load local state (Optimistic)
    const localProgress = useLiveQuery(
        () => db.progress.findByLesson(userId, lessonId),
        [userId, lessonId]
    );

    const [isSyncing, setIsSyncing] = useState(false);

    // 2. Sync Logic
    const syncProgress = async (data: { completed?: boolean; seekPosition?: number }) => {
        if (!userId) return;

        const now = Date.now();

        // A. Save Locally First (Optimistic)
        await db.progress.put({
            id: localProgress?.id, // Keep ID if exists to update
            userId,
            courseId,
            lessonId,
            completed: data.completed ?? localProgress?.completed ?? false,
            seekPosition: data.seekPosition ?? localProgress?.seekPosition ?? 0,
            timestamp: now,
            synced: false // Pending sync
        });

        // B. Attempt Server Sync
        setIsSyncing(true);
        try {
            const result = await updateLessonProgress(
                courseId,
                moduleId,
                lessonId,
                {
                    status: data.completed ? 'completed' : 'in_progress',
                    // We can add seekPosition if the action supports it, 
                    // or valid fields like percent/maxWatchedSecond if we track them in data
                    // For now, let's map 'completed' to status.
                }
            );

            if (result.success || !result.error) {
                // Mark local as synced
                const updated = await db.progress.findByLesson(userId, lessonId);
                if (updated) {
                    await db.progress.update(updated.id!, { synced: true });
                }
            }
        } catch (error) {
            console.error("Sync failed, keeping local state:", error);
            // Remains synced: false, will be picked up by a global sync job later
        } finally {
            setIsSyncing(false);
        }
    };

    return {
        progress: localProgress,
        syncProgress,
        isSyncing
    };
}
