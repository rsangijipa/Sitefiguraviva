

// Firestore Document Type
export interface Certificate {
    id: string;
    userId: string;
    courseId: string;

    // Snapshot Data
    userName: string; // Was studentName
    courseTitle: string;

    // Validation
    code: string; // Was validationCode
    issuedAt: any; // Firestore Timestamp

    // Optional
    metadata?: {
        version?: string;
        hours?: number;
    };

    // Legacy / Future
    pdfUrl?: string;
}

export type CertificateDoc = Certificate;
