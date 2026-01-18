import { Response } from "express";

/**
 * API Response Messages
 */
const API_MESSAGES = {
  SUCCESS: "Success",
  CREATED: "Resource created successfully",
  NO_CONTENT: "No content",
  BAD_REQUEST: "Bad request",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Resource not found",
  CONFLICT: "Conflict",
  UNPROCESSABLE_ENTITY: "Unprocessable entity",
  TOO_MANY_REQUESTS: "Too many requests",
  INTERNAL_SERVER_ERROR: "Internal server error",
} as const;

/**
 * Singleton Response Handler for standardized API responses
 * Provides consistent response format across the application
 */
class ResponseHandler {
  private static instance: ResponseHandler;

  private constructor() {}

  static getInstance(): ResponseHandler {
    if (!ResponseHandler.instance) {
      ResponseHandler.instance = new ResponseHandler();
    }
    return ResponseHandler.instance;
  }

  /**
   * Sends a success response (200)
   * @param res - Express Response object
   * @param data - The response data
   * @param message - Optional success message
   * @param meta - Optional metadata
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = API_MESSAGES.SUCCESS,
    meta?: Record<string, any>,
  ): void {
    const response = {
      success: true,
      message,
      data,
      ...(meta && { meta }),
    };
    res.status(200).json(response);
  }

  /**
   * Sends a created response (201)
   * @param res - Express Response object
   * @param data - The created resource data
   * @param message - Optional success message
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = API_MESSAGES.CREATED,
  ): void {
    const response = {
      success: true,
      message,
      data,
    };
    res.status(201).json(response);
  }

  /**
   * Sends a no content response (204)
   * @param res - Express Response object
   */
  static noContent(res: Response): void {
    res.status(204).send();
  }

  /**
   * Sends a bad request response (400)
   * @param res - Express Response object
   * @param message - Error message
   * @param errors - Optional detailed error information
   */
  static badRequest(
    res: Response,
    message: string = API_MESSAGES.BAD_REQUEST,
    errors?: any,
  ): void {
    const response = {
      success: false,
      message,
      ...(errors && { errors }),
    };
    res.status(400).json(response);
  }

  /**
   * Sends an unauthorized response (401)
   * @param res - Express Response object
   * @param message - Optional error message
   */
  static unauthorized(
    res: Response,
    message: string = API_MESSAGES.UNAUTHORIZED,
  ): void {
    const response = {
      success: false,
      message,
    };
    res.status(401).json(response);
  }

  /**
   * Sends a forbidden response (403)
   * @param res - Express Response object
   * @param message - Optional error message
   */
  static forbidden(
    res: Response,
    message: string = API_MESSAGES.FORBIDDEN,
  ): void {
    const response = {
      success: false,
      message,
    };
    res.status(403).json(response);
  }

  /**
   * Sends a not found response (404)
   * @param res - Express Response object
   * @param message - Optional error message
   */
  static notFound(
    res: Response,
    message: string = API_MESSAGES.NOT_FOUND,
  ): void {
    const response = {
      success: false,
      message,
    };
    res.status(404).json(response);
  }

  /**
   * Sends a conflict response (409)
   * @param res - Express Response object
   * @param message - Optional error message
   * @param errors - Optional detailed error information
   */
  static conflict(
    res: Response,
    message: string = API_MESSAGES.CONFLICT,
    errors?: any,
  ): void {
    const response = {
      success: false,
      message,
      ...(errors && { errors }),
    };
    res.status(409).json(response);
  }

  /**
   * Sends an unprocessable entity response (422)
   * @param res - Express Response object
   * @param message - Optional error message
   * @param errors - Optional detailed error information
   */
  static unprocessableEntity(
    res: Response,
    message: string = API_MESSAGES.UNPROCESSABLE_ENTITY,
    errors?: any,
  ): void {
    const response = {
      success: false,
      message,
      ...(errors && { errors }),
    };
    res.status(422).json(response);
  }

  /**
   * Sends a too many requests response (429)
   * @param res - Express Response object
   * @param message - Optional error message
   * @param retryAfter - Optional retry after header value
   */
  static tooManyRequests(
    res: Response,
    message: string = API_MESSAGES.TOO_MANY_REQUESTS,
    retryAfter?: string,
  ): void {
    const response = {
      success: false,
      message,
    };
    if (retryAfter) {
      res.set("Retry-After", retryAfter);
    }
    res.status(429).json(response);
  }

  /**
   * Sends an internal server error response (500)
   * @param res - Express Response object
   * @param message - Error message
   * @param errors - Optional detailed error information
   */
  static internalServerError(
    res: Response,
    message: string = API_MESSAGES.INTERNAL_SERVER_ERROR,
    errors?: any,
  ): void {
    const response = {
      success: false,
      message,
      ...(errors && { errors }),
    };
    res.status(500).json(response);
  }

  /**
   * Sends a validation error response (400)
   * @param res - Express Response object
   * @param errors - Validation error details
   * @param message - Optional error message
   */
  static validationError(
    res: Response,
    errors: any,
    message: string = "Validation failed",
  ): void {
    this.badRequest(res, message, errors);
  }
}

// Singleton instance (for backward compatibility if needed)
const responseHandler = ResponseHandler.getInstance();

export default responseHandler;
export { ResponseHandler, API_MESSAGES };
