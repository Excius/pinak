import type { Router } from "express";
import multer from "multer";
import { DynamicAssetAdminTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { DynamicAssetRouteDeps } from "./index.js";

export const registerDynamicAssetAdminRoutes = (
  router: Router,
  { controller, authMiddleware, rateLimiter }: DynamicAssetRouteDeps,
) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });

  // List all assets (admin)
  router.get(
    "/admin/all",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(DynamicAssetAdminTypes.AdminListDynamicAssets),
    controller.listAdmin,
  );

  // Get single asset by ID (admin)
  router.get(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(DynamicAssetAdminTypes.AdminGetDynamicAsset),
    controller.getByIdAdmin,
  );

  // Create asset (with file upload)
  router.post(
    "/admin",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    upload.single("file"),
    validateMultiple(DynamicAssetAdminTypes.CreateDynamicAsset),
    controller.create,
  );

  // Update asset metadata
  router.patch(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(DynamicAssetAdminTypes.UpdateDynamicAsset),
    controller.update,
  );

  // Replace asset file
  router.put(
    "/admin/:id/file",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    upload.single("file"),
    validateMultiple(DynamicAssetAdminTypes.ReplaceAssetFile),
    controller.replaceFile,
  );

  // Soft delete
  router.delete(
    "/admin/:id",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(DynamicAssetAdminTypes.SoftDeleteDynamicAsset),
    controller.softDelete,
  );

  // Restore
  router.patch(
    "/admin/:id/restore",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(DynamicAssetAdminTypes.RestoreDynamicAsset),
    controller.restore,
  );

  // Hard delete (admin only)
  router.delete(
    "/admin/:id/hard",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireAdmin,
    validateMultiple(DynamicAssetAdminTypes.HardDeleteDynamicAsset),
    controller.hardDelete,
  );
};
