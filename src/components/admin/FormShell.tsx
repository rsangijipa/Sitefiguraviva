"use client";

import { cn } from "@/lib/utils";

interface FormShellProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export function FormShell({ children, onSubmit, className }: FormShellProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "max-w-4xl mx-auto space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-stone-100 shadow-sm",
        className,
      )}
    >
      {children}
    </form>
  );
}

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <div className="space-y-4 pb-6 border-b border-stone-100 last:border-0">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-stone-800">{title}</h3>
        {description && <p className="text-sm text-stone-500">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface FormActionsProps {
  children: React.ReactNode;
}

export function FormActions({ children }: FormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 sticky bottom-0 bg-white/95 backdrop-blur-sm p-4 -mx-4 -mb-4 sm:-mx-8 sm:-mb-8 border-t border-stone-100 rounded-b-2xl z-10">
      {children}
    </div>
  );
}
