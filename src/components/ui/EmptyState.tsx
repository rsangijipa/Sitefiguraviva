"use client";

import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ComponentType<any>;
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
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 bg-white rounded-2xl border border-stone-100 shadow-sm text-center ${className || ""}`}
    >
      <div className="w-20 h-20 bg-stone-50 text-stone-300 flex items-center justify-center rounded-3xl mb-6 shadow-inner">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">
        {title}
      </h3>
      <p className="text-stone-500 max-w-md mb-8">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
