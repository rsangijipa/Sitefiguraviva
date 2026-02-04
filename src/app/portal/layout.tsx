"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SWRegistration } from "@/components/portal/SWRegistration";
import { OfflineIndicator } from "@/components/portal/OfflineIndicator";
import { DashboardShell } from "@/components/portal/shell/DashboardShell";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCF9]">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <DashboardShell>
            <SWRegistration />
            <OfflineIndicator />
            {children}
        </DashboardShell>
    );
}
