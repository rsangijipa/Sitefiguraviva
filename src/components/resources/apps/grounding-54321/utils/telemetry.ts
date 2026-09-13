import { TelemetryRecord } from "../types";

export async function logResourceStarted(
  sessionId: string,
): Promise<TelemetryRecord> {
  const startedAt = new Date().toISOString();
  return {
    id: sessionId,
    resource_started: startedAt,
  };
}

export async function logResourceCompleted(
  sessionId: string,
  durationSeconds: number,
  startedAt?: string,
): Promise<TelemetryRecord> {
  const completedAt = new Date().toISOString();
  const safeDuration = Math.max(1, Math.round(durationSeconds));
  return {
    id: sessionId,
    resource_started:
      startedAt || new Date(Date.now() - safeDuration * 1000).toISOString(),
    resource_completed: completedAt,
    duration: safeDuration,
  };
}

export async function fetchTelemetryHistory(): Promise<TelemetryRecord[]> {
  return [];
}
