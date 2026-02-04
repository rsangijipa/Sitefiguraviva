

export interface Certificate {
    id: string; // Unique ID (often used as validation code)
    userId: string;
    courseId: string;

    // Metadata snapshot (SoT at moment of issue)
    studentName: string;
    courseTitle: string;
    instructorName: string;
    workloadHours: number;

    // Validation
    validationCode: string; // Short alphanumeric code
    issuedAt: any;

    // Assets
    pdfUrl?: string; // If generated and stored
    templateId?: string; // For dynamic rendering
}
