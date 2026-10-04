/**
 * Telemetria ética do Instituto Figura Viva
 * Registra exclusivamente ciclo de vida de recursos sem capturar dados íntimos ou texto livre.
 */
import { TelemetryEventType, TelemetryEventPayload } from '../types';

class TelemetryService {
  private events: Array<{ type: TelemetryEventType; payload: TelemetryEventPayload }> = [];

  log(type: TelemetryEventType, payload: Omit<TelemetryEventPayload, 'timestamp'>) {
    const event = {
      type,
      payload: {
        ...payload,
        timestamp: new Date().toISOString(),
      },
    };
    this.events.push(event);
    if (process.env.NODE_ENV === 'development') {
      console.info(`[Figura Viva Telemetry] ${type}:`, event.payload);
    }
  }

  getEvents() {
    return [...this.events];
  }
}

export const telemetry = new TelemetryService();
