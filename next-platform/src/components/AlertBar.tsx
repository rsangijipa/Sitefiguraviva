"use client";

import { motion } from 'framer-motion';

interface AlertBarProps {
    message: string | null;
}

export default function AlertBar({ message }: AlertBarProps) {
    if (!message) return null;

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-accent text-white text-xs font-bold tracking-widest uppercase text-center py-2 px-4 shadow-md relative z-[60] cursor-pointer hover:bg-gold transition-colors"
        >
            {message}
        </motion.div>
    );
}
