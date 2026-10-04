"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Role, canAccess } from "@/lib/rbac";
import { NoPermission } from "@/components/system/NoPermission";
import { LoadingState } from "@/components/system/LoadingState";

interface RequireRoleProps {
  roles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireRole({ roles, children, fallback }: RequireRoleProps) {
  const { user, loading, role } = useAuth();

  if (loading) {
    return <LoadingState message="Verificando permissões..." />;
  }

  const hasAccess = Boolean(user) && canAccess(role as Role, roles);

  if (!hasAccess) {
    return fallback || <NoPermission />;
  }

  return <>{children}</>;
}
