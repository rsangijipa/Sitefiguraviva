import { useState, useCallback } from "react";
import type { ClientThought, ThoughtStatus } from "./types";
import { MAX_EPHEMERAL_LEAVES } from "./types";
import { validateThought } from "./schema";

export function useSessionState() {
  const [leaves, setLeaves] = useState<ClientThought[]>([]);

  const addLeaf = useCallback(
    (rawText: string): { success: boolean; error?: string } => {
      const validation = validateThought(rawText);
      if (!validation.success) {
        return { success: false, error: validation.error };
      }
      if (leaves.length >= MAX_EPHEMERAL_LEAVES) {
        return {
          success: false,
          error: `Limite de ${MAX_EPHEMERAL_LEAVES} folhas atingido.`,
        };
      }
      const newLeaf: ClientThought = {
        id: `eph-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        thoughtText: validation.text!,
        status: "placed",
        createdAt: Date.now(),
      };
      setLeaves((prev) => [...prev, newLeaf]);
      return { success: true };
    },
    [leaves.length],
  );

  const removeLeaf = useCallback((id: string) => {
    setLeaves((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setLeaves([]);
  }, []);

  const updateStatus = useCallback(
    (id: string, status: ClientThought["status"]) => {
      setLeaves((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l)),
      );
    },
    [],
  );

  const editLeaf = useCallback(
    (id: string, newText: string): { success: boolean; error?: string } => {
      const validation = validateThought(newText);
      if (!validation.success) {
        return { success: false, error: validation.error };
      }
      setLeaves((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, thoughtText: validation.text! } : l,
        ),
      );
      return { success: true };
    },
    [],
  );

  const getLeafById = useCallback(
    (id: string) => {
      return leaves.find((l) => l.id === id);
    },
    [leaves],
  );

  return {
    leaves,
    addLeaf,
    removeLeaf,
    clearAll,
    updateStatus,
    editLeaf,
    getLeafById,
  };
}
