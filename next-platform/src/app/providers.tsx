"use client";

import { AppProvider } from '../context/AppContext';
import { ToastProvider } from '../context/ToastContext';

export default function Providers({ children }) {
    return (
        <AppProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </AppProvider>
    );
}
