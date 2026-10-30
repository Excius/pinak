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

  router.put(
    "/admin/:key",
    rateLimiter,
    authMiddleware.authenticate,
    authMiddleware.requireModeratorOrAdmin,
    validateMultiple(SettingAdminTypes.SetSetting),
    settingController.setSetting,
  );
};
