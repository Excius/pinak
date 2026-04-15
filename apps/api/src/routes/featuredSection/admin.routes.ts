import type { Router } from "express";
import { FeaturedSectionTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { FeaturedSectionRouteDeps } from "./index.js";

export const registerFeaturedSectionAdminRoutes = (
  router: Router,
  { controller, authMiddleware, rateLimiter }: FeaturedSectionRouteDeps,
) => {
  router.get(
    "/admin/all",
    rateLimiter,
    validateMultiple(FeaturedSectionTypes.AdminListFeaturedSections),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.listAdmin,
  );

  router.get(
    "/admin/:id",
    rateLimiter,
    validateMultiple(FeaturedSectionTypes.AdminGetFeaturedSectionById),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.getByIdAdmin,
  );

  router.post(
    "/admin",
    rateLimiter,
    validateMultiple(FeaturedSectionTypes.CreateFeaturedSection),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.create,
  );

  router.put(
    "/admin/:id",
    rateLimiter,
    validateMultiple(FeaturedSectionTypes.UpdateFeaturedSection),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.update,
  );

  router.delete(
    "/admin/:id",
    rateLimiter,
    validateMultiple(FeaturedSectionTypes.DeleteFeaturedSection),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.delete,
  );
};
