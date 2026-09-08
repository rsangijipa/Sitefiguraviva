"use client";

import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  // Server Components can't pass a component reference (function) as a prop
  // to this Client Component — only a rendered element. Accept both so
  // client-side callers can keep passing the icon type directly.
  icon?: React.ComponentType<any> | React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon = FolderOpen,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const iconNode = React.isValidElement(icon)
    ? icon
    : React.createElement(icon as React.ComponentType<any>, {
        size: 40,
        strokeWidth: 1.5,
      });

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 bg-white rounded-2xl border border-stone-100 shadow-sm text-center ${className || ""}`}
    >
      <div className="w-20 h-20 bg-stone-50 text-stone-300 flex items-center justify-center rounded-3xl mb-6 shadow-inner">
        {iconNode}
      </div>
      <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">
        {title}
      </h3>
      <p className="text-stone-500 max-w-md mb-8">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
