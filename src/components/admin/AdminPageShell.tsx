"use client";

import { useAuth } from "@/context/AuthContext";
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
  children: React.ReactNode;
  backLink?: string;
  className?: string;
}

export function AdminPageShell({
  title,
  description,
  breadcrumbs = [],
  actions,
  children,
  backLink,
  className,
}: AdminPageShellProps) {
  const { user } = useAuth();

  if (!user) return null; // Or skeleton

  return (
    <div
      className={cn(
        "panel-surface min-h-screen flex flex-col animate-fade-in",
        className,
      )}
    >
      {/* Top Bar / Breadcrumb Area */}
      <div className="border-b border-gold/10 bg-white/80 backdrop-blur-xl shrink-0">
        <div
          className={cn(
            "mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between",
            !className?.includes("max-w-") && "max-w-7xl",
          )}
        >
          {/* Breadcrumbs */}
          <nav className="flex min-w-0 flex-1 items-center text-sm text-stone-500">
            <Link
              href="/admin"
              className="flex shrink-0 items-center gap-1 transition-colors hover:text-primary"
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
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

          {/* User Context */}
          <div className="hidden shrink-0 truncate pl-4 text-xs text-stone-400 md:block">
            Logado como{" "}
            <span className="font-bold text-stone-600">{user.email}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main
        className={cn(
          "mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col min-h-0",
          !className?.includes("max-w-") && "max-w-7xl",
        )}
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8 shrink-0">
          <div className="space-y-1">
            {backLink && (
              <Link
                href={backLink}
                className="text-xs font-bold text-stone-400 hover:text-primary flex items-center gap-1 mb-2 uppercase tracking-wider"
              >
                <ArrowLeft size={12} />
                Voltar
              </Link>
            )}
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-primary">
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
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 flex flex-col min-h-0 space-y-6">{children}</div>
      </main>
    </div>
  );
}
