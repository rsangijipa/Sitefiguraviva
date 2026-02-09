import { db } from '@/lib/firebase/client';
import { collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where, increment, writeBatch } from 'firebase/firestore';
import { CourseDoc, ModuleDoc, LessonDoc } from '@/types/lms';

export const adminCourseService = {
    // --- COURSES ---

    async getAllCourses(): Promise<CourseDoc[]> {
        const q = query(collection(db, 'courses'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseDoc));
    },

    async getCourse(courseId: string): Promise<CourseDoc | null> {
        const docRef = doc(db, 'courses', courseId);
        const snap = await getDoc(docRef);
        return snap.exists() ? ({ id: snap.id, ...snap.data() } as CourseDoc) : null;
    },

    async createCourse(data: Partial<CourseDoc>): Promise<string> {
        const docRef = await addDoc(collection(db, 'courses'), {
            ...data,
            // Dual-write for schema consistency
            image: (data as any).coverImage || (data as any).image || '',
            coverImage: data.coverImage || (data as any).image || '',
            status: 'draft',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    },

    async updateCourse(courseId: string, data: Partial<CourseDoc>): Promise<void> {
        const docRef = doc(db, 'courses', courseId);
        const { id, ...updateData } = data as any;
        const updatePayload: any = {
            ...updateData,
            updatedAt: serverTimestamp()
        };

        // Dual-write check
        if (updateData.coverImage) updatePayload.image = updateData.coverImage;
        if (updateData.image) updatePayload.coverImage = updateData.image;

        await updateDoc(docRef, updatePayload);
    },

    async deleteCourse(courseId: string): Promise<void> {
        // Fix: Deep delete modules and lessons to avoid massive data leaks
        const modulesRef = collection(db, 'courses', courseId, 'modules');
        const modulesSnap = await getDocs(modulesRef);

        const batch = writeBatch(db);

        // Delete all modules and their sub-lessons
        for (const modDoc of modulesSnap.docs) {
            const lessonsRef = collection(db, 'courses', courseId, 'modules', modDoc.id, 'lessons');
            const lessonsSnap = await getDocs(lessonsRef);
            lessonsSnap.docs.forEach(l => batch.delete(l.ref));
            batch.delete(modDoc.ref);
        }

        // Delete other course subcollections if needed (e.g. materials, community)
        const materialsRef = collection(db, 'courses', courseId, 'materials');
        const materialsSnap = await getDocs(materialsRef);
        materialsSnap.docs.forEach(m => batch.delete(m.ref));

        const threadsRef = collection(db, 'courses', courseId, 'communityThreads');
        const threadsSnap = await getDocs(threadsRef);
        threadsSnap.docs.forEach(t => batch.delete(t.ref));

        // Delete the course itself
        batch.delete(doc(db, 'courses', courseId));

        await batch.commit();
    },

    // --- MODULES ---

    async getModules(courseId: string): Promise<ModuleDoc[]> {
        const q = query(collection(db, 'courses', courseId, 'modules'));
        const snapshot = await getDocs(q);
        // Helper to fetch lessons for each module could go here, or separate calls
        // For simplicity, we might just return modules and fetch lessons lazily or in parallel
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ModuleDoc));
    },

    async createModule(courseId: string, title: string, order: number): Promise<string> {
        const docRef = await addDoc(collection(db, 'courses', courseId, 'modules'), {
            title,
            order,
            isPublished: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    },

    async updateModule(courseId: string, moduleId: string, data: Partial<ModuleDoc>): Promise<void> {
        const docRef = doc(db, 'courses', courseId, 'modules', moduleId);
        await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });

        if (data.isPublished !== undefined) {
            await this.syncLessonsCount(courseId);
        }
    },

    async deleteModule(courseId: string, moduleId: string): Promise<void> {
        // Fix: Delete sub-lessons automatically to avoid orphaned data
        const lessonsRef = collection(db, 'courses', courseId, 'modules', moduleId, 'lessons');
        const lessonsSnap = await getDocs(lessonsRef);

        const batch = writeBatch(db);

        // Delete all lessons
        lessonsSnap.docs.forEach(lessonDoc => {
            batch.delete(lessonDoc.ref);
        });

        // Delete the module
        batch.delete(doc(db, 'courses', courseId, 'modules', moduleId));

        // Update lesson count if needed (optional, but good for consistency)
        if (lessonsSnap.size > 0) {
            const courseRef = doc(db, 'courses', courseId);
            batch.update(courseRef, {
                'stats.lessonsCount': increment(-lessonsSnap.size),
                updatedAt: serverTimestamp()
            });
        }

        await batch.commit();
    },

    // --- LESSONS ---

    async getLessons(courseId: string, moduleId: string): Promise<LessonDoc[]> {
        const q = query(
            collection(db, 'courses', courseId, 'modules', moduleId, 'lessons')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LessonDoc));
    },

    async createLesson(courseId: string, moduleId: string, title: string, order: number): Promise<string> {
        const lessonsCol = collection(db, 'courses', courseId, 'modules', moduleId, 'lessons');
        const newLessonRef = doc(lessonsCol);

        await setDoc(newLessonRef, {
            title,
            order,
            moduleId,
            courseId,
            type: 'text',
            isPublished: false, // Default to draft
            status: 'draft',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // We don't increment published count yet because default is draft
        return newLessonRef.id;
    },

    async updateLesson(courseId: string, moduleId: string, lessonId: string, data: Partial<LessonDoc>): Promise<void> {
        const docRef = doc(db, 'courses', courseId, 'modules', moduleId, 'lessons', lessonId);
        await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });

        // If sub-published state might have changed, sync count
        if (data.isPublished !== undefined) {
            await this.syncLessonsCount(courseId);
        }
    },

    async deleteLesson(courseId: string, moduleId: string, lessonId: string): Promise<void> {
        const lessonRef = doc(db, 'courses', courseId, 'modules', moduleId, 'lessons', lessonId);
        const snap = await getDoc(lessonRef);
        const wasPublished = snap.exists() && snap.data()?.isPublished === true;

        await deleteDoc(lessonRef);

        if (wasPublished) {
            await this.syncLessonsCount(courseId);
        }
    },

    // --- ENROLLMENTS ---

    async getCourseEnrollments(courseId: string): Promise<any[]> {
        const q = query(collection(db, 'enrollments'), where('courseId', '==', courseId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async toggleEnrollmentStatus(enrollmentId: string, currentStatus: string): Promise<void> {
        const newStatus = currentStatus === 'active' ? 'cancelled' : 'active';
        await updateDoc(doc(db, 'enrollments', enrollmentId), { status: newStatus });
    },

    // --- COMMUNITY ---

    async getCourseThreads(courseId: string): Promise<any[]> {
        const q = query(collection(db, 'courses', courseId, 'communityThreads'), orderBy('isPinned', 'desc'), orderBy('lastReplyAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async updateThread(courseId: string, threadId: string, updates: any): Promise<void> {
        await updateDoc(doc(db, 'courses', courseId, 'communityThreads', threadId), updates);
    },

    async deleteThread(courseId: string, threadId: string): Promise<void> {
        await deleteDoc(doc(db, 'courses', courseId, 'communityThreads', threadId));
    },

    // --- MATERIALS ---

    async getMaterials(courseId: string): Promise<any[]> {
        const q = query(collection(db, 'courses', courseId, 'materials'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addMaterial(courseId: string, data: any): Promise<void> {
        await addDoc(collection(db, 'courses', courseId, 'materials'), {
            ...data,
            createdAt: serverTimestamp(),
            downloadCount: 0,
            isPublished: true
        });
    },

    async updateMaterial(courseId: string, materialId: string, data: any): Promise<void> {
        await updateDoc(doc(db, 'courses', courseId, 'materials', materialId), data);
    },

    async deleteMaterial(courseId: string, materialId: string): Promise<void> {
        await deleteDoc(doc(db, 'courses', courseId, 'materials', materialId));
    },

    // --- UTILS ---

    async syncLessonsCount(courseId: string): Promise<number> {
        const modulesSnap = await getDocs(collection(db, 'courses', courseId, 'modules'));
        let totalPublished = 0;

        for (const modDoc of modulesSnap.docs) {
            const mData = modDoc.data();
            // Optional: If module is not published, maybe its lessons shouldn't count?
            // Usually, yes. Let's be strict: published module + published lesson.
            if (mData.isPublished === true) {
                const lessonsSnap = await getDocs(
                    query(collection(db, 'courses', courseId, 'modules', modDoc.id, 'lessons'),
                        where('isPublished', '==', true))
                );
                totalPublished += lessonsSnap.size;
            }
        }

        await updateDoc(doc(db, 'courses', courseId), {
            'stats.lessonsCount': totalPublished,
            updatedAt: serverTimestamp()
        });

        return totalPublished;
    }
};
