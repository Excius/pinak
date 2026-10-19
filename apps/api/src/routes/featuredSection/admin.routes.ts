import type { Router } from "express";
import multer from "multer";
import { FeaturedSectionTypes, FeaturedSectionAdminTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { FeaturedSectionRouteDeps } from "./index.js";

export const registerFeaturedSectionAdminRoutes = (
  router: Router,
  { controller, authMiddleware, rateLimiter }: FeaturedSectionRouteDeps,
) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  }); // 10MB
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
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    upload.single("image"),
    validateMultiple(FeaturedSectionAdminTypes.AddFeaturedSectionImage),
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
    validateMultiple(FeaturedSectionAdminTypes.DeleteFeaturedSectionImage),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.deleteImage,
  );
};
