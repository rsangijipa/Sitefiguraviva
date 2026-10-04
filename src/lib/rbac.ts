export type Role = 'admin' | 'tutor' | 'student' | 'guest';

export const ROLES = {
    ADMIN: 'admin',
    TUTOR: 'tutor',
    STUDENT: 'student',
    GUEST: 'guest',
} as const;

/**
 * Checks if a user has the required role to access a resource.
 * @param userRole - The role of the current user
 * @param requiredRoles - Array of allowed roles
 * @returns boolean
 */
export function canAccess(userRole: string | undefined | null, requiredRoles: Role[]): boolean {
    const role = (userRole || 'guest') as Role;

    if (role === 'admin') return true; // Admin has super-access by default for most cases

    return requiredRoles.includes(role);
}

/**
 * Validates if a string is a valid known role
 */
export function isValidRole(role: string): role is Role {
    return Object.values(ROLES).includes(role as Role);
}
