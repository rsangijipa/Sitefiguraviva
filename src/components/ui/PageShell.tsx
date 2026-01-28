"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils'; // Make sure you have this utility or use standard string interp

interface PageShellProps {
    children: React.ReactNode;
    variant?: 'default' | 'auth' | 'portal' | 'admin';
    className?: string;
}

export default function PageShell({ children, variant = 'default', className }: PageShellProps) {
    return (
        <div className={cn("min-h-screen bg-paper relative overflow-x-hidden selection:bg-gold/20", className)}>

            {/* 1. LAYER ZERO: Texture Overlay */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* 2. LAYER ONE: Ambient Orbs (Animated) */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Orb Top Right */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, -20, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-gold/5 rounded-full blur-[120px] mix-blend-multiply"
                />

                {/* Orb Bottom Left */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 20, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] bg-accent/5 rounded-full blur-[100px] mix-blend-multiply"
                />

                {/* Orb Center (Auth Only) */}
                {variant === 'auth' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 2 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-primary/3 rounded-full blur-[150px] mix-blend-multiply"
                    />
                )}
            </div>

            {/* 3. LAYER TWO: Content */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}
