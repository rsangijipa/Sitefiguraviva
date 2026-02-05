import { db } from '@/lib/firebase/client';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
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
            status: 'draft',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    },

    async updateCourse(courseId: string, data: Partial<CourseDoc>): Promise<void> {
        const docRef = doc(db, 'courses', courseId);
        const { id, ...updateData } = data as any;
        await updateDoc(docRef, {
            ...updateData,
            updatedAt: serverTimestamp()
        });
    },

    async deleteCourse(courseId: string): Promise<void> {
        await deleteDoc(doc(db, 'courses', courseId));
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
    },

    async deleteModule(courseId: string, moduleId: string): Promise<void> {
        // Warning: This doesn't delete sub-lessons automatically in Client SDK. 
        // Admin SDK or Functions would be better for recursive delete.
        await deleteDoc(doc(db, 'courses', courseId, 'modules', moduleId));
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
        const docRef = await addDoc(collection(db, 'courses', courseId, 'modules', moduleId, 'lessons'), {
            title,
            order,
            moduleId,
            type: 'text', // default
            status: 'draft',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    },

    async updateLesson(courseId: string, moduleId: string, lessonId: string, data: Partial<LessonDoc>): Promise<void> {
        const docRef = doc(db, 'courses', courseId, 'modules', moduleId, 'lessons', lessonId);
        await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    },

    async deleteLesson(courseId: string, moduleId: string, lessonId: string): Promise<void> {
        await deleteDoc(doc(db, 'courses', courseId, 'modules', moduleId, 'lessons', lessonId));
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
    }
};
