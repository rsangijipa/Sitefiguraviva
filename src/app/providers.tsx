"use client";

import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { UIProvider } from "@/context/UIContext";
import { GamificationProvider } from "@/context/GamificationContext";
import { AudioProvider } from "@/context/AudioContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UIProvider>
          <GamificationProvider>
            <AudioProvider>
              <ToastProvider>{children}</ToastProvider>
            </AudioProvider>
          </GamificationProvider>
        </UIProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
