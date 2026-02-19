import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ValidationError } from "./error.js";

/**
 * Validation middleware factory
 * @param schema - Zod schema to validate against
 * @param property - Request property to validate ('body', 'query', 'params')
 */
export const validate = (
  schema: z.ZodSchema,
  property: "body" | "query" | "params" = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        [property]: req[property],
      }) as Record<string, unknown>;
      req[property] = validatedData[property];
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.issues.map((err: z.ZodIssue) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw new ValidationError("Validation failed", validationErrors);
      }
      next(error);
    }
  };
};

/**
 * Combined validation middleware for multiple properties
 * @param schemaObj - Object with 'body', 'query', 'params' as optional keys and Zod schemas as values
 */
export const validateMultiple = (schemaObj: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
  response?: z.ZodSchema; // Ignored for input validation
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validatedData: Record<string, unknown> = {};
    const allErrors: Array<{ field: string; message: string }> = [];

    // Validate all properties and collect all errors
    for (const [property, schema] of Object.entries(schemaObj)) {
      // Only validate input properties: body, query, params
      if (property === "response" || !schema) continue;
      const prop = property as "body" | "query" | "params";

      try {
        const input = req[prop] !== undefined ? req[prop] : {};
        const result = schema.parse(input) as unknown;
        validatedData[property] = result;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const propertyErrors = error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join("."),
            message: err.message,
          }));
          allErrors.push(...propertyErrors);
        }
      }
    }

    // If there are any validation errors, throw them all
    if (allErrors.length > 0) {
      throw new ValidationError("Validation failed", allErrors);
    }

    // Merge validated data back into request (skip query as it's read-only)
    if (validatedData.body)
      req.body = validatedData.body as Record<string, unknown>;
    if (validatedData.params)
      req.params = validatedData.params as Record<string, string>;
    // Note: req.query is read-only in Express, so we don't assign it back
    next();
  };
};

/** * Type helper to infer validated request types
 */
export type ValidatedRequest<T extends z.ZodSchema> = Omit<
  Request,
  keyof z.infer<T>
> &
  z.infer<T>;
