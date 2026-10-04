
"use client";

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export const OfflineIndicator = () => {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        if (!navigator.onLine) setIsOffline(true);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-2"
                >
                    <div className="bg-amber-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3 text-sm font-bold border border-amber-500/20">
                        <WifiOff size={16} />
                        <span>Modo Offline Ativado</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
