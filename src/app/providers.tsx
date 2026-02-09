"use client";

import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { UIProvider } from "@/context/UIContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UIProvider>
          <ToastProvider>{children}</ToastProvider>
        </UIProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
