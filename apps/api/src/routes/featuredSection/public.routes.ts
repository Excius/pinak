import type { Router } from "express";
import { FeaturedSectionTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { FeaturedSectionRouteDeps } from "./index.js";

export const registerFeaturedSectionPublicRoutes = (
  router: Router,
  { controller, authMiddleware, rateLimiter }: FeaturedSectionRouteDeps,
) => {
  router.get(
    "/",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(FeaturedSectionTypes.ListFeaturedSections),
    controller.listPublic,
  );

  router.get(
    "/:id",
    authMiddleware.authenticate,
    rateLimiter,
    validateMultiple(FeaturedSectionTypes.GetFeaturedSectionById),
    controller.getByIdPublic,
  );
};
