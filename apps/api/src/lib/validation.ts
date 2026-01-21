import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ValidationError } from "./error.js";

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // ID parameter schema
  idParam: z.object({
    id: z.string().min(1, "ID is required"),
  }),

  // Pagination schema
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),

  // User schemas
  createUser: z.object({
    body: z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email format"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    }),
  }),

  updateUser: z.object({
    params: z.object({
      id: z.string().min(1, "ID is required"),
    }),
    body: z.object({
      name: z.string().min(2, "Name must be at least 2 characters").optional(),
      email: z.string().email("Invalid email format").optional(),
    }),
  }),

  // Example product schema
  createProduct: z.object({
    body: z.object({
      name: z.string().min(1, "Product name is required"),
      price: z.number().positive("Price must be positive"),
      description: z.string().optional(),
      category: z.string().min(1, "Category is required"),
    }),
  }),
};

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as Record<string, any>;
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
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validatedData: Record<string, any> = {};
    const allErrors: Array<{ field: string; message: string }> = [];

    // Validate all properties and collect all errors
    for (const [property, schema] of Object.entries(schemaObj)) {
      if (!schema) continue; // Skip if no schema for this property
      const prop = property as keyof Request;

      try {
        const result = schema.parse(req[prop]) as any;
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
    if (validatedData.body) req.body = validatedData.body;
    if (validatedData.params) req.params = validatedData.params;
    // Note: req.query is read-only in Express, so we don't assign it back
    next();
  };
};

/** * Auth validation schemas
 */
export const registerSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

/** * Type helper to infer validated request types
 */
export type ValidatedRequest<T extends z.ZodSchema> = Omit<
  Request,
  keyof z.infer<T>
> &
  z.infer<T>;
