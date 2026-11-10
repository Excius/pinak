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
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(OptionAdminTypes.ListOptions),
    optionController.listAdmin,
  );

  router.get(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(OptionAdminTypes.GetOptionById),
    optionController.getByIdAdmin,
  );

  // Admin write endpoints
  router.post(
    "/",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(OptionTypes.CreateOption),
    optionController.create,
  );

  router.put(
    "/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(OptionTypes.UpdateOption),
    optionController.update,
  );

  router.delete(
    "/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(OptionTypes.DeleteOption),
    optionController.remove,
  );

  router.post(
    "/:optionId/values",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(OptionTypes.CreateOptionValue),
    optionController.createValue,
  );

  router.put(
    "/values/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(OptionTypes.UpdateOptionValue),
    optionController.updateValue,
  );

  router.delete(
    "/values/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(OptionTypes.DeleteOptionValue),
    optionController.deleteValue,
  );
};
