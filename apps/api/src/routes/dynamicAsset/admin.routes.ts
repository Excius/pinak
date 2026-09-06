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
    validateMultiple(DynamicAssetAdminTypes.AdminListDynamicAssets),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.listAdmin,
  );

  // Get single asset by ID (admin)
  router.get(
    "/admin/:id",
    rateLimiter,
    validateMultiple(DynamicAssetAdminTypes.AdminGetDynamicAsset),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
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
    validateMultiple(DynamicAssetAdminTypes.UpdateDynamicAsset),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
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
    validateMultiple(DynamicAssetAdminTypes.SoftDeleteDynamicAsset),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.softDelete,
  );

  // Restore
  router.patch(
    "/admin/:id/restore",
    rateLimiter,
    validateMultiple(DynamicAssetAdminTypes.RestoreDynamicAsset),
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    controller.restore,
  );

  // Hard delete (admin only)
  router.delete(
    "/admin/:id/hard",
    rateLimiter,
    validateMultiple(DynamicAssetAdminTypes.HardDeleteDynamicAsset),
    authMiddleware.authenticate,
    authMiddleware.requireAdmin,
    controller.hardDelete,
  );
};
