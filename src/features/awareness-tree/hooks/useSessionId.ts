"use client";

import { useState } from "react";

import {
  migrateLegacyStorage,
  SESSION_STORAGE_KEY,
} from "@/features/awareness-tree/lib/utils/storage";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  migrateLegacyStorage();

  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const generated = crypto.randomUUID();
  window.localStorage.setItem(SESSION_STORAGE_KEY, generated);
  return generated;
}

export function useSessionId() {
  const [sessionId] = useState(() => getOrCreateSessionId());
  return sessionId;
}
