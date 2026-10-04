"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminPageShellProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children: React.ReactNode;
  backLink?: string;
  className?: string;
}

export function AdminPageShell({
  title,
  description,
  actions,
  children,
  backLink,
  className,
}: AdminPageShellProps) {
  const { user } = useAuth();

  if (!user) return null; // Or skeleton

  return (
    <div className={cn("flex flex-col animate-fade-in", className)}>
      {/* Main Content */}
      <main
        className={cn(
          "w-full flex-1 flex flex-col min-h-0",
          !className?.includes("max-w-") && "max-w-7xl",
        )}
      >
        {/* Header Section */}
        <section className="mb-6 flex shrink-0 flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            {backLink && (
              <Link
                href={backLink}
                className="mb-2 inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-600 transition-colors hover:border-primary/30 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <ArrowLeft size={16} />
                Voltar
              </Link>
            )}
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-primary">
              {title}
            </h1>
            {description && (
              <p className="text-stone-500 max-w-2xl">{description}</p>
            )}
          </div>

          {/* Actions Area */}
          {actions && (
            <div className="flex items-center gap-3 shrink-0">{actions}</div>
          )}
        </section>

        {/* Dynamic Content */}
        <div className="flex-1 flex flex-col min-h-0 space-y-4">{children}</div>
      </main>
    </div>
  );
}
