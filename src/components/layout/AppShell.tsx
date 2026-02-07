import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface AppShellProps {
    children: React.ReactNode;
    hideFooter?: boolean;
}

export default function AppShell({ children, hideFooter = false }: AppShellProps) {
    return (
        <div className="flex flex-col min-h-screen bg-paper text-primary font-sans transition-colors duration-500">
            <Navbar />

            <main className="flex-1 w-full pt-20"> {/* pt-20 to account for fixed navbar */}
                <div className="container mx-auto px-4 md:px-6 py-6 md:py-12 fade-in">
                    {children}
                </div>
            </main>

            {!hideFooter && <Footer />}
        </div>
    );
}
