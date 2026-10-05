"use client";

import { cn } from "@/lib/utils";

interface FormShellProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export function FormShell({ children, onSubmit, className }: FormShellProps) {
  const Container = onSubmit ? "form" : "div";
  return (
    <Container
      onSubmit={onSubmit}
      className={cn(
        "w-full min-w-0 max-w-4xl mx-auto space-y-6 bg-white p-4 sm:p-6 rounded-2xl border border-stone-200",
        className,
      )}
    >
      {children}
    </Container>
  );
}

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        "min-w-0 space-y-4 pb-5 border-b border-stone-200 last:border-0",
        className,
      )}
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-stone-800">{title}</h3>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

interface FormActionsProps {
  children: React.ReactNode;
}

export function FormActions({ children }: FormActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 sticky bottom-0 bg-white/95 backdrop-blur-sm p-4 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 border-t border-stone-200 rounded-b-2xl z-10">
      {children}
    </div>
  );
}
