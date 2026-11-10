import type { Router } from "express";
import { RelatedProductTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./index.js";

export const registerProductPublicRelatedRoutes = (
  router: Router,
  { rateLimiter, relatedProductController }: ProductRouteDeps,
) => {
  router.get(
    "/:productId/related",
    rateLimiter,
    validateMultiple(RelatedProductTypes.ListRelated),
    relatedProductController.list,
  );
};

export const registerProductAdminRelatedRoutes = (
  router: Router,
  { authMiddleware, rateLimiter, relatedProductController }: ProductRouteDeps,
) => {
  router.post(
    "/admin/:productId/related",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(RelatedProductTypes.AddRelatedProduct),
    relatedProductController.add,
  );

  router.delete(
    "/admin/:productId/related/:relatedProductId",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(RelatedProductTypes.RemoveRelatedProduct),
    relatedProductController.remove,
  );
};
