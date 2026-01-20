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
        }, 4000); // Auto remove after 4s

        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const icons = {
        success: <CheckCircle size={20} className="text-green-500" />,
        error: <AlertCircle size={20} className="text-red-500" />,
        info: <Info size={20} className="text-blue-500" />,
    };

    const bgColors = {
        success: 'bg-white border-l-4 border-green-500 text-stone-800',
        error: 'bg-white border-l-4 border-red-500 text-stone-800',
        info: 'bg-white border-l-4 border-blue-500 text-stone-800',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-r-lg shadow-lg flex items-start gap-3 ${bgColors[toast.type]}`}
        >
            <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
            <div className="flex-1">
                <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
            >
                <X size={16} />
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
