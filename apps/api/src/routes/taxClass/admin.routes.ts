import type { Router } from "express";
import { TaxClassAdminTypes, TaxClassTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { TaxClassRouteDeps } from "./index.js";

export const registerTaxClassAdminRoutes = (
  router: Router,
  { controller, authMiddleware, rateLimiter }: TaxClassRouteDeps,
) => {
  router.get(
    "/admin",
    rateLimiter,
    validateMultiple(TaxClassAdminTypes.List),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.listAdmin,
  );

  router.get(
    "/admin/:id",
    rateLimiter,
    validateMultiple(TaxClassAdminTypes.GetById),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.getAdmin,
  );

  router.post(
    "/",
    rateLimiter,
    validateMultiple(TaxClassTypes.Create),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.create,
  );

  router.put(
    "/:id",
    rateLimiter,
    validateMultiple(TaxClassTypes.Update),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.update,
  );

  router.delete(
    "/:id",
    rateLimiter,
    validateMultiple(TaxClassTypes.Delete),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.delete,
  );
};
