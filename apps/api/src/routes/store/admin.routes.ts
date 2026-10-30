import type { Router } from "express";
import { StoreAdminTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { StoreRouteDeps } from "./index.js";

export const registerStoreAdminRoutes = (
  router: Router,
  { storeController, authMiddleware, rateLimiter }: StoreRouteDeps,
) => {
  router.get(
    "/admin",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(StoreAdminTypes.ListStores),
    storeController.listAdmin,
  );

  router.get(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(StoreAdminTypes.GetStoreById),
    storeController.getByIdAdmin,
  );

  router.post(
    "/admin",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(StoreAdminTypes.CreateStore),
    storeController.create,
  );

  router.put(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(StoreAdminTypes.UpdateStore),
    storeController.update,
  );

  router.delete(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(StoreAdminTypes.DeleteStore),
    storeController.delete,
  );

  router.patch(
    "/admin/:id/restore",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(StoreAdminTypes.RestoreStore),
    storeController.restore,
  );
};
