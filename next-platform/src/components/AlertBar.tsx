"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface AlertBarProps {
    message: string | null;
}

export default function AlertBar({ message }: AlertBarProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 5000); // 5 seconds

            return () => clearTimeout(timer);
        }
    }, [message]);

    if (!message || !isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-accent text-white text-xs font-bold tracking-widest uppercase text-center py-2 px-4 shadow-md relative z-[60] cursor-pointer hover:bg-gold transition-colors"
                >
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
