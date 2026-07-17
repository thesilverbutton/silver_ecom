import { randomUUID } from "crypto";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  msg: string;
  traceId?: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === "production" ? "info" : "debug");

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level]! >= LOG_LEVELS[currentLevel]!;
}

function log(level: LogLevel, msg: string, context?: Record<string, unknown>, traceId?: string) {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    msg,
    traceId,
    context,
    timestamp: new Date().toISOString(),
  };

  const output = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  debug: (msg: string, context?: Record<string, unknown>, traceId?: string) =>
    log("debug", msg, context, traceId),
  info: (msg: string, context?: Record<string, unknown>, traceId?: string) =>
    log("info", msg, context, traceId),
  warn: (msg: string, context?: Record<string, unknown>, traceId?: string) =>
    log("warn", msg, context, traceId),
  error: (msg: string, context?: Record<string, unknown>, traceId?: string) =>
    log("error", msg, context, traceId),
};

/**
 * Generate a unique trace ID for request/action scoping.
 */
export function generateTraceId(): string {
  return randomUUID();
}
