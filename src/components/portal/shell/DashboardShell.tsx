
import { SidebarNav } from './SidebarNav';
import { Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import NotificationBell from '@/components/layout/NotificationBell';
// import { UserDropdown } from './UserDropdown'; // To be created

export const DashboardShell = ({ children }: { children: React.ReactNode }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#FDFCF9] flex">
            {/* Desktop Sidebar */}
            <SidebarNav className="hidden lg:flex" />

            {/* Mobile Sidebar Overlay (Simple implementation for P1.2) */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
                    <SidebarNav className="absolute left-0 top-0 bottom-0 w-64 z-50 flex shadow-xl" />
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-stone-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 text-stone-500 hover:bg-stone-50 rounded-lg"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu size={20} />
                        </button>

                        {/* Search Bar */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-lg border border-transparent focus-within:border-stone-200 w-64 transition-colors">
                            <Search size={16} className="text-stone-400" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="bg-transparent border-none outline-none text-sm placeholder:text-stone-400 w-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationBell />

                        {/* Avatar / User Dropdown Placeholder */}
                        <div className="w-8 h-8 bg-stone-200 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-stone-500">
                            FV
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
