"use server";

import { adminDb } from '@/lib/firebase/admin';
import { EnrollmentDoc, CourseDoc } from '@/types/lms';

export enum AccessErrorCode {
    AUTH_REQUIRED = 'AUTH_REQUIRED',
    ENROLLMENT_NOT_FOUND = 'ENROLLMENT_NOT_FOUND',
    ENROLLMENT_PENDING = 'ENROLLMENT_PENDING',
    ENROLLMENT_EXPIRED = 'ENROLLMENT_EXPIRED',
    ACCESS_DENIED = 'ACCESS_DENIED',
    COURSE_NOT_AVAILABLE = 'COURSE_NOT_AVAILABLE',
    LESSON_NOT_AVAILABLE = 'LESSON_NOT_AVAILABLE',
    CONFIG_ERROR = 'CONFIG_ERROR'
}

export class AccessError extends Error {
    constructor(public code: AccessErrorCode, message?: string) {
        super(message || code);
        this.name = 'AccessError';
    }
}

export interface AccessContext {
    uid: string;
    courseId: string;
    enrollmentId: string;
    paymentMethod: string;
    courseVersion?: number;
    accessUntil?: string;
}

/**
 * Canonical Server-Side Access Guard.
 * Validates enrollment status, course publication state, and subscription expiry.
 */
export async function assertCanAccessCourse(uid: string | undefined, courseId: string): Promise<AccessContext> {
    if (!uid) throw new AccessError(AccessErrorCode.AUTH_REQUIRED);

    const enrollmentId = `${uid}_${courseId}`;
    const enrollmentSnap = await adminDb.collection('enrollments').doc(enrollmentId).get();

    if (!enrollmentSnap.exists) {
        throw new AccessError(AccessErrorCode.ENROLLMENT_NOT_FOUND);
    }

    const enrollment = enrollmentSnap.data() as EnrollmentDoc;

    // 1. Enrollment Level Status Check
    if (enrollment.status === 'pending') {
        throw new AccessError(AccessErrorCode.ENROLLMENT_PENDING);
    }

    if (enrollment.status === 'expired') {
        throw new AccessError(AccessErrorCode.ENROLLMENT_EXPIRED);
    }

    if (enrollment.status !== 'active' && enrollment.status !== 'completed') {
        throw new AccessError(AccessErrorCode.ACCESS_DENIED);
    }

    // 2. Subscription Expiry Check
    if (enrollment.paymentMethod === 'subscription') {
        if (!enrollment.accessUntil) {
            throw new AccessError(AccessErrorCode.CONFIG_ERROR, 'Subscription missing accessUntil date');
        }

        const now = Date.now();
        const expiry = enrollment.accessUntil.toMillis();

        if (now >= expiry) {
            throw new AccessError(AccessErrorCode.ENROLLMENT_EXPIRED);
        }
    }

    // 3. Course Level Visibility Check
    const courseSnap = await adminDb.collection('courses').doc(courseId).get();
    if (!courseSnap.exists) {
        throw new AccessError(AccessErrorCode.COURSE_NOT_AVAILABLE);
    }

    const course = courseSnap.data() as CourseDoc;

    // Admin Override: If user is admin, they might be able to see draft?
    // But for "Student View" gate, we follow strict rules.
    if (!course.isPublished || course.status !== 'open') {
        throw new AccessError(AccessErrorCode.COURSE_NOT_AVAILABLE);
    }

    return {
        uid,
        courseId,
        enrollmentId,
        paymentMethod: enrollment.paymentMethod || 'free',
        courseVersion: enrollment.courseVersionAtEnrollment,
        accessUntil: enrollment.accessUntil?.toDate().toISOString()
    };
}
