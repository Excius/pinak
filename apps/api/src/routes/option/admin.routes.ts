import type { Router } from "express";
import { OptionAdminTypes, OptionTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { OptionRouteDeps } from "./index.js";

export const registerOptionAdminRoutes = (
  router: Router,
  { optionController, authMiddleware, rateLimiter }: OptionRouteDeps,
) => {
  // Admin read endpoints (full payloads)
  router.get(
    "/admin",
    rateLimiter,
    validateMultiple(OptionAdminTypes.ListOptions),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    optionController.listAdmin,
  );

  router.get(
    "/admin/:id",
    rateLimiter,
    validateMultiple(OptionAdminTypes.GetOptionById),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    optionController.getByIdAdmin,
  );

  // Admin write endpoints
  router.post(
    "/",
    rateLimiter,
    validateMultiple(OptionTypes.CreateOption),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    optionController.create,
  );

  router.put(
    "/:id",
    rateLimiter,
    validateMultiple(OptionTypes.UpdateOption),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    optionController.update,
  );

  router.delete(
    "/:id",
    rateLimiter,
    validateMultiple(OptionTypes.DeleteOption),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    optionController.remove,
  );

  router.post(
    "/:optionId/values",
    rateLimiter,
    validateMultiple(OptionTypes.CreateOptionValue),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    optionController.createValue,
  );

  router.put(
    "/values/:id",
    rateLimiter,
    validateMultiple(OptionTypes.UpdateOptionValue),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    optionController.updateValue,
  );

  router.delete(
    "/values/:id",
    rateLimiter,
    validateMultiple(OptionTypes.DeleteOptionValue),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    optionController.deleteValue,
  );
};
