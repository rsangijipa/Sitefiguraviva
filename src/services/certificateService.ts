import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, Timestamp, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { CertificateDoc, EnrollmentDoc } from '@/types/lms';

export const certificateService = {
    async getCertificate(userId: string, courseId: string): Promise<CertificateDoc | null> {
        const q = query(
            collection(db, 'certificates'),
            where('userId', '==', userId),
            where('courseId', '==', courseId),
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as CertificateDoc;
    },

    async issueCertificate(userId: string, courseId: string): Promise<string> {
        // 1. Check if already exists
        const existing = await this.getCertificate(userId, courseId);
        if (existing) return existing.id;

        // 2. Verify Eligibility (Double check progress)
        // Ideally this runs on server, but for client-side issuance we trust the check beforehand or re-check here
        // For MVP we assume the caller has verified 100% progress.

        // 3. Get User and Course details for denormalization
        const userSnap = await getDoc(doc(db, 'users', userId));
        const courseSnap = await getDoc(doc(db, 'courses', courseId));

        if (!userSnap.exists() || !courseSnap.exists()) {
            throw new Error("User or Course not found");
        }

        const userData = userSnap.data();
        const courseData = courseSnap.data();

        // 4. Generate Code (Simple Random for MVP)
        const code = `FV-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;

        // 5. Create Certificate
        const certData: Omit<CertificateDoc, 'id'> = {
            userId,
            courseId,
            userName: userData.displayName || 'Aluno',
            courseTitle: courseData.title || 'Curso',
            code,
            issuedAt: Timestamp.now(),
            metadata: {
                hours: 10 // Placeholder or calculated from content duration
            }
        };

        const docRef = await addDoc(collection(db, 'certificates'), certData);

        // 6. Update Enrollment
        // const enrollmentId = `${userId}_${courseId}`; or find it query
        const enrollQ = query(collection(db, 'enrollments'), where('userId', '==', userId), where('courseId', '==', courseId));
        const enrollSnap = await getDocs(enrollQ);
        if (!enrollSnap.empty) {
            await updateDoc(enrollSnap.docs[0].ref, {
                status: 'completed', // Ensure status is completed
                completedAt: Timestamp.now()
            });
        }

        return docRef.id;
    }
};
