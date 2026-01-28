"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextData {
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((state) => [...state, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((state) => state.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, 5000); // Increased to 5s for better readability

        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const icons = {
        success: <CheckCircle size={18} className="text-green-500" />,
        error: <AlertCircle size={18} className="text-red-500" />,
        info: <Info size={18} className="text-blue-500" />,
    };

    const variants = {
        success: 'border-green-500/30 bg-green-50/80 shadow-[0_4px_20px_-4px_rgba(34,197,94,0.1)]',
        error: 'border-red-500/30 bg-red-50/80 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.1)]',
        info: 'border-blue-500/30 bg-blue-50/80 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.1)]',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`pointer-events-auto w-[320px] p-4 rounded-xl backdrop-blur-xl border flex items-start gap-4 ${variants[toast.type]}`}
        >
            <div className={`mt-0.5 shrink-0 p-1 rounded-full ${toast.type === 'success' ? 'bg-green-100' : toast.type === 'error' ? 'bg-red-100' : 'bg-blue-100'}`}>
                {icons[toast.type]}
            </div>
            <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-0.5">
                    {toast.type === 'error' ? 'Erro' : toast.type === 'success' ? 'Sucesso' : 'Info'}
                </p>
                <p className="text-sm font-medium text-stone-800 leading-snug">{toast.message}</p>
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-stone-400 hover:text-stone-600 transition-colors p-1"
            >
                <X size={14} />
            </button>
        </motion.div>
    );
};

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
