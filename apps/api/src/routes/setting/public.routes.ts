import type { Router } from "express";
import { SettingTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { SettingRouteDeps } from "./index.js";

export const registerSettingPublicRoutes = (
  router: Router,
  { settingController, rateLimiter }: SettingRouteDeps,
) => {
  router.get(
    "/",
    rateLimiter,
    validateMultiple(SettingTypes.GetPublicSettings),
    settingController.getPublicSettings,
  );

  // Register /whatsapp before /:key so Express does not treat "whatsapp" as a key
  router.get(
    "/whatsapp",
    rateLimiter,
    validateMultiple(SettingTypes.GetWhatsAppContact),
    settingController.getWhatsAppContact,
  );

  router.get(
    "/:key",
    rateLimiter,
    validateMultiple(SettingTypes.GetSettingByKey),
    settingController.getByKey,
  );
};
