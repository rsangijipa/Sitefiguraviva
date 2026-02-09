"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "@/components/icons";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  links: {
    href: string;
    label: string;
    icon?: React.ReactNode;
  }[];
  userSection?: React.ReactNode;
}

export default function MobileNav({ links, userSection }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white border-2 border-stone-200 shadow-lg hover:border-primary transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X size={24} className="text-stone-800" />
        ) : (
          <Menu size={24} className="text-stone-800" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-40 shadow-2xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-stone-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-serif text-stone-800">
                Menu
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {userSection}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                      isActive
                        ? "bg-primary text-white shadow-md"
                        : "text-stone-700 hover:bg-stone-100",
                    )}
                  >
                    {link.icon && <span className="shrink-0">{link.icon}</span>}
                    <span className="text-sm">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-stone-200">
            <div className="text-xs text-stone-500 text-center">
              Instituto Figura Viva © 2026
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
