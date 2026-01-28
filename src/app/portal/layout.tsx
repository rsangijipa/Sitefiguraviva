"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, LayoutDashboard, User, Menu, X } from "lucide-react";
import PageShell from "@/components/ui/PageShell";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        // We will replace this with loading.tsx later, but for now keeps it consistent
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCF9]">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    if (!user) return null;

    return (
        <PageShell variant="portal" className="flex flex-col">
            {/* Unified Top Navigation (Glass) */}
            <header className="h-16 px-6 flex items-center justify-between sticky top-0 z-50 bg-white/60 backdrop-blur-md border-b border-white/40 shadow-sm transition-all">
                <div className="flex items-center gap-8">
                    <Link href="/portal" className="font-serif text-xl text-primary font-bold">
                        Instituto Figura Viva
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/portal" className="text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-primary transition-colors flex items-center gap-2">
                            <LayoutDashboard size={14} /> Meus Cursos
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-xs font-bold text-primary">{user.displayName}</span>
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider">Aluno</span>
                    </div>
                    <div className="w-8 h-8 bg-white/50 border border-white rounded-full flex items-center justify-center text-stone-400 shadow-inner">
                        {user.photoURL ? <img src={user.photoURL} alt={user.displayName || ""} className="w-full h-full rounded-full" /> : <User size={16} />}
                    </div>

                    {/* Desktop Logout */}
                    <button
                        onClick={() => signOut()}
                        className="hidden md:block p-2 text-stone-400 hover:text-red-500 transition-colors"
                        title="Sair"
                    >
                        <LogOut size={16} />
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-stone-500"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-xl pt-20 px-6">
                    <nav className="flex flex-col gap-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-stone-100">
                            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                                {user.photoURL ? <img src={user.photoURL} alt={user.displayName || ""} className="w-full h-full rounded-full" /> : <User size={20} />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-primary">{user.displayName}</p>
                                <p className="text-xs text-stone-400 uppercase tracking-wider">Aluno</p>
                            </div>
                        </div>
                        <Link
                            href="/portal"
                            className="text-lg font-bold text-stone-600 hover:text-primary flex items-center gap-3"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <LayoutDashboard size={20} /> Meus Cursos
                        </Link>
                        <button
                            onClick={() => signOut()}
                            className="text-lg font-bold text-red-400 hover:text-red-500 flex items-center gap-3 mt-4"
                        >
                            <LogOut size={20} /> Sair
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto p-6 md:p-8">
                {children}
            </main>
        </PageShell>
    );
}
