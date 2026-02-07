"use server";

import { saveLessonContent, getLessonContent } from '@/lib/courseService';
import { Block } from '@/types/lms';
import { revalidatePath } from 'next/cache';
import { assertIsTutorOrAdmin } from '@/lib/auth/authoring-gate';

export async function getLessonContentAction(courseId: string, moduleId: string, lessonId: string) {
    try {
        const data = await getLessonContent(courseId, moduleId, lessonId);
        return { success: true, data };
    } catch (error) {
        console.error("Failed to fetch lesson content:", error);
        return { success: false, error: "Failed to fetch content" };
    }
}

export async function updateLessonBlocksAction(
    courseId: string,
    moduleId: string,
    lessonId: string,
    blocks: Block[]
) {
    try {
        await assertIsTutorOrAdmin();
        await saveLessonContent(courseId, moduleId, lessonId, blocks);
        // Revalidate the builder page and the student course page
        revalidatePath(`/admin/courses/${courseId}/builder`);
        revalidatePath(`/portal/course/${courseId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to save lesson blocks:", error);
        return { success: false, error: "Failed to save content" };
    }
}
