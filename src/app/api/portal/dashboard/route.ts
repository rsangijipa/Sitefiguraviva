
import { NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase/admin';
import { FieldPath } from 'firebase-admin/firestore';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const uid = decodedToken.uid;

        // 1. Fetch User Enrollments (Server-side)
        const enrollmentsSnap = await db.collection('users').doc(uid).collection('enrollments')
            .orderBy('enrolledAt', 'desc')
            .get();

        const enrollments = enrollmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (enrollments.length === 0) {
            return NextResponse.json({ enrolledCourses: [] });
        }

        // 2. Fetch Course Details (Optimized)
        const courseIds = enrollments.map((e: any) => e.courseId);

        // Firestore 'in' query supports up to 10 items. We need to chunk if needed.
        // Assuming typical user has < 10 courses for MVP. If more, we chunk.
        const chunks = [];
        const chunkSize = 10;
        for (let i = 0; i < courseIds.length; i += chunkSize) {
            chunks.push(courseIds.slice(i, i + chunkSize));
        }

        const coursesData = [];
        const coursePromises = chunks.map(chunk =>
            db.collection('courses').where(FieldPath.documentId(), 'in', chunk).get()
        );

        const courseSnapshots = await Promise.all(coursePromises);

        for (const snap of courseSnapshots) {
            coursesData.push(...snap.docs.map(doc => {
                const data = doc.data();
                // Optimize payload: only send what's needed for the card
                return {
                    id: doc.id,
                    title: data.title,
                    subtitle: data.subtitle,
                    description: data.description,
                    image: data.image,
                    slug: data.slug // if exists
                };
            }));
        }

        // Merge
        const merged = coursesData.map(course => {
            // @ts-ignore
            const enrollment = enrollments.find((e: any) => e.courseId === course.id);
            // Serialize timestamps for JSON
            const serializedEnrollment = {
                ...enrollment,
                enrolledAt: (enrollment as any)?.enrolledAt?.toDate?.()?.toISOString(),
                // @ts-ignore
                accessExpiresAt: (enrollment as any)?.accessExpiresAt?.toDate?.()?.toISOString()
            };
            return { ...course, enrollment: serializedEnrollment };
        });

        // re-sort based on enrollment date (coursesData query doesn't preserve order of IDs)
        // We can sort by the enrollment order found in 'enrollments' array which was already sorted.
        const sorted = merged.sort((a, b) => {
            // @ts-ignore
            const dateA = new Date(a.enrollment.enrolledAt).getTime();
            // @ts-ignore
            const dateB = new Date(b.enrollment.enrolledAt).getTime();
            return dateB - dateA;
        });

        return NextResponse.json({ enrolledCourses: sorted });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
