class TelemetryService {
  private isDev = process.env.NODE_ENV === "development";

  public track(event: string, properties?: Record<string, any>) {
    if (this.isDev) {
      const scope = typeof window === "undefined" ? "[Server]" : "[Client]";
      console.log(`${scope} [Telemetry] ${event}`, properties);
    }
  }

  public error(error: any, context?: Record<string, any>) {
    const scope = typeof window === "undefined" ? "[Server]" : "[Client]";
    console.error(`${scope} [Telemetry Error]`, error, context);
  }

  public identify(userId: string, traits?: Record<string, any>) {
    if (this.isDev) {
      console.log(`[Telemetry] Identify: ${userId}`, traits);
    }
  }
}

export const telemetry = new TelemetryService();
