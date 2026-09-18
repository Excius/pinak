import type { Router } from "express";
import { FeaturedSectionTypes, FeaturedSectionAdminTypes } from "@repo/types";
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

  router.patch(
    "/admin/:id/restore",
    rateLimiter,
    validateMultiple(FeaturedSectionTypes.RestoreFeaturedSection),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.restore,
  );

  router.delete(
    "/admin/:id/hard",
    rateLimiter,
    validateMultiple(FeaturedSectionTypes.HardDeleteFeaturedSection),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.hardDelete,
  );

  // Admin image routes for FeaturedSection
  router.get(
    "/admin/:sectionId/images",
    rateLimiter,
    validateMultiple(FeaturedSectionAdminTypes.AdminGetFeaturedSectionImages),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.getAllImages,
  );

  router.post(
    "/admin/:sectionId/images",
    rateLimiter,
    validateMultiple(FeaturedSectionAdminTypes.AddFeaturedSectionImage),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.addFeaturedSectionImage,
  );

  router.patch(
    "/admin/images/:imageId/primary",
    rateLimiter,
    validateMultiple(FeaturedSectionAdminTypes.SetPrimaryFeaturedSectionImage),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.setPrimaryImage,
  );

  router.delete(
    "/admin/images/:id",
    rateLimiter,
    validateMultiple(FeaturedSectionAdminTypes.SoftDeleteFeaturedSectionImage),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.softDeleteImage,
  );

  router.patch(
    "/admin/images/:id/restore",
    rateLimiter,
    validateMultiple(FeaturedSectionAdminTypes.RestoreFeaturedSectionImage),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.restoreImage,
  );

  router.delete(
    "/admin/images/:id/hard",
    rateLimiter,
    validateMultiple(FeaturedSectionAdminTypes.HardDeleteFeaturedSectionImage),
    authMiddleware.authenticate,
    authMiddleware.requireAdmin,
    controller.hardDeleteImage,
  );
};
