"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  if (pathname === "/admin") return null;

  const paths = pathname.split("/").filter(Boolean);

  // Mapping of slugs to readable names
  const labels: Record<string, string> = {
    admin: "Home",
    courses: "Cursos",
    users: "Usuários",
    enrollments: "Matrículas",
    settings: "Configurações",
    content: "Conteúdo",
    assessments: "Avaliações",
    submissions: "Entregas",
    events: "Eventos",
    blog: "Blog",
    gallery: "Galeria",
    applications: "Interessados",
    approvals: "Aprovações",
    logs: "Logs",
    utilities: "Utilidades",
  };

  return (
    <nav
      className={cn(
        "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-6",
        className,
      )}
    >
      <Link
        href="/admin"
        className="hover:text-gold transition-colors flex items-center gap-1.5"
      >
        <Home size={12} />
        Admin
      </Link>

      {paths.map((path, index) => {
        if (path === "admin") return null;

        const href = `/${paths.slice(0, index + 1).join("/")}`;
        const label = labels[path] || path;
        const isLast = index === paths.length - 1;

        return (
          <div key={path} className="flex items-center gap-2">
            <ChevronRight size={10} className="text-stone-300" />
            {isLast ? (
              <span className="text-primary">{label}</span>
            ) : (
              <Link href={href} className="hover:text-gold transition-colors">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
