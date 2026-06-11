"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import React from "react";

const routeLabels: Record<string, string> = {
  portal: "Início",
  courses: "Cursos",
  certificates: "Certificados",
  community: "Comunidade",
  profile: "Perfil",
  settings: "Configurações",
  support: "Suporte",
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  if (!pathname || pathname === "/portal") return null;

  const pathParts = pathname.split("/").filter((p) => p !== "");

  // Create breadcrumb items
  const items = pathParts.map((part, index) => {
    const href = "/" + pathParts.slice(0, index + 1).join("/");
    const isLast = index === pathParts.length - 1;

    // Label heuristic:
    // 1. Try our dictionary
    // 2. If it is long or a UUID/Firestore ID, label it as 'Detalhes'
    // 3. Otherwise, capitalize
    let label = routeLabels[part];
    if (!label) {
      if (part.length > 15) {
        label = "Detalhes";
      } else {
        label = part.charAt(0).toUpperCase() + part.slice(1);
      }
    }

    return { href, label, isLast };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 hidden md:flex items-center space-x-2 text-sm"
    >
      <Link
        href="/portal"
        className="text-stone-500 hover:text-stone-800 transition-colors flex items-center"
      >
        <Home size={14} className="mr-1" />
      </Link>

      {items.map((item, index) => {
        // Skip the initial "portal" part since we already have the Home icon pointing to it
        if (item.href === "/portal") return null;

        return (
          <React.Fragment key={item.href}>
            <ChevronRight size={14} className="text-stone-300 flex-shrink-0" />
            <Link
              href={item.href}
              className={`transition-colors truncate max-w-[150px] ${
                item.isLast
                  ? "text-stone-800 font-medium pointer-events-none"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {item.label}
            </Link>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
