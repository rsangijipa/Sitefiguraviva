"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "flex flex-col items-center justify-center py-20 px-6 text-center rounded-[2.5rem] bg-white border border-stone-100 shadow-sm relative overflow-hidden",
                className
            )}
        >
            {/* Background Decor */}
            <div className="absolute inset-0 pointer-events-none opacity-50">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-stone-50 rounded-full blur-3xl mix-blend-multiply" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-stone-50 border border-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-300 shadow-inner">
                    {icon}
                </div>

                <h3 className="font-serif text-2xl text-primary mb-3">
                    {title}
                </h3>

                <p className="text-stone-400 max-w-sm mx-auto mb-8 font-light text-sm leading-relaxed">
                    {description}
                </p>

                {action && (
                    <div className="animate-fade-in-up">
                        {action}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
