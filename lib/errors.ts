/**
 * Application error hierarchy.
 * Services throw typed errors; route handlers/actions map them to HTTP responses.
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly expose: boolean;

  constructor(message: string, code: string, status: number, expose = true) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.expose = expose;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, "VALIDATION", 400);
    this.name = "ValidationError";
  }
}

export class AuthError extends AppError {
  constructor(message = "Authentication required") {
    super(message, "UNAUTHENTICATED", 401);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}

export class PaymentError extends AppError {
  constructor(message = "Payment failed") {
    super(message, "PAYMENT_FAILED", 402);
    this.name = "PaymentError";
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = "External service unavailable") {
    super(message, "UPSTREAM", 502, false);
    this.name = "ExternalServiceError";
  }
}

/**
 * Map AppError to a JSON response body.
 */
export function errorToResponse(error: unknown, traceId?: string) {
  if (error instanceof AppError) {
    return {
      ok: false as const,
      error: {
        code: error.code,
        message: error.expose ? error.message : "An unexpected error occurred",
        traceId,
      },
    };
  }

  return {
    ok: false as const,
    error: {
      code: "INTERNAL",
      message: "An unexpected error occurred",
      traceId,
    },
  };
}

export function getStatusFromError(error: unknown): number {
  if (error instanceof AppError) return error.status;
  return 500;
}
