import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    title: string;
    message: string;
    className?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

export default function EmptyState({
    title,
    message,
    className,
    icon,
    action
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center text-center p-12 bg-white/30 backdrop-blur-sm rounded-[2.5rem] border border-stone-200/50 shadow-soft-xl", className)}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8 relative"
            >
                {/* Organic SVG Background for Icon */}
                <div className="absolute inset-0 bg-gold/10 blur-3xl rounded-full" />

                {icon ? (
                    <div className="relative z-10 text-gold/40 flex items-center justify-center">
                        {icon}
                    </div>
                ) : (
                    <svg
                        viewBox="0 0 200 200"
                        className="w-32 h-32 text-gold/20 relative z-10"
                        fill="currentColor"
                    >
                        <path d="M40,100 Q40,40 100,40 Q160,40 160,100 Q160,160 100,160 Q40,160 40,100" />
                        <motion.path
                            initial={{ d: "M60,100 Q60,60 100,60 Q140,60 140,100 Q140,140 100,140 Q60,140 60,100" }}
                            animate={{
                                d: [
                                    "M60,100 Q60,60 100,60 Q140,60 140,100 Q140,140 100,140 Q60,140 60,100",
                                    "M55,100 Q55,55 100,55 Q145,55 145,100 Q145,145 100,145 Q55,145 55,100",
                                    "M60,100 Q60,60 100,60 Q140,60 140,100 Q140,140 100,140 Q60,140 60,100"
                                ]
                            }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                        />
                    </svg>
                )}
            </motion.div>

            <h3 className="font-serif text-2xl text-primary mb-3">
                {title}
            </h3>
            <p className="text-primary/60 text-sm max-w-sm mb-8 leading-relaxed">
                {message}
            </p>

            {action && (
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {action}
                </motion.div>
            )}
        </div>
    );
}
