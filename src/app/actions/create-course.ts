'use server';

import { adminDb } from '@/lib/firebase/admin';
import { revalidatePath } from 'next/cache';
import { assertIsTutorOrAdmin } from '@/lib/auth/authoring-gate';

export async function createCourseAction(data: {
    title: string;
    subtitle?: string;
    instructor?: string;
    category?: string;
    duration?: string;
    level?: string;
}) {
    try {
        await assertIsTutorOrAdmin();
        console.log('===== [SERVER ACTION] Creating course with data:', data);

        // Create course using Admin SDK (same SDK used for reading)
        const docRef = await adminDb.collection('courses').add({
            title: data.title || 'Novo Curso',
            subtitle: data.subtitle || '',
            instructor: data.instructor || '',
            category: data.category || '',
            duration: data.duration || '',
            level: data.level || 'beginner',
            status: 'draft',
            isPublished: false,
            coverImage: '',
            image: '',
            description: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            stats: {
                lessonsCount: 0,
                studentsCount: 0
            }
        });

        console.log('[SERVER ACTION] Course created successfully! ID:', docRef.id);

        // Revalidate the courses page to show the new course
        revalidatePath('/admin/courses');
        console.log('[SERVER ACTION] Cache revalidated for /admin/courses');

        const response = {
            success: true,
            id: docRef.id
        };
        console.log('[SERVER ACTION] Returning success:', response);
        return response;
    } catch (error: any) {
        console.error('===== [SERVER ACTION] Error creating course:', error);
        const errorResponse = {
            success: false,
            error: error.message || 'Erro ao criar curso'
        };
        console.log('[SERVER ACTION] Returning error:', errorResponse);
        return errorResponse;
    }
}
