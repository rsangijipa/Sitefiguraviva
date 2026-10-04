"use client";

import PushNotificationManager from "@/components/system/PushNotificationManager";
import { AuthProvider } from "@/context/AuthContext";
import { GamificationProvider } from "@/context/GamificationContext";
import { AudioProvider } from "@/context/AudioContext";
import FloatingAudioPlayer from "@/components/ui/FloatingAudioPlayer";

export function PortalProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AudioProvider>
        <GamificationProvider>
          <PushNotificationManager />
          <FloatingAudioPlayer />
          {children}
        </GamificationProvider>
      </AudioProvider>
    </AuthProvider>
  );
}
