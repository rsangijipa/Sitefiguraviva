export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, code = 'APP_ERROR', statusCode = 500, isOperational = true) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NetworkError extends AppError {
    constructor(message = 'Network error occurred') {
        super(message, 'NETWORK_ERROR', 503);
    }
}

export class AuthError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 'AUTH_ERROR', 401);
    }
}

export class PermissionError extends AppError {
    constructor(message = 'Permission denied') {
        super(message, 'PERMISSION_ERROR', 403);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 'NOT_FOUND', 404);
    }
}

export class ContractError extends AppError {
    constructor(message = 'Data contract violation', details?: any) {
        super(`${message} ${details ? JSON.stringify(details) : ''}`, 'CONTRACT_ERROR', 422);
    }
}

export function toUserMessage(error: unknown): string {
    if (error instanceof AppError && error.isOperational) {
        return error.message;
    }

    if (error instanceof Error) {
        // Hide technical details in production if needed, primarily for unexpected errors
        return 'An unexpected error occurred. Please try again.';
    }

    return 'Unknown error occurred.';
}

export function isRetryable(error: unknown): boolean {
    if (error instanceof NetworkError) return true;
    // Add other retryable conditions
    return false;
}
