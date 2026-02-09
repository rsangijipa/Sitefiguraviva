// Use 'any' for Timestamp to support both firebase and firebase-admin
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FirestoreTimestamp = any;

/**
 * Certificate Types
 */
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  studentName: string;
  courseName: string;
  completedAt: FirestoreTimestamp;
  issuedAt: FirestoreTimestamp;
  certificateNumber: string; // Auto-generated unique number
  instructorName: string;
  instructorTitle: string;
  courseWorkload: number; // hours
  validationUrl: string; // QR code URL
  status: "issued" | "revoked";
}

export interface CertificateTemplate {
  logoUrl: string;
  institutionName: string;
  institutionCNPJ: string;
  backgroundColor: string;
  accentColor: string;
  signatureImageUrl?: string;
}

/**
 * Analytics Types
 */
export interface StudentAnalytics {
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseName: string;

  // Progress
  enrolledAt: FirestoreTimestamp;
  lastActive?: FirestoreTimestamp;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;

  // Assessments
  totalAssessments: number;
  completedAssessments: number;
  averageScore: number;
  passedAssessments: number;
  failedAssessments: number;

  // Time
  totalTimeSpent: number; // minutes

  // Status
  isComplete: boolean;
  certificateIssued: boolean;
  certificateId?: string;
}

export interface CourseAnalytics {
  courseId: string;
  courseName: string;

  // Enrollment
  totalEnrollments: number;
  activeStudents: number; // Active in last 30 days
  inactiveStudents: number;

  // Progress
  averageProgress: number; // 0-100%
  completionRate: number; // % of students who completed

  // Assessments
  totalAssessments: number;
  averageAssessmentScore: number;
  assessmentPassRate: number;

  // Certificates
  certificatesIssued: number;

  // Engagement
  averageTimePerStudent: number; // minutes
}

export interface AssessmentAnalytics {
  assessmentId: string;
  assessmentTitle: string;
  courseId: string;

  // Submissions
  totalSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;

  // Pass/Fail
  passRate: number; // %
  passedCount: number;
  failedCount: number;

  // Questions
  questionStats: QuestionStats[];

  // Time
  averageCompletionTime: number; // minutes
}

export interface QuestionStats {
  questionId: string;
  questionTitle: string;
  questionType: string;
  correctRate: number; // % of students who got it right
  averageScore: number;
  totalAttempts: number;
}

export interface PlatformAnalytics {
  // Overview
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalCertificates: number;

  // Engagement (last 30 days)
  activeUsers: number;
  newEnrollments: number;
  certificatesIssued: number;

  // Performance
  averageCourseCompletion: number;
  averageAssessmentScore: number;

  // Top performers
  topCourses: { courseId: string; courseName: string; enrollments: number }[];
  topStudents: { userId: string; userName: string; completedCourses: number }[];
}

/**
 * Export Types
 */
export interface ExcelExportData {
  sheetName: string;
  data: Record<string, any>[];
}
