"use client";

import PushNotificationManager from "@/components/system/PushNotificationManager";
import { AuthProvider } from "@/context/AuthContext";
import { GamificationProvider } from "@/context/GamificationContext";

export function PortalProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <GamificationProvider>
        <PushNotificationManager />
        {children}
      </GamificationProvider>
    </AuthProvider>
  );
}
