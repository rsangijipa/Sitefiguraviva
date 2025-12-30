"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

/* --- CONTEXT --- */
interface ModalContextProps {
    onClose: () => void;
}
const ModalContext = React.createContext<ModalContextProps | null>(null);

/* --- ROOT --- */
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
    // Close on ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <ModalContext.Provider value={{ onClose }}>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 mobile-app-safe-area" role="dialog" aria-modal="true">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-primary/60 backdrop-blur-sm transition-all"
                            aria-hidden="true"
                        />
                        {children}
                    </div>
                )}
            </AnimatePresence>
        </ModalContext.Provider>,
        document.body
    );
}

/* --- CONTENT --- */
interface ModalContentProps extends HTMLMotionProps<'div'> {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function ModalContent({ children, className, size = 'md', ...props }: ModalContentProps) {
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-full h-full rounded-none'
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
                "relative w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]",
                sizes[size],
                className
            )}
            onClick={(e) => e.stopPropagation()}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/* --- HEADER --- */
export function ModalHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const { onClose } = React.useContext(ModalContext)!;
    return (
        <div className={cn("p-5 md:p-8 border-b border-gray-100 flex items-start justify-between bg-stone-50 shrink-0", className)} {...props}>
            <div className="flex-1">{children}</div>
            <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary ml-4"
                aria-label="Close"
            >
                <X size={20} />
            </button>
        </div>
    );
}

/* --- BODY --- */
export function ModalBody({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("overflow-y-auto custom-scrollbar flex-1 relative p-5 md:p-8", className)} {...props}>
            {children}
        </div>
    );
}

/* --- FOOTER --- */
export function ModalFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("p-5 md:p-8 border-t border-gray-100 bg-stone-50 shrink-0", className)} {...props}>
            {children}
        </div>
    );
}
