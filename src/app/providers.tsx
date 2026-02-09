"use client";

import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { UIProvider } from "@/context/UIContext";
import { GamificationProvider } from "@/context/GamificationContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UIProvider>
          <GamificationProvider>
            <ToastProvider>{children}</ToastProvider>
          </GamificationProvider>
        </UIProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
