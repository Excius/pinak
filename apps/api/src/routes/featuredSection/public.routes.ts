import type { Router } from "express";
import { FeaturedSectionTypes } from "@repo/types";
import { validateMultiple } from "../../lib/validation.js";
import type { FeaturedSectionRouteDeps } from "./index.js";

export const registerFeaturedSectionPublicRoutes = (
  router: Router,
  { controller, rateLimiter }: FeaturedSectionRouteDeps,
) => {
  router.get(
    "/",
    rateLimiter,
    validateMultiple(FeaturedSectionTypes.ListFeaturedSections),
    controller.listPublic,
  );

  router.get(
    "/:id",
    rateLimiter,
    validateMultiple(FeaturedSectionTypes.GetFeaturedSectionById),
    controller.getByIdPublic,
  );
};
