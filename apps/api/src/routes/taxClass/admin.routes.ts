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
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(TaxClassAdminTypes.List),
    controller.listAdmin,
  );

  router.get(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(TaxClassAdminTypes.GetById),
    controller.getAdmin,
  );

  router.post(
    "/",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(TaxClassTypes.Create),
    controller.create,
  );

  router.put(
    "/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(TaxClassTypes.Update),
    controller.update,
  );

  router.delete(
    "/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(TaxClassTypes.Delete),
    controller.delete,
  );
};
