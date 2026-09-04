import type { ElementType, ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateVariant = "surface" | "dashed" | "plain";
type EmptyStateSize = "md" | "lg";

export interface EmptyStateProps {
  icon?: ElementType;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  iconClassName?: string;
  contentClassName?: string;
  variant?: EmptyStateVariant;
  size?: EmptyStateSize;
}

const rootVariants: Record<EmptyStateVariant, string> = {
  surface: "bg-white rounded-2xl border border-stone-100 shadow-sm text-center",
  dashed:
    "border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 text-center",
  plain: "text-center",
};

const sizeVariants: Record<EmptyStateSize, string> = {
  md: "min-h-[300px] p-8",
  lg: "py-16 px-6",
};

const iconVariants: Record<EmptyStateVariant, string> = {
  surface: "w-20 h-20 bg-stone-50 text-stone-300 rounded-3xl mb-6 shadow-inner",
  dashed: "w-16 h-16 bg-white text-gray-400 rounded-full mb-4 shadow-sm",
  plain: "w-16 h-16 bg-primary/5 text-primary rounded-full mb-4",
};

const iconSizes: Record<EmptyStateSize, number> = {
  md: 32,
  lg: 40,
};

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className,
  iconClassName,
  contentClassName,
  variant = "surface",
  size = "lg",
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center justify-center",
        rootVariants[variant],
        sizeVariants[size],
        className,
      )}
      aria-live="polite"
    >
      <div
        className={cn(
          "flex items-center justify-center",
          iconVariants[variant],
          iconClassName,
        )}
        aria-hidden="true"
      >
        <Icon size={iconSizes[size]} strokeWidth={1.5} />
      </div>

      <div className={cn("flex flex-col items-center", contentClassName)}>
        <h3
          className={
            variant === "surface"
              ? "text-xl font-serif font-bold text-stone-800 mb-2"
              : "text-lg font-bold text-primary mb-2"
          }
        >
          {title}
        </h3>
        <p
          className={cn(
            "max-w-md",
            variant === "surface" ? "text-stone-500 mb-8" : "text-muted mb-6",
          )}
        >
          {description}
        </p>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </section>
  );
}
