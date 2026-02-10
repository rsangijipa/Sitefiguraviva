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
}

export function AdminPageShell({
  title,
  description,
  breadcrumbs = [],
  actions,
  children,
  backLink,
}: AdminPageShellProps) {
  const { user } = useAuth();

  if (!user) return null; // Or skeleton

  return (
    <div className="min-h-screen bg-stone-50 animate-fade-in">
      {/* Top Bar / Breadcrumb Area */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm text-stone-500">
            <Link
              href="/admin"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <LayoutDashboard size={14} />
              <span>Admin</span>
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center">
                <ChevronRight size={14} className="mx-1 text-stone-300" />
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-primary transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-stone-800">
                    {crumb.label}
                  </span>
                )}
              </div>
            ))}
          </nav>

          {/* User Context */}
          <div className="text-xs text-stone-400">
            Logado como{" "}
            <span className="font-bold text-stone-600">{user.email}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
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
            <h1 className="text-2xl font-serif font-bold text-stone-800">
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
        <div className="space-y-6">{children}</div>
      </main>
    </div>
  );
}
