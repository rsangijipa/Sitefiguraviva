import { SidebarNav } from "./SidebarNav";
import { Menu, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import NotificationBell from "@/components/layout/NotificationBell";
import { motion, AnimatePresence } from "framer-motion";

export const DashboardShell = ({ children }: { children: React.ReactNode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex font-sans">
      {/* Desktop Sidebar */}
      <SidebarNav className="hidden lg:flex shrink-0 z-30" />

      {/* Mobile Sidebar Overlay with Framer Motion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-72 lg:hidden shadow-2xl"
            >
              <SidebarNav className="h-full w-full" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-stone-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-stone-500 hover:bg-stone-50 rounded-lg active:scale-95 transition-transform"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-lg border border-transparent focus-within:border-primary/20 focus-within:bg-white w-64 transition-all">
              <Search size={16} className="text-stone-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-transparent border-none outline-none text-sm placeholder:text-stone-400 w-full text-stone-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />

            {/* Avatar / User Dropdown Placeholder */}
            <div className="w-8 h-8 bg-stone-100 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-stone-500 border border-stone-200">
              FV
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
