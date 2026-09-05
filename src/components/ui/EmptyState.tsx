"use client";

import React from "react";
import { FolderOpen, type LucideIcon } from "lucide-react";
import { EmptyState as CoreEmptyState } from "@/components/core/feedback";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <CoreEmptyState
      icon={Icon}
      title={title}
      description={description}
      action={action}
      className={className}
      variant="surface"
      size="lg"
    />
  );
}
