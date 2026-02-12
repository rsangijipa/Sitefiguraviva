// Firestore Document Type for Certificates
export interface Certificate {
  id: string; // Document ID (usually uid_courseId)
  userId: string;
  courseId: string;

  // --- Display Data (Standardized) ---
  studentName: string;
  courseName: string;
  certificateNumber: string; // The FV-YY-XXXXXX code
  issuedAt: any; // Firestore Timestamp or ISO String
  completedAt: any; // Usually same as issuedAt or from enrollment completion
  validationUrl: string; // Public verification link

  // --- Snapshot & Academic Data ---
  instructorName?: string;
  instructorTitle?: string;
  courseWorkload?: number; // In hours
  integrityHash?: string; // SHA-256 for tampering protection

  // --- Versioning & Context ---
  courseVersionAtCompletion?: number;
  courseSnapshot?: {
    courseId: string;
    courseVersionAtCompletion: number;
    totalLessonsConsidered: number;
    lessons: { id: string; title: string }[];
  };

  // --- Metadata & Status ---
  status: "issued" | "revoked" | "draft";
  issuedBy?: "system" | "admin" | string;
  templateVersion?: string;
  enrolledAt?: any; // Start date for period calculation

  // --- Legacy / Alias Support (Backward Compatibility) ---
  userName?: string; // Alias for studentName
  courseTitle?: string; // Alias for courseName
  code?: string; // Alias for certificateNumber
  pdfUrl?: string; // Optional cloud storage link
}

export type CertificateDoc = Certificate;
