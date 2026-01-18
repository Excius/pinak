/**
 * Base error class for application errors
 * All custom errors should extend this class
 */
export abstract class BaseError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode?: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true,
    errorCode?: string,
    details?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends BaseError {
  constructor(
    message: string = "Bad request",
    errorCode?: string,
    details?: any,
  ) {
    super(message, 400, true, errorCode, details);
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends BaseError {
  constructor(
    message: string = "Unauthorized",
    errorCode?: string,
    details?: any,
  ) {
    super(message, 401, true, errorCode, details);
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends BaseError {
  constructor(
    message: string = "Forbidden",
    errorCode?: string,
    details?: any,
  ) {
    super(message, 403, true, errorCode, details);
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends BaseError {
  constructor(
    message: string = "Resource not found",
    errorCode?: string,
    details?: any,
  ) {
    super(message, 404, true, errorCode, details);
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends BaseError {
  constructor(message: string = "Conflict", errorCode?: string, details?: any) {
    super(message, 409, true, errorCode, details);
  }
}

/**
 * Unprocessable Entity Error (422)
 */
export class UnprocessableEntityError extends BaseError {
  constructor(
    message: string = "Unprocessable entity",
    errorCode?: string,
    details?: any,
  ) {
    super(message, 422, true, errorCode, details);
  }
}

/**
 * Too Many Requests Error (429)
 */
export class TooManyRequestsError extends BaseError {
  constructor(
    message: string = "Too many requests",
    errorCode?: string,
    details?: any,
  ) {
    super(message, 429, true, errorCode, details);
  }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends BaseError {
  constructor(
    message: string = "Internal server error",
    errorCode?: string,
    details?: any,
  ) {
    super(message, 500, false, errorCode, details);
  }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends BaseError {
  constructor(message: string = "Validation failed", details?: any) {
    super(message, 400, true, "VALIDATION_ERROR", details);
  }
}
