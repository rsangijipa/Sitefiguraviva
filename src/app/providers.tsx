"use client";

import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { UIProvider } from "@/context/UIContext";
import { GamificationProvider } from "@/context/GamificationContext";
import { AudioProvider } from "@/context/AudioContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Without a staleTime every mount refetched, so moving between
            // admin screens re-read the same rows on each navigation.
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

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
