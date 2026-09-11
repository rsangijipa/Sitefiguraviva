"use client";

import Link from "next/link";
import { ChevronRight, LayoutDashboard, ArrowLeft } from "lucide-react";
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
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  backLink?: string;
  className?: string;
}

export function AdminPageShell({
  title,
  description,
  breadcrumbs = [],
  actions,
  toolbar,
  children,
  backLink,
  className,
}: AdminPageShellProps) {
  return (
    <section className={cn("flex min-h-0 flex-col animate-fade-in", className)}>
      <header className="mb-8 shrink-0 space-y-4">
        {(breadcrumbs.length > 0 || backLink) && (
          <nav
            aria-label="Navegação estrutural"
            className="flex min-w-0 items-center text-sm text-stone-500"
          >
            {backLink ? (
              <Link
                href={backLink}
                className="flex items-center gap-1 hover:text-primary"
              >
                <ArrowLeft size={14} aria-hidden="true" /> Voltar
              </Link>
            ) : (
              <Link
                href="/admin"
                className="flex shrink-0 items-center gap-1 transition-colors hover:text-primary"
              >
                <LayoutDashboard size={14} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            {breadcrumbs.map((crumb, idx) => (
              <div
                key={idx}
                className="flex min-w-0 items-center text-stone-500"
              >
                <ChevronRight
                  size={14}
                  className="mx-1 shrink-0 text-stone-300"
                />
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="truncate transition-colors hover:text-primary"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="truncate font-medium text-stone-800">
                    {crumb.label}
                  </span>
                )}
              </div>
            ))}
          </nav>
        )}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-primary">
              {title}
            </h1>
            {description && (
              <p className="text-stone-500 max-w-2xl">{description}</p>
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-3 shrink-0">{actions}</div>
          )}
        </div>
        {toolbar && (
          <div className="flex flex-wrap items-center gap-3">{toolbar}</div>
        )}
      </header>
      <div className="flex min-h-0 flex-1 flex-col space-y-6">{children}</div>
    </section>
  );
}
