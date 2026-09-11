import {
  deleteSessionFromStorage,
  getSavedSessions,
  saveSessionToStorage,
} from "../utils/storage";
import { ReflectionSession } from "../types";

const buildSession = (id: string): ReflectionSession => ({
  id,
  title: "Diálogo de teste",
  chairA: { id: "A", name: "Voz A", sublabel: "", accentColor: "#1c1917" },
  chairB: { id: "B", name: "Voz B", sublabel: "", accentColor: "#b45309" },
  turns: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isCompleted: false,
});

describe("duas-cadeiras storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists only on explicit save and never leaves an active-session copy", () => {
    expect(getSavedSessions()).toEqual([]);

    const session = buildSession("session-1");
    expect(saveSessionToStorage(session)).toBe(true);
    expect(getSavedSessions()).toHaveLength(1);
    expect(localStorage.getItem("duas_cadeiras_active_session_v1")).toBeNull();

    deleteSessionFromStorage("session-1");
    expect(getSavedSessions()).toEqual([]);
  });
});
