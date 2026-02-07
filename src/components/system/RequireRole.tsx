'use client';

import { useAuth } from '@/context/AuthContext';
import { Role, canAccess } from '@/lib/rbac';
import { NoPermission } from '@/components/system/NoPermission';
import { LoadingState } from '@/components/system/LoadingState';

interface RequireRoleProps {
    roles: Role[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function RequireRole({ roles, children, fallback }: RequireRoleProps) {
    // We need to verify where useAuth comes from. 
    // If it doesn't exist, we'll need to create a context or use one found in inventory.
    // For now, assuming a standard pattern.
    const { user, loading, role } = useAuth();

    if (loading) {
        return <LoadingState message="Verificando permissões..." />;
    }

    // Cast the context role (string/UserRole) to our RBAC Role type
    const hasAccess = canAccess(role as Role, roles);
    console.log('[RequireRole] Access check:', { role, requiredRoles: roles, hasAccess, loading });

    if (!hasAccess) {
        return fallback || <NoPermission />;
    }

    return <>{children}</>;
}
