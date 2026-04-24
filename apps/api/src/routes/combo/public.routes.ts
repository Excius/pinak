import type { Router } from "express";
import { ComboKitTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { ComboRouteDeps } from "./index.js";

export const registerComboPublicRoutes = (
  router: Router,
  { comboController, authMiddleware, rateLimiter }: ComboRouteDeps,
) => {
  router.get(
    "/",
    rateLimiter,
    validateMultiple(ComboKitTypes.GetComboKits),
    comboController.getComboKits,
  );

  router.get(
    "/search",
    rateLimiter,
    validateMultiple(ComboKitTypes.SearchComboKits),
    comboController.searchComboKits,
  );

  router.get(
    "/slug/:slug",
    rateLimiter,
    validateMultiple(ComboKitTypes.GetComboKitBySlug),
    comboController.getComboKitBySlug,
  );

  router.get(
    "/:id/items",
    rateLimiter,
    validateMultiple(ComboKitTypes.GetComboKitItems),
    comboController.getComboKitItems,
  );

  router.get(
    "/:id",
    rateLimiter,
    validateMultiple(ComboKitTypes.GetComboKitById),
    comboController.getComboKitById,
  );

  router.patch(
    "/:id/increment-view",
    rateLimiter,
    validateMultiple(ComboKitTypes.IncrementComboKitView),
    comboController.incrementComboKitView,
  );

  router.patch(
    "/:id/increment-purchase",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(ComboKitTypes.IncrementComboKitPurchase),
    comboController.incrementComboKitPurchase,
  );
};
