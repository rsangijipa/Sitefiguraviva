const isProduction = process.env.NODE_ENV === "production";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  message: string;
  level: LogLevel;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error | unknown;
}

class Logger {
  private formatError(error: unknown): any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: (error as any).cause,
      };
    }
    return error;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: unknown,
  ) {
    const payload: LogPayload = {
      message,
      level,
      timestamp: new Date().toISOString(),
      context,
    };

    if (error) {
      payload.error = this.formatError(error);
    }

    if (isProduction) {
      // In production, we want structured JSON logs
      console.log(JSON.stringify(payload));

      // Here is where Sentry integration would go
      // if (level === 'error' && error) { Sentry.captureException(error); }
    } else {
      // In development, pretty print
      const color =
        level === "error"
          ? "\x1b[31m"
          : level === "warn"
            ? "\x1b[33m"
            : "\x1b[36m";
      const reset = "\x1b[0m";

      console.log(`${color}[${level.toUpperCase()}]${reset} ${message}`);
      if (context) console.log(context);
      if (error) console.error(error);
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log("warn", message, context);
  }

  error(message: string, error?: unknown, context?: Record<string, any>) {
    this.log("error", message, context, error);
  }

  debug(message: string, context?: Record<string, any>) {
    if (process.env.DEBUG) {
      this.log("debug", message, context);
    }
  }
}

export const logger = new Logger();
