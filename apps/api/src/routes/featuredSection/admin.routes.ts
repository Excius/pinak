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
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FeaturedSectionTypes.AdminListFeaturedSections),
    controller.listAdmin,
  );

  router.get(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FeaturedSectionTypes.AdminGetFeaturedSectionById),
    controller.getByIdAdmin,
  );

  router.post(
    "/admin",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FeaturedSectionTypes.CreateFeaturedSection),
    controller.create,
  );

  router.put(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FeaturedSectionTypes.UpdateFeaturedSection),
    controller.update,
  );

  router.delete(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FeaturedSectionTypes.DeleteFeaturedSection),
    controller.delete,
  );

  router.patch(
    "/admin/:id/restore",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FeaturedSectionTypes.RestoreFeaturedSection),
    controller.restore,
  );

  router.delete(
    "/admin/:id/hard",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FeaturedSectionTypes.HardDeleteFeaturedSection),
    controller.hardDelete,
  );

  // Admin image routes for FeaturedSection
  router.get(
    "/admin/:sectionId/images",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FeaturedSectionAdminTypes.AdminGetFeaturedSectionImages),
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
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FeaturedSectionAdminTypes.SetPrimaryFeaturedSectionImage),
    controller.setPrimaryImage,
  );

  router.delete(
    "/admin/images/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(FeaturedSectionAdminTypes.DeleteFeaturedSectionImage),
    controller.deleteImage,
  );
};
