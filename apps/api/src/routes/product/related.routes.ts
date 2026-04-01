import type { Router } from "express";
import { RelatedProductTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ProductRouteDeps } from "./route-deps.js";

export const registerProductPublicRelatedRoutes = (
  router: Router,
  { authMiddleware, rateLimiter, relatedProductController }: ProductRouteDeps,
) => {
  router.get(
    "/:productId/related",
    authMiddleware.authenticate,
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
    "/:productId/related",
    rateLimiter,
    validateMultiple(RelatedProductTypes.AddRelatedProduct),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    relatedProductController.add,
  );

  router.delete(
    "/:productId/related/:relatedProductId",
    rateLimiter,
    validateMultiple(RelatedProductTypes.RemoveRelatedProduct),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    relatedProductController.remove,
  );
};
