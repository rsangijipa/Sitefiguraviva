"use client";

import { PauseRoomExperience } from "./src/features/interactive-resources/pause-room/PauseRoomExperience";
import type { UserProfile } from "./src/types";

export default function SalaDePausaApp({ user, onExit }: { user?: { id?: string; uid?: string; email?: string; displayName?: string | null }; onExit?: () => void }) {
  const currentUser: UserProfile = {
    id: user?.id ?? user?.uid ?? "",
    name: user?.displayName ?? "",
    email: user?.email ?? "",
    role: "student",
    avatarInitials: (user?.displayName ?? "").slice(0, 2).toUpperCase(),
  };
  return <PauseRoomExperience currentUser={currentUser} onBackToPortal={onExit ?? (() => {})} />;
}
