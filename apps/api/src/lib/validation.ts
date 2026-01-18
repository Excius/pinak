import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ResponseHandler } from "./response.js";
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
 * @param schemas - Object with property names as keys and schemas as values
 */
export const validateMultiple = (schemas: Record<string, z.ZodSchema>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData: Record<string, any> = {};

      for (const [property, schema] of Object.entries(schemas)) {
        const result = schema.parse({
          [property]: req[property as keyof Request],
        }) as Record<string, any>;
        validatedData[property] = result[property];
      }

      // Merge validated data back into request
      Object.assign(req, validatedData);
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
 * Type helper to infer validated request types
 */
export type ValidatedRequest<T extends z.ZodSchema> = Omit<
  Request,
  keyof z.infer<T>
> &
  z.infer<T>;
