"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded shadow-xl whitespace-nowrap z-[100] pointer-events-none"
                    >
                        {content}
                        {/* Triangle Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-primary" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
