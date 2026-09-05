"use client";

import React from "react";
import { EmptyState as CoreEmptyState } from "@/components/core/feedback";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <CoreEmptyState
      icon={icon}
      title={title}
      description={description}
      action={action}
      className={className}
      variant="surface"
      size="lg"
    />
  );
}
