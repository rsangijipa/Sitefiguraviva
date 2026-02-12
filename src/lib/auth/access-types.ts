export enum AccessErrorCode {
  AUTH_REQUIRED = "AUTH_REQUIRED",
  ENROLLMENT_NOT_FOUND = "ENROLLMENT_NOT_FOUND",
  ENROLLMENT_PENDING = "ENROLLMENT_PENDING",
  ENROLLMENT_EXPIRED = "ENROLLMENT_EXPIRED",
  ENROLLMENT_STATUS_NOT_ACTIVE = "ENROLLMENT_STATUS_NOT_ACTIVE",
  ACCESS_DENIED = "ACCESS_DENIED",
  COURSE_NOT_PUBLISHED = "COURSE_NOT_PUBLISHED",
  COURSE_ARCHIVED = "COURSE_ARCHIVED",
  COURSE_NOT_AVAILABLE = "COURSE_NOT_AVAILABLE",
  LESSON_NOT_AVAILABLE = "LESSON_NOT_AVAILABLE",
  CONFIG_ERROR = "CONFIG_ERROR",
}

export class AccessError extends Error {
  constructor(
    public code: AccessErrorCode,
    message?: string,
  ) {
    super(message || code);
    this.name = "AccessError";
  }
}

export class AuthError extends AccessError {
  constructor(message: string = "Authentication required") {
    super(AccessErrorCode.AUTH_REQUIRED, message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends AccessError {
  constructor(message: string = "Access denied") {
    super(AccessErrorCode.ACCESS_DENIED, message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AccessError {
  constructor(resource: string = "Resource") {
    super(AccessErrorCode.ENROLLMENT_NOT_FOUND, `${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class ContentUnavailableError extends AccessError {
  constructor(message: string = "Content not available") {
    super(AccessErrorCode.COURSE_NOT_AVAILABLE, message);
    this.name = "ContentUnavailableError";
  }
}

export interface AccessContext {
  uid: string;
  courseId: string;
  enrollmentId: string;
  paymentMethod: string;
  courseVersion?: number;
  accessUntil?: string;
  isAdminOverride?: boolean;
}
