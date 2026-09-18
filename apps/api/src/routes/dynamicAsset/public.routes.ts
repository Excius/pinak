import type { Router } from "express";
import { DynamicAssetTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { DynamicAssetRouteDeps } from "./index.js";

export const registerDynamicAssetPublicRoutes = (
  router: Router,
  { controller, rateLimiter }: DynamicAssetRouteDeps,
) => {
  router.get(
    "/",
    rateLimiter,
    validateMultiple(DynamicAssetTypes.ListDynamicAssets),
    controller.listPublic,
  );

  router.get(
    "/:slug",
    rateLimiter,
    validateMultiple(DynamicAssetTypes.GetDynamicAssetBySlug),
    controller.getBySlugPublic,
  );
};
