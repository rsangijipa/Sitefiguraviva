import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'tutor' | 'student';
export type UserStatus = 'active' | 'disabled';

export interface AuditLog {
    id?: string;
    action: 'USER_ROLE_UPDATED' | 'USER_DISABLED' | 'USER_ENABLED';
    actorUid: string;
    actorEmail?: string;
    targetUid: string;
    targetEmail?: string;
    details: {
        before?: any;
        after?: any;
        reason?: string;
    };
    createdAt: Timestamp;
}

export interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: UserRole;
    status: UserStatus;
    isAdmin: boolean; // Computed or redundant, kept for compatibility
    createdAt: Timestamp;
    updatedAt?: Timestamp;
    lastLogin: Timestamp;
    phoneNumber?: string;
    bio?: string;

    // Governance
    disabledReason?: string;
    disabledAt?: Timestamp;
    disabledBy?: string;
}
