export type UserRole = 'admin' | 'tutor' | 'student';

export function getDashboardPathForRole(role?: string): string {
    switch (role) {
        case 'admin':
            return '/admin';
        case 'tutor':
            return '/tutor'; // Ensure this route exists or map to correct one
        case 'student':
        default:
            return '/portal';
    }
}
