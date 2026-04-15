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
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(ComboKitTypes.GetComboKits),
    comboController.getComboKits,
  );

  router.get(
    "/search",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(ComboKitTypes.SearchComboKits),
    comboController.searchComboKits,
  );

  router.get(
    "/slug/:slug",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(ComboKitTypes.GetComboKitBySlug),
    comboController.getComboKitBySlug,
  );

  router.get(
    "/:id/items",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(ComboKitTypes.GetComboKitItems),
    comboController.getComboKitItems,
  );

  router.get(
    "/:id",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(ComboKitTypes.GetComboKitById),
    comboController.getComboKitById,
  );

  router.patch(
    "/:id/increment-view",
    authMiddleware.authenticate,
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
