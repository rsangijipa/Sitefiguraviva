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
  integrityHash?: string;

  // Snapshot Info
  courseVersionAtCompletion?: number;
  courseSnapshot?: {
    courseId: string;
    courseVersionAtCompletion: number;
    totalLessonsConsidered: number;
    lessons: { id: string; title: string }[];
  };

  // Optional
  metadata?: {
    version?: string;
    hours?: number;
  };

  // Meta
  issuedBy?: string;
  templateVersion?: string;

  // Legacy / Future
  pdfUrl?: string;
}

export type CertificateDoc = Certificate;
