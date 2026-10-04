/**
 * Telemetry Event Schema (SSoT)
 * Standardized tracking to prevent 'invented' events across the UI.
 */

export type TelemetryEvent =
  | { name: "lesson_start"; payload: { courseId: string; lessonId: string } }
  | {
      name: "lesson_started";
      payload: { courseId: string; lessonId: string; timeSpent?: number };
    }
  | {
      name: "lesson_progress";
      payload: {
        courseId: string;
        lessonId: string;
        percentage: 25 | 50 | 75 | 100;
      };
    }
  | { name: "lesson_complete"; payload: { courseId: string; lessonId: string } }
  | {
      name: "lesson_completed";
      payload: { courseId: string; lessonId: string; timeSpent?: number };
    }
  | {
      name: "lesson_abandon";
      payload: { courseId: string; lessonId: string; lastPosition: number };
    }
  | {
      name: "course_completed";
      payload: { courseId: string; timeSpent?: number };
    }
  | {
      name: "checkpoint_reached";
      payload: {
        courseId: string;
        lessonId: string;
        checkpointId: string;
        timeSpent?: number;
      };
    }
  | {
      name: "community_post_created";
      payload: { courseId: string; type: "thread" | "reply" };
    }
  | { name: "audio_player_start"; payload: { trackId: string } }
  | { name: "audio_player_complete"; payload: { trackId: string } }
  | {
      name: "error_boundary_triggered";
      payload: { component: string; error: string };
    };

export interface TelemetryContext {
  userId?: string;
  tenantId?: string;
  sessionId: string;
  route: string;
  timestamp: number;
}

/**
 * Standardized tracking function.
 * Ensures all events follow the strictly defined schema.
 */
export async function trackEvent<E extends TelemetryEvent>(
  event: E["name"],
  payload: E["payload"],
  context?: Partial<TelemetryContext>,
) {
  const fullContext: TelemetryContext = {
    sessionId:
      typeof window !== "undefined" ? window.crypto.randomUUID() : "ssr",
    route: typeof window !== "undefined" ? window.location.pathname : "server",
    timestamp: Date.now(),
    ...context,
  };

  if (process.env.NODE_ENV === "development") {
    console.log(`[Telemetry] ${event}`, { payload, context: fullContext });
  }

  // Implementation for recording to Firestore or Analytics service goes here
  // try {
  //   await addDoc(collection(db, 'telemetry_events'), { event, payload, ...fullContext });
  // } catch (e) { console.error('Telemetry failed', e); }
}
