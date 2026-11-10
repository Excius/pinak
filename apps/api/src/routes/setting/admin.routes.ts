import type { Router } from "express";
import { SettingAdminTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { SettingRouteDeps } from "./index.js";

export const registerSettingAdminRoutes = (
  router: Router,
  { settingController, authMiddleware, rateLimiter }: SettingRouteDeps,
) => {
  router.get(
    "/admin",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(SettingAdminTypes.ListSettings),
    settingController.listAdmin,
  );

  router.put(
    "/admin",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(SettingAdminTypes.UpdateSettings),
    settingController.updateSettings,
  );

  // Typed store settings. Registered before "/admin/:key" so they are not captured by it.
  router.get(
    "/admin/shipping",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(SettingAdminTypes.GetShippingConfig),
    settingController.getShippingConfig,
  );

  router.put(
    "/admin/shipping",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireAdmin,
    validateMultiple(SettingAdminTypes.UpdateShippingConfig),
    settingController.updateShippingConfig,
  );

  router.get(
    "/admin/supplier",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(SettingAdminTypes.GetSupplierDetails),
    settingController.getSupplierDetails,
  );

  router.put(
    "/admin/supplier",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireAdmin,
    validateMultiple(SettingAdminTypes.UpdateSupplierDetails),
    settingController.updateSupplierDetails,
  );

  router.put(
    "/admin/:key",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(SettingAdminTypes.SetSetting),
    settingController.setSetting,
  );
};
