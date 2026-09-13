"use client";

import { useEffect } from "react";
import { RodaDasEmocoes } from "./RodaDasEmocoes";
import { SupabasePersistenceService } from "../../../services/supabaseService";

export default function EmotionWheelApp({
  user,
  onExit,
}: {
  user?: { id?: string; uid?: string; displayName?: string | null };
  onExit?: () => void;
}) {
  useEffect(() => {
    const id = user?.id ?? user?.uid;
    if (id) {
      SupabasePersistenceService.setCurrentUser({
        id,
        name: user?.displayName ?? "",
        role: "student",
      });
    }
  }, [user]);

  return (
    <RodaDasEmocoes
      onBackToCatalog={onExit ?? (() => {})}
      onOpenDiaryModal={() => {}}
    />
  );
}
